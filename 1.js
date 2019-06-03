const https = require("https");
const fs = require('fs');

// constants
const MAX_ITEMS = 200; // 100 ~ 5000
const ITEMS_PER_PAGE = 20; // 0 ~ 100
const IMAGE_URL = 'https://cf.shopee.vn/file/';

main();

async function main() {
  const pageItemIndexs = getPageItemIndexs();
  const listCategory = (await getListCategory()).data.category_list;
  console.log(listCategory.length + ' categories');
  
  const du = [listCategory[0]];
  return du.forEach(async category => {
    const fileName = `category_${category.catid}.json`;
    const listItem = await getListItemDetail(category, pageItemIndexs);

    try {
      fs.appendFileSync(fileName, JSON.stringify(listItem));
    } catch(err) {
      console.error(err)
    }
  });
  
}

function getPageItemIndexs() {
  let pageItemIndex = 0;
  const pageItemIndexs = [];
  while (pageItemIndex < MAX_ITEMS) {
    pageItemIndexs.push(pageItemIndex);
    pageItemIndex+=ITEMS_PER_PAGE;
  }
  return pageItemIndexs;
}

async function getListItemDetail(category, pageItemIndexs) {
  return new Promise(async resolve => {
    let total = [];
      for (const pageIndex of pageItemIndexs) {
        const items = (await getCategoryItems(category.catid, pageIndex)).items;
        const rs = [];
        for (const product of items) {
          const item = (await getItemDetail(product.itemid, product.shopid)).item;
          // convert image url
          item.image = IMAGE_URL + item.image;
          item.images = item.images.map(ii => IMAGE_URL + ii);
          rs.push(item);
        }
        total = [...total, ...rs];
        console.log(category.display_name + ': ' + (pageIndex+ITEMS_PER_PAGE));
      }
      resolve(total);
  })
}

function getItemDetail(itemId, shopId) {
  return fetch(`https://shopee.vn/api/v2/item/get?itemid=${itemId}&shopid=${shopId}`);
}

function getCategoryItems(categoryId, pageItemIndex) {
  return fetch(`https://shopee.vn/api/v2/search_items/?by=pop&limit=${ITEMS_PER_PAGE}&locations=H%25C3%25A0%2520N%25E1%25BB%2599i&match_id=${categoryId}&newest=${pageItemIndex}&order=desc&page_type=search&rating_filter=4&shopee_verified=1`);
}

function getListCategory() {
  return fetch("https://shopee.vn/api/v2/category_list/get");
}

function fetch(url) {
  const options = {
    headers: {
        'Content-Type': 'application/json',
        'Accept':	'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language':	'en-US,en;q=0.5',
        'Connection':	'keep-alive',
        'Host':	'shopee.vn',
        'If-None-Match':	'"cfdc058ae20e3805ca1167b5b0f41a4d;gzip"',
        'Upgrade-Insecure-Requests':	'1',
        'User-Agent':	'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0'
    },
  };
  return new Promise(resolve => {
    https.get(url, options, res => {
      res.setEncoding('utf8');
      let data = "";

      res.on("data", chunk => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (data.error) {
            console.log(data.error_msg)
          }
          resolve(JSON.parse(data));
        } catch (error) {
          console.log('Loi:');
          console.log(data);
        }
      });
    }).on('error', e => {
      console.error(e);
    });
  });
}
