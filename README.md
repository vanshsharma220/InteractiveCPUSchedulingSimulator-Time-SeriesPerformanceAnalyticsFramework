# AlgoVis-DB v2

An educational OS + DBMS lab. The Express server serves the frontend and API from **one origin at http://localhost:3000**. CPU scheduling is calculated on the Node backend; the frontend animates the backend-produced Gantt timeline.

## Run it

1. Install Node.js (Node 18+ recommended) and MySQL 8.0. MongoDB is optional for the UI, but required for a real MySQL-vs-MongoDB benchmark.
2. Extract the ZIP, open the extracted `AlgoVis-DB-v2` folder in VS Code, and run `./start.ps1` in PowerShell. The script creates `server/.env` the first time and opens it in Notepad. Set `MYSQL_PASSWORD` to your actual MySQL password, save the file, then run `./start.ps1` again. It installs Node dependencies once and starts the server. Alternatively, use the manual commands below:
   ```powershell
   cd .\server
   Copy-Item .env.example .env
   # Edit .env and set MYSQL_PASSWORD to your real MySQL password
   npm install
   npm start
   ```
3. Open **http://localhost:3000**. Keep the server terminal open.

The server attempts to create `algovis_db` and its tables automatically, so the configured MySQL account must be allowed to create a database and tables. For a typical local MySQL 8 installation, use `MYSQL_USER=root` and set `MYSQL_PASSWORD` to the exact password you use when signing in to MySQL. If root has no password, leave it blank. Do not put quotes around the password in `.env`. A wrong password cannot be repaired by the app. If automatic setup is blocked by permissions, run `database/setup-mysql.sql` in MySQL Workbench as an administrator, then configure a user with the required privileges. Restart the server after changing `.env`.

MongoDB defaults to `mongodb://127.0.0.1:27017`. Start the local MongoDB service or replace `MONGODB_URI` with your Atlas connection string in `.env`. If MongoDB is unavailable, CPU scheduling and the SQL playground still work, but the benchmark will clearly show MongoDB as unavailable.

## Included

- FCFS, SJF (non-preemptive), SRTF (preemptive), Priority (preemptive and non-preemptive), and Round Robin. Each algorithm has its own JavaScript backend file in `server/src/schedulers/`. The `cpp-engine/src/` directory also contains separate standalone C++ reference implementations for all six algorithms; these are optional and are not needed to run the web app.
- Backend-calculated metrics and timeline; frontend Play/Pause, Step, Reset, speed control, comparison, and simulation history.
- Real MySQL read-only query console: SELECT, SHOW, DESCRIBE, EXPLAIN. It includes aggregate, GROUP BY, HAVING and index-plan examples. One statement at a time; writes are blocked in the console intentionally.
- Transaction demo in `server/src/db/transactions.js` that inserts a temporary row in a transaction and rolls it back, so you can observe the effect safely.
- Indexed-read benchmark against MySQL and MongoDB when both are configured.

## Files worth reading first

- `server/src/index.js` — Express API and static frontend server.
- `server/src/schedulers/` — one algorithm per file plus shared validation/metrics.
- `server/src/db/mysql.js` — MySQL connection, automatic database/table setup, sample SQL table.
- `server/src/db/mongodb.js` — MongoDB connection.
- `server/src/db/transactions.js` — transaction and rollback demo.
- `database/setup-mysql.sql` — optional manual MySQL schema setup.
- `cpp-engine/src/` — optional standalone C++ scheduling reference files.
- `start.ps1` — Windows one-command launcher after `.env` has been configured.
- `frontend/app.js` — API calls and timeline animation.

## Notes

- The SQL console is deliberately read-only to prevent accidental destructive queries. Use the rollback demo to learn transaction behavior.
- Benchmark numbers are local measurements, not a universal ranking. Dataset size, indexing, cache warmth, DB location and hardware affect results.
- If port 3000 is already occupied, change `PORT` in `.env`.
