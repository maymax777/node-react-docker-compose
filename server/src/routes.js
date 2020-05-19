var rfr = require('rfr');
var getHandler = {};
var postHandler = {};

var productController = rfr('src/controllers/products');

/**
 *
 */
getHandler['/getProducts'] = productController.serviceGetAllProducts;

function _bindAllGetRequests(app) {
  for (var key in getHandler) {
    app.get(key, getHandler[key]);
  }
}

function _bindAllPostRequests(app) {
  for (var key in postHandler) {
    app.post(key, postHandler[key]);
  }
}

function bindAllRequests(app) {
  _bindAllGetRequests(app);
  _bindAllPostRequests(app);
}

module.exports.bindAllRequests = bindAllRequests;
