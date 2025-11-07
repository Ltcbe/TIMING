/**
 * =============================================
 * 🎯 TIMING — BACKEND EXPRESS (corrigé et complet)
 * =============================================
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

/**
 * =============================================
 * 🧭 ROUTES PRINCIPALES
 * =============================================
 */

/**
 * @route GET /api/trains
 * Récupère la liste des trains avec leurs informations les plus récentes.
 * -> Correction : on renvoie aussi scheduled_time, actual_time et delay.
 */
app.get('/api/trains', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (train_id)
        train_id,
        departure_station,
        arrival_station,
        scheduled_time,
        actual_time,
        delay
      FROM train_delays
      ORDER BY train_id, scheduled_time DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des trains :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /api/trains/:id/stops
 * Récupère tous les arrêts d’un train spécifique.
 */
app.get('/api/trains/:id/stops', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM train_delays WHERE train_id = $1 ORDER BY scheduled_time ASC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des arrêts :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @route GET /api/fetch-trains
 * Récupère les données depuis l’API iRail et les insère dans PostgreSQL.
 */
app.get('/api/fetch-trains', async (req, res) => {
  try {
    console.log('🚀 Récupération des trains depuis iRail...');

    // Exemple : Bruxelles -> Liège (tu peux adapter dynamiquement)
    const apiUrl = `${process.env.IRAIL_API}/connections/?from=Bruxelles-Central&to=Liège-Guillemins&format=json&lang=fr`;

    const { data } = await axios.get(apiUrl);

    if (!data.connections || data.connections.length === 0) {
      console.warn('⚠️ Aucune donnée reçue de iRail');
      return res.status(204).json({ message: 'Aucune donnée reçue de iRail' });
    }

    let inserted = 0;

    for (const conn of data.connections) {
      const trainId = conn.departure.vehicle.replace('BE.NMBS.', '');
      const depStation = conn.departure.station;
      const arrStation = conn.arrival.station;

      const scheduled = new Date(parseInt(conn.departure.time) * 1000);
      const actual = conn.departure.leftTime
        ? new Date(parseInt(conn.departure.leftTime) * 1000)
        : scheduled;
      const delay = conn.departure.delay ? conn.departure.delay / 60 : 0; // secondes → minutes

      await pool.query(
        `
        INSERT INTO train_delays
        (train_id, departure_station, arrival_station, scheduled_time, actual_time, delay)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING;
      `,
        [trainId, depStation, arrStation, scheduled, actual, delay]
      );

      inserted++;
    }

    console.log(`✅ ${inserted} trajets insérés avec succès.`);
    res.json({ message: `Trains récupérés (${inserted} insérés)` });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération iRail :', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération depuis iRail' });
  }
});

/**
 * =============================================
 * 🩺 ROUTE DE TEST
 * =============================================
 */
app.get('/', (req, res) => {
  res.send('✅ API Timing opérationnelle !');
});

/**
 * =============================================
 * 🚉 DÉMARRAGE DU SERVEUR
 * =============================================
 */
app.listen(PORT, () => {
  console.log(`🚉 Serveur backend en écoute sur le port ${PORT}`);
});
