const express = require('express');
const { startWorker } = require('./index');

const app = express();

app.get('/start', (req, res) => {
  startWorker();
  
  setInterval(() => {
    res.send('\n'); 
  }, 1000);

});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});