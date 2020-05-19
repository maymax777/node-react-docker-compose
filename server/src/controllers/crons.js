var cron = require('node-cron');
var rfr = require('rfr');
var productController = rfr('src/controllers/products');

function cronStart() {
  cron.schedule('0 9 * * *', () => {
    console.log('running a task every day');
    productController.startDailyCheck();
  });
}

module.exports.start = cronStart;
