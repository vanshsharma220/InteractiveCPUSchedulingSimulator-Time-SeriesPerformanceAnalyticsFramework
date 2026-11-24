
import mysql from 'mysql2/promise';

let pool = null;

export async function connectMySQL(env) {
    try {
        const base = {
            host: env.MYSQL_HOST || '127.0.0.1',
            port: Number(env.MYSQL_PORT || 3306),
            user: env.MYSQL_USER || 'root',
            password: env.MYSQL_PASSWORD || '',
            waitForConnections: true,
            connectionLimit: 8,
            decimalNumbers: true
        };

        const bootstrap = await mysql.createConnection({
            ...base,
            multipleStatements: false
        });

        const db = (env.MYSQL_DATABASE || 'algovis_db')
            .replace(/[^a-zA-Z0-9_]/g, '');

        await bootstrap.query(
            `CREATE DATABASE IF NOT EXISTS \`${db}\`
             CHARACTER SET utf8mb4
             COLLATE utf8mb4_unicode_ci`
        );

        await bootstrap.end();

        pool = mysql.createPool({
            ...base,
            database: db
        });

        // Create the simulations table.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS simulations (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                label VARCHAR(120) NOT NULL,
                algorithm VARCHAR(32) NOT NULL,
                quantum INT NULL,
                processes_json JSON NOT NULL,
                result_json JSON NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_sim_algorithm_created (algorithm, created_at)
            )
        `);

        // Create the database benchmarks table.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS db_benchmarks (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                engine VARCHAR(20) NOT NULL,
                operation_name VARCHAR(32) NOT NULL,
                records_count INT NOT NULL,
                duration_ms DECIMAL(12,3) NOT NULL,
                operations_per_second DECIMAL(14,3) NOT NULL,
                status VARCHAR(20) NOT NULL,
                details_json JSON NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_benchmark_engine_created (engine, created_at)
            )
        `);

        // Create the audit events table.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_events (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                event_type VARCHAR(60) NOT NULL,
                message VARCHAR(500) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create the lab students table.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS lab_students (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(80) NOT NULL,
                department VARCHAR(50) NOT NULL,
                score INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_student_department (department)
            )
        `);

        // Check whether student records already exist.
        const [[{ n }]] = await pool.query(
            'SELECT COUNT(*) AS n FROM lab_students'
        );

        // Insert sample records if the table is empty.
        if (!n) {
            await pool.query(
                `INSERT INTO lab_students
                    (name, department, score)
                 VALUES
                    (?, ?, ?),
                    (?, ?, ?),
                    (?, ?, ?),
                    (?, ?, ?),
                    (?, ?, ?)`,
                [
                    'Aarav', 'CSE', 86,
                    'Diya', 'IT', 92,
                    'Kabir', 'CSE', 74,
                    'Meera', 'ECE', 88,
                    'Rohan', 'IT', 67
                ]
            );
        }

        console.log(
            `MySQL connected; database "${db}" and tables are ready.`
        );

        return { ok: true };

    } catch (e) {
        pool = null;

        console.warn(
            `MySQL unavailable: ${e.message}\n` +
            'Check that MySQL is running and server/.env has ' +
            'the correct MYSQL_USER and MYSQL_PASSWORD.'
        );

        return {
            ok: false,
            error: e.message
        };
    }
}

export function mysqlPool() {
    return pool;
}

export async function closeMySQL() {
    await pool?.end();
}
