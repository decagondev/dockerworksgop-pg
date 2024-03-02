const express = require('express');
const { Client } = require('pg');

const app = express();

const pgConfig = {
  user: 'myuser',
  host: 'localhost',
  database: 'mydatabase',
  password: 'mypassword',
  port: 7890,
};
const pgClient = new Client(pgConfig);

pgClient.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL database:', err);
  });

app.get('/:table/:name', async (req, res) => {
  const { table, name } = req.params;

  try {
    const query = {
      text: `SELECT * FROM ${table} WHERE name = $1`,
      values: [name],
    };

    const result = await pgClient.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});