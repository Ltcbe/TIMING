const express = require('express');
const { Pool } = require('pg');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgres://sncb_user:secure_password@db:5432/sncb_timing'
});

// ✅ Vérifie si les arrêts sont déjà stockés pour ce trajet et encore valides (<30 min)
async function isStopsCached(trainId, trainTimestamp) {
  const result = await pool.query(
    `SELECT MAX(arrival_time) AS latest_arrival
     FROM train_stops
     WHERE train_id = $1 AND train_timestamp = $2`,
    [trainId, trainTimestamp]
  );

  const latestArrival = result.rows[0].latest_arrival;
  if (!latestArrival) return false;

  const now = new Date();
  const diffMinutes = (now - new Date(latestArrival)) / (1000 * 60);
  return diffMinutes <= 30;
}

// 💾 Insère les arrêts dans la base
async function cacheIntermediateStops(trainId, trainTimestamp, stops) {
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    await pool.query(
      `INSERT INTO train_stops (train_id, stop_order, station, arrival_time, departure_time, train_timestamp)
       VALUES ($1, $2, $3, to_timestamp($4), to_timestamp($5), $6)`,
      [trainId, i + 1, stop.station, stop.arrival, stop.departure, trainTimestamp]
    );
  }
}

// 🌐 Récupère les arrêts depuis l’API SNCB
async function fetchAndCacheStops(trainId, trainTimestamp) {
  const date = trainTimestamp.toISOString().split('T')[0];
  const url = `https://api.irail.be/vehicle/${trainId}?format=json&lang=fr&date=${date}`;

  const response = await fetch(url);
  const data = await response.json();

  const stops = (data.stops?.stop || []).map((stop) => ({
    station: stop.station,
    arrival: stop.arrival?.time || stop.scheduledArrivalTime,
    departure: stop.departure?.time || stop.scheduledDepartureTime
  }));

  await cacheIntermediateStops(trainId, trainTimestamp, stops);
  return stops;
}

// 📥 Route API pour obtenir les arrêts d’un train
app.get('/api/trains/:trainId/stops', async (req, res) => {
  const { trainId } = req.params;

  const result = await pool.query(
    'SELECT * FROM train_delays WHERE train_id = $1 ORDER BY timestamp DESC LIMIT 1',
    [trainId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Train non trouvé en base.' });
  }

  const train = result.rows[0];
  const trainTimestamp = new Date(train.timestamp);

  try {
    const cached = await isStopsCached(trainId, trainTimestamp);

    if (cached) {
      const cachedStops = await pool.query(
        `SELECT stop_order, station, arrival_time, departure_time
         FROM train_stops
         WHERE train_id = $1 AND train_timestamp = $2
         ORDER BY stop_order ASC`,
        [trainId, trainTimestamp]
      );
      return res.json({ source: 'db', stops: cachedStops.rows });
    } else {
      const liveStops = await fetchAndCacheStops(trainId, trainTimestamp);
      return res.json({ source: 'api', stops: liveStops });
    }
  } catch (error) {
    console.error('Erreur :', error);
    return res.status(500).json({ error: 'Erreur interne serveur' });
  }
});

app.listen(port, () => {
  console.log(`🚀 API SNCB Timing en ligne sur http://localhost:${port}`);
});
