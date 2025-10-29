const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Connexion à la base de données
const pool = new Pool({
  connectionString: 'postgres://sncb_user:secure_password@db:5432/sncb_timing'
});

pool.connect()
  .then(() => {
    console.log('✅ Connexion à la base de données réussie');
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à la base de données :', err);
  });

// Redirection des URL avec slash final
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

// Route API
app.get('/api/trains', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM train_delays ORDER BY id DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur serveur :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Lancement du serveur
app.listen(port, () => {
  console.log(`🚀 API SNCB Timing en ligne sur http://localhost:${port}`);
});
