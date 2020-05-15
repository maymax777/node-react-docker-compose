var cron = require('node-cron');

function cronStart() {
  cron.schedule('0 9 * * *', () => {
    console.log('running a task every minute');
  });
}

module.exports.start = cronStart;
