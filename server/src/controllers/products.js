const fetch = require('node-fetch');
const request = require('request');
const CONFIG = require('../shared/config');

/**
 * Get all product ids limit upto 250
 */
function serviceGetAllProducts(param) {
  return new Promise(function (resolve, reject) {
    fetch(
      `${CONFIG.API_SHOPIFY_SERVER}${CONFIG.API_GET_PRODUCTS}?limit=250&fields=id,variants&page_info=${param}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Authorization:
            'Basic ' +
            Buffer.from(
              CONFIG.SHOPIFY_ADMIN_API_KEY +
                ':' +
                CONFIG.SHPIFY_ADMIN_SECRET_KEY
            ).toString('base64') +
            ' HTTP/1.1',
        },
      }
    )
      .then((response) => {
        var url = (response.headers.get('Link') || '').replace(
          response.headers.get('X-Request-Url'),
          ''
        );
        url = url.substring(
          url.lastIndexOf('page_info=') + 10,
          url.lastIndexOf('>')
        );
        // console.log(url);
        response.json().then((res) => {
          if (response.ok) {
            let products = res.products.map((product) => ({
              id: product.id,
              sku: product.variants[0].sku,
            }));
            resolve({ page_info: url, products: products });
          } else reject(res);
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Get total count of products
 */
function serviceGetProductCount() {
  return new Promise(function (resolve, reject) {
    fetch(`${CONFIG.API_SHOPIFY_SERVER}${CONFIG.API_PRODUCT_COUNT}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Authorization:
          'Basic ' +
          Buffer.from(
            CONFIG.SHOPIFY_ADMIN_API_KEY + ':' + CONFIG.SHPIFY_ADMIN_SECRET_KEY
          ).toString('base64') +
          ' HTTP/1.1',
      },
    })
      .then((response) => {
        response.json().then((res) => {
          if (response.ok) resolve(res);
          else reject(res);
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Check product exist
 * @param {*} sku
 */
function checkProduct(sku) {
  return new Promise((resolve, reject) => {
    request(`${SIURL}/pdsearch/${sku}`, function (error, response, html) {
      if (!error) {
        // console.log(html);
        if (!html.includes(`did not match any products`))
          resolve({ success: true });
        else resolve({ success: false });
      } else reject(error);
    });
  });
}
/**
 * Remove product
 * @param productId
 */
async function removeProduct(productId) {
  return new Promise(function (resolve, reject) {
    fetch(
      `https://cors-owner.herokuapp.com/https://fashionplum.myshopify.com/admin/api/2019-07/products/${productId}.json`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Origin: '',
          'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS, PUT',
          Authorization:
            'Basic ' +
            Buffer.from(
              CONFIG.SHOPIFY_ADMIN_API_KEY +
                ':' +
                CONFIG.SHPIFY_ADMIN_SECRET_KEY
            ).toString('base64') +
            ' HTTP/1.1',
        },
      }
    )
      .then((response) => {
        response.json().then((res) => {
          if (response.ok) resolve(res);
          else reject(res);
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function start() {
  let totalProductCount = 0;
  let param = '';
  let products = [];
  let filteredProducts = [];

  try {
    var res = await serviceGetProductCount();
    totalProductCount = parseInt(res.count);
  } catch (e) {
    console.log('e:', e);
  }
  console.log(res, totalProductCount);

  for (let pageId = 0; pageId < totalProductCount / 250; pageId++) {
    await serviceGetAllProducts(param)
      .then((res) => {
        param = res.page_info;
        products = products.concat(res.products);
        console.log(param, res.products.length);
      })
      .catch((e) => {
        console.log('e: ', e);
      });
    // break;
  }

  console.log(products.length);
}

module.exports = { serviceGetAllProducts };
