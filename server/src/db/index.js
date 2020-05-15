var rfr = require('rfr'),
  Mongoose = require('mongoose');

var config = rfr('src/shared/config');

(function () {
  var env = config['env'] || process.env.NODE_ENV;
  var dbObj = config['database'];

  if (env !== 'development' || dbObj.username) {
    Mongoose.connect(
      'mongodb://' +
        dbObj['username'] +
        ':' +
        dbObj['password'] +
        '@' +
        dbObj['host'] +
        ':' +
        dbObj['port'] +
        '/' +
        dbObj['db']
    );
  } else {
    Mongoose.connect(
      'mongodb://' + dbObj['host'] + ':' + dbObj['port'] + '/' + dbObj['db']
    );
  }

  var con = Mongoose.connection;
  con.once('open', function () {
    console.log('Connection with database succeeded');
  });
  con.on('error', function (err) {
    console.log('Connection Error -->', err);
  });
})();
