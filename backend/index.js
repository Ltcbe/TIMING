
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgres://sncb_user:secure_password@db:5432/sncb_timing'
});

app.get('/api/trains', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        train_id AS "trainNumber",
        departure_station AS "departureStation",
        arrival_station AS "arrivalStation",
        delay AS "delayMinutes",
        scheduled_time AS "scheduledTime",
        actual_time AS "actualTime",
        timestamp
      FROM train_delays
      ORDER BY id DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
