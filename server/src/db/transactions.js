
import { mysqlPool } from './mysql.js';

// Educational transaction:
// Insert a temporary row, show it exists, then roll it back.
export async function demonstrateRollback() {
    const pool = mysqlPool();

    if (!pool) {
        throw new Error('MySQL is not connected.');
    }

    const conn = await pool.getConnection();

    try {
        // Start the transaction.
        await conn.beginTransaction();

        // Insert a temporary student record.
        const [insert] = await conn.execute(
            `INSERT INTO lab_students
                (name, department, score)
             VALUES (?, ?, ?)`,
            ['ROLLBACK DEMO', 'LAB', 0]
        );

        // Check that the row exists inside the transaction.
        const [inside] = await conn.execute(
            `SELECT id, name, department, score
             FROM lab_students
             WHERE id = ?`,
            [insert.insertId]
        );

        // Undo the insert.
        await conn.rollback();

        // Check whether the row exists after rollback.
        const [after] = await conn.execute(
            `SELECT id
             FROM lab_students
             WHERE id = ?`,
            [insert.insertId]
        );

        return {
            transaction: 'ROLLBACK',
            insideTransaction: inside,
            existsAfterRollback: after.length > 0,
            explanation:
                'The row was visible inside the transaction, then removed by ROLLBACK.'
        };

    } catch (e) {
        // Undo any pending transaction changes if an error occurs.
        await conn.rollback();
        throw e;

    } finally {
        // Return the connection to the pool.
        conn.release();
    }
}
