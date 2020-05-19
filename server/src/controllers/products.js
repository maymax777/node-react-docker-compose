const fetch = require('node-fetch');
const request = require('request');
const CONFIG = require('../shared/config');
const { sleep } = require('../shared/utils');
const DELAY = 1000; //ms
const PAGE_LIMIT = 250;

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
function serviceGetProductCount(before = 0) {
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
 *
 * @param {*} product
 */
async function checkProduct(product) {
  try {
    const isProductExist = await checkProductExist(product.sku);
    product.stock = isProductExist.success;
    console.log(product);
    if (!isProductExist.success) {
      removeProduct(product.id);
      console.log(product, ' has been removed!');
    }
  } catch (error) {
    console.error('checkProduct Error: ', error);
  }
}

/**
 * Check product exist
 * @param {*} sku
 */
function checkProductExist(sku) {
  return new Promise((resolve, reject) => {
    request(`${CONFIG.SIURL}/pdsearch/${sku}`, function (
      error,
      response,
      html
    ) {
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

/**
 *
 */
async function checkProductStock() {
  let totalProductCount = 0;
  let param = '';

  try {
    var res = await serviceGetProductCount();
    totalProductCount = parseInt(res.count);
  } catch (e) {
    console.log('e:', e);
  }
  console.log(res, totalProductCount);

  for (let pageId = 0; pageId < totalProductCount / PAGE_LIMIT; pageId++) {
    let products = [];
    try {
      products = (await serviceGetAllProducts(param)).products;
    } catch (error) {
      console.error(error);
    }
    for (let i = 0; i < products.length; i++) {
      let product = products[i];
      checkProduct(product);
      await sleep(DELAY);
    }
  }
}

/**
 * startDailyCheck
 */
function startDailyCheck() {
  checkProductStock();
}

module.exports = { serviceGetAllProducts, startDailyCheck };
