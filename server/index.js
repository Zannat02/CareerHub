require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));


const uri = `mongodb+srv://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(
  process.env.DB_PASS
)}@cluster0booklibraryclus.5awlu0q.mongodb.net/?retryWrites=true&w=majority&appName=careerhub`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let applications; // DB connect hoyar por set hobe (Phase 3 e use hobe)

app.get('/', (req, res) => {
  res.send('CareerHub server is running');
});

async function start() {
  await client.connect();
  applications = client.db('careerhubDB').collection('applications');
  await client.db('admin').command({ ping: 1 });
  console.log('Pinged your deployment. You successfully connected to MongoDB!');

  app.listen(port, () => {
    console.log(`CareerHub server is running on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});