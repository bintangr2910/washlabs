// server.js

// 1. Setup Environment dan Dependencies
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Koneksi ke PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Cek koneksi saat server dimulai 
pool.connect()
  .then(() => console.log('✅ Terkoneksi ke PostgreSQL'))
  .catch(err => console.error('❌ GAGAL terkoneksi ke database. Cek file .env Anda:', err.stack));

// 3. Konfigurasi Middleware
app.use(express.json()); // Mengizinkan parsing body dari JSON
app.use(cors()); // Mengizinkan CORS untuk akses dari front-end lokal


// ===============================================
// 4. API ROUTES (Endpoint: /api/orders)
// ===============================================

// A. GET /api/orders: Ambil semua pesanan (untuk loadOrders)
app.get('/api/orders', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, name, item, quantity, status, created_at FROM orders';
    let values = [];

    // Jika ada parameter search, filter berdasarkan nama (tracking.html)
    if (search) {
      query += ' WHERE name ILIKE $1';
      values.push(`%${search}%`); 
    }
    
    query += ' ORDER BY created_at DESC;';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data pesanan.' });
  }
});

// B. POST /api/orders: Tambah pesanan baru (untuk addOrder)
app.post('/api/orders', async (req, res) => {
  const { name, item, quantity } = req.body;
  
  if (!name || !item || !quantity) {
    return res.status(400).json({ error: 'Nama, item, dan quantity harus diisi.' });
  }

  try {
    // Diasumsikan status default di database adalah 'Menunggu'
    const text = 'INSERT INTO orders(name, item, quantity) VALUES($1, $2, $3) RETURNING *';
    const values = [name, item, quantity]; 
    const result = await pool.query(text, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menambahkan pesanan.' });
  }
});

// C. PUT /api/orders/:id: Update status pesanan (untuk updateStatus)
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status baru harus disediakan.' });
  }

  try {
    const text = 'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *';
    const values = [status, id];
    const result = await pool.query(text, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengupdate status pesanan.' });
  }
});

// D. DELETE /api/orders/:id: Hapus pesanan (untuk deleteOrder)
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const text = 'DELETE FROM orders WHERE id = $1 RETURNING *';
    const result = await pool.query(text, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }
    res.json({ message: 'Pesanan berhasil dihapus.', deletedId: id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus pesanan.' });
  }
});

// 5. Menjalankan Server
app.listen(PORT, () => {
  console.log(`🚀 Server API berjalan di http://localhost:${PORT}`);
});