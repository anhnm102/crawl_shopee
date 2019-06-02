const https = require("https");
const fs = require('fs');

main();

async function main() {
  const MAX_ITEMS = 3000; // 100 ~ 5000
  const ITEMS_PER_PAGE = 100;
  const IMAGE_URL = 'https://cf.shopee.vn/file/';

  const listCategory = (await getListCategory()).data.category_list;
  console.log(listCategory.length + ' categories');

  return listCategory.forEach(async category => {
    let pageItemIndex = 0;
    while (pageItemIndex < MAX_ITEMS) {
      const items = (await getCategoryItems(category.catid, pageItemIndex)).items;
        items.forEach(async (product, index) => {
          const item = (await getItemDetail(product.itemid, product.shopid)).item;
              // convert image url
             item.image = IMAGE_URL + item.image;
             item.images = item.images.map(ii => IMAGE_URL + ii);

             const fileName = `category_${category.catid}.json`;

             try {
              if (fs.existsSync(fileName)) {
                if (index === ITEMS_PER_PAGE - 1 && pageItemIndex === MAX_ITEMS - ITEMS_PER_PAGE) {
                  // last item
                  fs.appendFileSync(fileName, JSON.stringify(item) + ']');
                } else {
                  fs.appendFileSync(fileName, JSON.stringify(item) + ',');
                }
              } else {
                // first item
                fs.appendFileSync(fileName, '[' + JSON.stringify(item) + ',');
              }
            } catch(err) {
              console.error(err)
            }

        });
        console.log(category.display_name + ': ' + pageItemIndex);
      pageItemIndex+=ITEMS_PER_PAGE;
    }
  });
  
}

function getItemDetail(itemId, shopId) {
  return fetch(`https://shopee.vn/api/v2/item/get?itemid=${itemId}&shopid=${shopId}`);
}

function getCategoryItems(categoryId, pageItemIndex) {
  return fetch(`https://shopee.vn/api/v2/search_items/?by=pop&limit=100&locations=H%25C3%25A0%2520N%25E1%25BB%2599i&match_id=${categoryId}&newest=${pageItemIndex}&order=desc&page_type=search&rating_filter=4&shopee_verified=1`);
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
      // console.error(e);
    });
  });
}
