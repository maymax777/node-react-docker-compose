'use strict';

const express = require('express');
const rfr = require('rfr');
const cors = require('cors');
const path = require('path');
const cronJobs = require('./controllers/crons');

// Constants
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

const CLIENT_BUILD_PATH = path.join(__dirname, '../../client/build');

// App
const app = express();

// Routes
var routes = rfr('/src/routes');
// To prevent errors from Cross Origin Resource Sharing, Use cors Middleware
app.use(cors());

// Static files
app.use(express.static(CLIENT_BUILD_PATH));

// API
app.get('/api', (req, res) => {
  res.set('Content-Type', 'application/json');
  let data = {
    message: 'Hello world, Woooooeeeee!!!!',
  };
  console.log('/api: ');
  res.send(JSON.stringify(data, null, 2));
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
  response.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

app.listen(PORT, HOST, function () {
  console.log(`Running on http://${HOST}:${PORT}`);
  routes.bindAllRequests(app);

  // Start cron scheduled jobs
  cronJobs.start();
});
