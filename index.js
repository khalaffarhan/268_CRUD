const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mahasiswa',
    password: 'Kadirojo7',
    port: 5432,
});

app.use(express.json());

app.get('/biodata', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM biodata');

        res.status(200).json({
            message: 'Berhasil mengambil data biodata',
            data: result.rows
        });
    }
    catch (err) {
        console.error('Error fetching biodata:', err);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server atau database'
        });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}/biodata`);
});

// POST - tambah data biodata baru
app.post('/biodata', async (req, res) => {
    try {
        const data = req.body;
        const columns = Object.keys(data);
        const values = Object.values(data);

        if (columns.length === 0) {
            return res.status(400).json({
                message: 'Data tidak boleh kosong'
            });
        }

        const columnNames = columns.join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        const query = `INSERT INTO biodata (${columnNames}) VALUES (${placeholders}) RETURNING *`;
        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Berhasil menambahkan data biodata',
            data: result.rows[0]
        });
    }
    catch (err) {
        console.error('Error adding biodata:', err);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server atau database'
        });
    }
});

// PUT - update data biodata berdasarkan id
app.put('/biodata/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const columns = Object.keys(data);
        const values = Object.values(data);

        if (columns.length === 0) {
            return res.status(400).json({
                message: 'Data tidak boleh kosong'
            });
        }

        const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

        const query = `UPDATE biodata SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
        const result = await pool.query(query, [...values, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Data biodata tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Berhasil memperbarui data biodata',
            data: result.rows[0]
        });
    }
    catch (err) {
        console.error('Error updating biodata:', err);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server atau database'
        });
    }
});

// DELETE - hapus data biodata berdasarkan id
app.delete('/biodata/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM biodata WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Data biodata tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Berhasil menghapus data biodata',
            data: result.rows[0]
        });
    }
    catch (err) {
        console.error('Error deleting biodata:', err);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server atau database'
        });
    }
});