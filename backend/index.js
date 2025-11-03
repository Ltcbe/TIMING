const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fetch = require('node-fetch');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'sncb_user',
  host: 'db',
  database: 'sncb_timing',
  password: 'secure_password',
  port: 5432,
});

// ✅ Route pour afficher tous les trains enregistrés
app.get('/api/trains', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT train_id FROM train_delays ORDER BY train_id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des trains :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ✅ Route pour afficher les arrêts d’un train
app.get('/api/trains/:trainId/stops', async (req, res) => {
  const trainId = req.params.trainId;

  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);

    const dbResult = await pool.query(
      `SELECT * FROM train_delays WHERE train_id = $1 AND actual_time >= $2 ORDER BY scheduled_time`,
      [trainId, thirtyMinutesAgo]
    );

    if (dbResult.rows.length > 0) {
      return res.json(dbResult.rows);
    }

    const response = await fetch(`https://api.irail.be/vehicle/?id=${trainId}&format=json`);
    const data = await response.json();

    const stopTimes = data.stops?.stop || [];

    for (const stop of stopTimes) {
      const delay = parseInt(stop.delay, 10) / 60;

      await pool.query(
        `INSERT INTO train_delays (train_id, departure_station, arrival_station, scheduled_time, actual_time, delay)
         VALUES ($1, $2, $3, to_timestamp($4), to_timestamp($5), $6)`,
        [
          trainId,
          stop.station,
          stop.station, // à ajuster selon logique
          stop.scheduledDepartureTime || stop.scheduledArrivalTime,
          stop.time,
          isNaN(delay) ? 0 : delay,
        ]
      );
    }

    const updatedResult = await pool.query(
      `SELECT * FROM train_delays WHERE train_id = $1 AND actual_time >= $2 ORDER BY scheduled_time`,
      [trainId, thirtyMinutesAgo]
    );

    res.json(updatedResult.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des arrêts :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(port, () => {
  console.log(`🚀 API SNCB Timing en ligne sur http://localhost:${port}`);
});
