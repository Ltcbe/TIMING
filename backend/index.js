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

// Fonction pour récupérer les arrêts intermédiaires
async function getIntermediateStops(trainId, date) {
  try {
    const response = await fetch(`https://api.irail.be/connections/?format=json&departureTime=now&language=fr&trainId=${trainId}&date=${date}`);
    const data = await response.json();
    if (data.connection && data.connection.length > 0) {
      const stops = data.connection[0].vias?.via || [];
      return stops.map(stop => ({
        station: stop.station,
        arrival: stop.arrival.time,
        departure: stop.departure.time
      }));
    }
    return [];
  } catch (error) {
    console.error(`Erreur récupération arrêts pour train ${trainId}:`, error.message);
    return [];
  }
}

// Route API
app.get('/api/trains', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM train_delays ORDER BY id DESC LIMIT 10');
    const trains = result.rows;

    const trainsWithStops = await Promise.all(trains.map(async train => {
      const date = new Date(train.timestamp).toISOString().split('T')[0];
      const stops = await getIntermediateStops(train.train_id, date);
      return {
        ...train,
        intermediateStops: stops
      };
    }));

    res.json(trainsWithStops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(port, () => {
  console.log(`🚀 API SNCB Timing en ligne sur http://localhost:${port}`);
});
