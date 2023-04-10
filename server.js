const express = require('express');
const pm2 = require('pm2');
const app = express();

pm2.connect(function(err) {
  console.log("Starting pm2")

  if (err) {
    console.error(err);
    process.exit(2);
  }

  


  pm2.start({
    script: 'index.js',
    name: 'worker',
    log: true,
    log_level: 'debug'
  }, function(err, apps) {
    if (err) {
      pm2.disconnect();
      console.error(err);
      process.exit(2);
    }

    pm2.launchBus(function(err, bus) {
      if (err) {
        console.error(err);
        process.exit(2);
      }
  
      bus.on('log:out', function(data) {
        console.log('[App:%s] %s', data.process.name, data.data);
      });
  
      bus.on('log:err', function(data) {
        console.error('[App:%s][Err] %s', data.process.name, data.data);
      });
    });
  });
});

app.listen(3000, () => {
  console.log('Ferias Ufes started on port 3000');
});