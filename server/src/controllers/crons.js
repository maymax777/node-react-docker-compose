var cron = require('node-cron');

function cronStart() {
  cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
  });
}

module.exports.start = cronStart;
