const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fetch = require('node-fetch');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Connexion PostgreSQL
const pool = new Pool({
  user: 'sncb_user',
  host: 'db',
  database: 'sncb_timing',
  password: 'secure_password',
  port: 5432,
});

console.log("✅ Connexion à la base PostgreSQL initialisée");

// =============================================================
// 🔹 Route 1 : Liste des trains connus
// =============================================================
app.get('/api/trains', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (train_id)
        train_id, departure_station, arrival_station
      FROM train_delays
      ORDER BY train_id, scheduled_time DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des trains :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =============================================================
// 🔹 Route 2 : Détails d’un train (arrêts)
// =============================================================
app.get('/api/trains/:trainId/stops', async (req, res) => {
  const trainId = req.params.trainId;

  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);

    // Vérifier si on a déjà des données récentes
    const dbResult = await pool.query(
      `SELECT * FROM train_delays WHERE train_id = $1 AND actual_time >= $2 ORDER BY scheduled_time`,
      [trainId, thirtyMinutesAgo]
    );

    if (dbResult.rows.length > 0) {
      console.log(`📦 Données trouvées en DB pour ${trainId}`);
      return res.json(dbResult.rows);
    }

    // Sinon → récupérer depuis iRail
    console.log(`🌐 Fetch depuis iRail pour ${trainId}`);
    const response = await fetch(`https://api.irail.be/vehicle/?id=${trainId}&format=json`);
    const data = await response.json();
    const stops = data.stops?.stop || [];

    for (const stop of stops) {
      const delay = parseInt(stop.delay, 10) / 60;
      const scheduledTimestamp = Number(stop.scheduledDepartureTime || stop.scheduledArrivalTime);
      const actualTimestamp = Number(stop.time);

      // 🧠 Vérification anti-crash
      if (isNaN(scheduledTimestamp) || isNaN(actualTimestamp)) {
        console.warn(`⚠️  Horaires invalides ignorés pour ${trainId} →`, stop.station);
        continue;
      }

      await pool.query(
        `INSERT INTO train_delays
         (train_id, departure_station, arrival_station, scheduled_time, actual_time, delay)
         VALUES ($1, $2, $3, to_timestamp($4), to_timestamp($5), $6)`,
        [
          trainId,
          stop.station,
          stop.station, // tu peux remplacer par stop.departure.station si dispo
          scheduledTimestamp,
          actualTimestamp,
          isNaN(delay) ? 0 : delay,
        ]
      );
    }

    // Renvoyer la version mise à jour
    const updated = await pool.query(
      `SELECT * FROM train_delays WHERE train_id = $1 AND actual_time >= $2 ORDER BY scheduled_time`,
      [trainId, thirtyMinutesAgo]
    );

    res.json(updated.rows);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des arrêts :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =============================================================
// 🔹 Route 3 : Collecte automatique des trains d’une gare
// =============================================================
app.get('/api/fetch-trains', async (req, res) => {
  try {
    const station = 'Bruxelles-Central'; // ✅ configurable
    console.log(`🚆 Récupération liveboard pour ${station}`);

    const liveboardRes = await fetch(
      `https://api.irail.be/liveboard/?station=${encodeURIComponent(station)}&arrdep=departure&format=json`
    );
    const liveboardData = await liveboardRes.json();

    const trains = liveboardData.departures?.departure || [];
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);

    for (const train of trains) {
      const trainId = train.vehicle?.split('.').pop(); // "BE.NMBS.IC1234" → "IC1234"
      if (!trainId) continue;

      const exists = await pool.query(
        `SELECT 1 FROM train_delays WHERE train_id = $1 AND actual_time >= $2 LIMIT 1`,
        [trainId, thirtyMinutesAgo]
      );
      if (exists.rowCount > 0) {
        console.log(`⏩ Train ${trainId} déjà en base`);
        continue;
      }

      console.log(`🔄 Fetch iRail pour ${trainId}`);
      const vehicleRes = await fetch(`https://api.irail.be/vehicle/?id=${trainId}&format=json`);
      const vehicleData = await vehicleRes.json();
      const stops = vehicleData.stops?.stop || [];

      for (const stop of stops) {
        const delay = parseInt(stop.delay, 10) / 60;
        const scheduledTimestamp = Number(stop.scheduledDepartureTime || stop.scheduledArrivalTime);
        const actualTimestamp = Number(stop.time);

        if (isNaN(scheduledTimestamp) || isNaN(actualTimestamp)) {
          console.warn(`⚠️  Données invalides ignorées pour ${trainId} →`, stop.station);
          continue;
        }

        await pool.query(
          `INSERT INTO train_delays
           (train_id, departure_station, arrival_station, scheduled_time, actual_time, delay)
           VALUES ($1, $2, $3, to_timestamp($4), to_timestamp($5), $6)`,
          [
            trainId,
            stop.station,
            stop.station,
            scheduledTimestamp,
            actualTimestamp,
            isNaN(delay) ? 0 : delay,
          ]
        );
      }
    }

    res.json({ message: '✅ Données récupérées et stockées avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors du fetch automatique :', error);
    res.status(500).json({ error: 'Erreur lors de la collecte automatique' });
  }
});

// =============================================================
// 🚀 Lancement serveur
// =============================================================
app.listen(port, () => {
  console.log(`🚀 API SNCB Timing en ligne sur http://localhost:${port}`);
});

