const express = require('express');
const { startWorker } = require('./index');

const app = express();

app.get('/start', (req, res) => {
  startWorker();
  res.send('Worker started');
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});