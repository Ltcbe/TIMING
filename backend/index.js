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

// Vérifie que la connexion à la base fonctionne avant de lancer le serveur
pool.query('SELECT 1')
  .then(() => {
    console.log('✅ Connexion à la base de données réussie');

    // Démarrage du serveur Express
    app.listen(port, () => {
      console.log(`🚀 API SNCB Timing en ligne sur http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données :', err);
    process.exit(1);
  });

// Route principale
app.get('/api/trains', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM train_delays ORDER BY id DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Erreur sur /api/trains :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
