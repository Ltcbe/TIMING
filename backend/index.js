const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Nécessaire pour appeler l'API iRail

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// ✅ Endpoint en temps réel depuis iRail
app.get('/api/trains', async (req, res) => {
  try {
    const station = req.query.station || 'Bruxelles-Central'; // option pour personnaliser la station
    const url = `https://api.irail.be/liveboard/?station=${encodeURIComponent(station)}&format=json&fast=true`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur API iRail: ${response.status}`);
    }

    const data = await response.json();
    const trains = data.departures.departure.map(train => ({
      train_id: train.vehicle,
      departure_station: data.station,
      arrival_station: train.station,
      scheduled_time: new Date(train.time * 1000).toISOString(),
      delay_minutes: train.delay / 60
    }));

    res.json(trains);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des données iRail:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données en temps réel' });
  }
});

app.listen(port, () => {
  console.log(`🚀 API SNCB Timing en ligne sur http://localhost:${port}`);
});
