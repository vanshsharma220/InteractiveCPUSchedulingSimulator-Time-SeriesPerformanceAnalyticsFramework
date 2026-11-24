import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  connectMySQL,
  mysqlPool,
  closeMySQL
} from './db/mysql.js';

import {
  connectMongo,
  mongoDb,
  closeMongo
} from './db/mongodb.js';

import { demonstrateRollback } from './db/transactions.js';

import {
  runScheduler,
  ALGORITHMS
} from './schedulers/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../');

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(root, 'frontend')));

await connectMySQL(process.env);
await connectMongo(process.env);

const log = async (type, message) => {
  const p = mysqlPool();

  if (p) {
    try {
      await p.execute(
        'INSERT INTO audit_events(event_type,message) VALUES (?,?)',
        [type, message]
      );
    } catch {}
  }
};

app.get('/api/health', async (_req, res) => {
  let mysql = 'unavailable';
  let mongodb = mongoDb() ? 'connected' : 'unavailable';

  try {
    if (mysqlPool()) {
      await mysqlPool().query('SELECT 1');
      mysql = 'connected';
    }
  } catch {}

  res.json({
    ok: true,
    service: 'AlgoVis-DB',
    mysql,
    mongodb,
    algorithms: ALGORITHMS
  });
});

app.get('/api/algorithms', (_req, res) => {
  res.json({ algorithms: ALGORITHMS });
});

app.post('/api/simulate', async (req, res) => {
  try {
    const {
      processes,
      algorithm = 'FCFS',
      quantum = 2,
      label = 'Untitled simulation'
    } = req.body;

    const result = runScheduler(processes, algorithm, quantum);

    let id = null;
    let saved = false;

    const p = mysqlPool();

    if (p) {
      const [r] = await p.execute(
        `INSERT INTO simulations
        (label, algorithm, quantum, processes_json, result_json)
        VALUES (?, ?, ?, ?, ?)`,
        [
          String(label || 'Untitled').slice(0, 120),
          algorithm,
          algorithm === 'RR' ? Number(quantum) : null,
          JSON.stringify(processes),
          JSON.stringify(result)
        ]
      );

      id = r.insertId;
      saved = true;
    }

    await log(
      'simulation',
      `${algorithm} simulated (${result.processes.length} processes)`
    );

    res.json({ id, saved, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/history', async (_req, res) => {
  const p = mysqlPool();

  if (!p) {
    return res.status(503).json({
      error: 'MySQL unavailable. Check server/.env and start MySQL.'
    });
  }

  try {
    const [rows] = await p.query(
      `SELECT id, label, algorithm, quantum, created_at,
      processes_json, result_json
      FROM simulations
      ORDER BY id DESC
      LIMIT 100`
    );

    res.json(
      rows.map(r => ({
        ...r,
        processes_json:
          typeof r.processes_json === 'string'
            ? JSON.parse(r.processes_json)
            : r.processes_json,
        result_json:
          typeof r.result_json === 'string'
            ? JSON.parse(r.result_json)
            : r.result_json
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/history/:id', async (req, res) => {
  const p = mysqlPool();

  if (!p) {
    return res.status(503).json({ error: 'MySQL unavailable' });
  }

  try {
    const [r] = await p.execute(
      'DELETE FROM simulations WHERE id = ?',
      [Number(req.params.id)]
    );

    res.json({ deleted: r.affectedRows });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/dbms/info', (_req, res) => {
  res.json({
    mysql: !!mysqlPool(),
    mongodb: !!mongoDb(),
    examples: [
      'SELECT department, COUNT(*) AS students FROM lab_students GROUP BY department HAVING COUNT(*) > 0',
      'SELECT * FROM lab_students WHERE score >= 80 ORDER BY score DESC',
      "EXPLAIN SELECT * FROM lab_students WHERE department = 'CSE'"
    ]
  });
});

app.post('/api/dbms/query', async (req, res) => {
  const sql = String(req.body.sql || '')
    .trim()
    .replace(/;\s*$/, '');

  if (!sql) {
    return res.status(400).json({ error: 'Enter a SQL query.' });
  }

  if (!/^(SELECT|SHOW|DESCRIBE|DESC|EXPLAIN)\b/i.test(sql)) {
    return res.status(400).json({
      error:
        'For safety, the SQL console allows read-only SELECT, SHOW, DESCRIBE and EXPLAIN queries. Use the transaction demo for rollback.'
    });
  }

  if (sql.includes(';')) {
    return res.status(400).json({
      error: 'Run one SQL statement at a time.'
    });
  }

  const p = mysqlPool();

  if (!p) {
    return res.status(503).json({
      error:
        'MySQL is unavailable. Set correct credentials in server/.env and restart.'
    });
  }

  try {
    const start = process.hrtime.bigint();

    const [rows, fields] = await p.query({
      sql,
      timeout: 5000
    });

    const durationMs =
      Number(process.hrtime.bigint() - start) / 1e6;

    res.json({
      rows,
      columns: fields?.map(f => f.name) || [],
      rowCount: Array.isArray(rows) ? rows.length : 0,
      durationMs: Number(durationMs.toFixed(3))
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/dbms/transaction-demo', async (_req, res) => {
  try {
    res.json(await demonstrateRollback());
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/dbms/benchmark', async (req, res) => {
  const count = Math.max(
    100,
    Math.min(10000, Math.floor(Number(req.body.count) || 1000))
  );

  const repeats = Math.max(
    1,
    Math.min(5, Math.floor(Number(req.body.repeats) || 3))
  );

  const results = [];
  const p = mysqlPool();
  const m = mongoDb();

  if (p) {
    try {
      await p.query(`
        CREATE TABLE IF NOT EXISTS benchmark_records (
          id BIGINT PRIMARY KEY,
          payload VARCHAR(120) NOT NULL,
          category INT NOT NULL,
          INDEX idx_bench_category(category)
        )
      `);

      const [[{ n }]] = await p.query(
        'SELECT COUNT(*) AS n FROM benchmark_records'
      );

      if (n < count) {
        for (let start = n; start < count; start += 500) {
          const vals = Array.from(
            { length: Math.min(500, count - start) },
            (_, i) => [
              start + i + 1,
              `record-${start + i + 1}`,
              (start + i) % 100
            ]
          );

          await p.query(
            'INSERT IGNORE INTO benchmark_records(id,payload,category) VALUES ?',
            [vals]
          );
        }
      }

      for (let i = 0; i < repeats; i++) {
        const t = process.hrtime.bigint();

        const [rows] = await p.execute(
          'SELECT id,payload,category FROM benchmark_records WHERE category=? LIMIT 100',
          [42]
        );

        const ms =
          Number(process.hrtime.bigint() - t) / 1e6;

        results.push({
          engine: 'MySQL',
          operation: 'indexed-read',
          records: rows.length,
          durationMs: +ms.toFixed(3),
          opsPerSecond: +(
            1000 / Math.max(ms, 0.001)
          ).toFixed(2)
        });
      }
    } catch (e) {
      results.push({
        engine: 'MySQL',
        error: e.message
      });
    }
  } else {
    results.push({
      engine: 'MySQL',
      error:
        'Not connected. Configure MySQL credentials in server/.env.'
    });
  }

  if (m) {
    try {
      const c = m.collection('benchmark_records');
      const n = await c.countDocuments();

      if (n < count) {
        for (let start = n; start < count; start += 500) {
          await c.insertMany(
            Array.from(
              { length: Math.min(500, count - start) },
              (_, i) => ({
                id: start + i + 1,
                payload: `record-${start + i + 1}`,
                category: (start + i) % 100
              })
            ),
            { ordered: false }
          );
        }
      }

      await c.createIndex({ category: 1 });

      for (let i = 0; i < repeats; i++) {
        const t = process.hrtime.bigint();

        const rows = await c
          .find({ category: 42 })
          .limit(100)
          .toArray();

        const ms =
          Number(process.hrtime.bigint() - t) / 1e6;

        results.push({
          engine: 'MongoDB',
          operation: 'indexed-read',
          records: rows.length,
          durationMs: +ms.toFixed(3),
          opsPerSecond: +(
            1000 / Math.max(ms, 0.001)
          ).toFixed(2)
        });
      }
    } catch (e) {
      results.push({
        engine: 'MongoDB',
        error: e.message
      });
    }
  } else {
    results.push({
      engine: 'MongoDB',
      error:
        'Not connected. Start local MongoDB or set MONGODB_URI.'
    });
  }

  for (const r of results.filter(x => !x.error)) {
    if (p) {
      try {
        await p.execute(
          `INSERT INTO db_benchmarks
          (engine, operation_name, records_count, duration_ms,
          operations_per_second, status, details_json)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            r.engine,
            r.operation,
            r.records,
            r.durationMs,
            r.opsPerSecond,
            'ok',
            JSON.stringify(r)
          ]
        );
      } catch {}
    }
  }

  res.json({
    count,
    repeats,
    results,
    interpretation:
      'This is a small indexed-read demo. Results depend on indexes, warm caches, dataset, hardware and database location. Compare multiple trials; this does not prove one database is always faster.'
  });
});

app.get('/api/dbms/sql-examples', (_req, res) => {
  res.json([
    {
      title: 'Filter and sort',
      sql: 'SELECT name, department, score FROM lab_students WHERE score >= 80 ORDER BY score DESC'
    },
    {
      title: 'GROUP BY + aggregate + HAVING',
      sql: 'SELECT department, COUNT(*) AS students, AVG(score) AS avg_score FROM lab_students GROUP BY department HAVING COUNT(*) > 0'
    },
    {
      title: 'Index query plan',
      sql: "EXPLAIN SELECT * FROM lab_students WHERE department = 'CSE'"
    },
    {
      title: 'Show available tables',
      sql: 'SHOW TABLES'
    }
  ]);
});

app.get('*', (req, res) =>
  res.sendFile(path.join(root, 'frontend', 'index.html'))
);

const PORT = Number(process.env.PORT || 3000);

const server = app.listen(PORT, '127.0.0.1', () =>
  console.log(`
AlgoVis-DB ready: http://localhost:${PORT}
Keep this terminal open. Press Ctrl+C to stop.
`)
);

async function shutdown() {
  server.close();
  await closeMySQL();
  await closeMongo();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);