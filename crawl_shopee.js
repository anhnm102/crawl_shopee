const https = require("https");
const fs = require('fs');

main();

function main() {
  fetch("https://shopee.vn/api/v2/category_list/get").then(rs => {
    console.log(rs.data.category_list.length + ' categories');
    return rs.data.category_list.forEach(category => {
      let pageItemIndex = 0;
      while (pageItemIndex < 3000) {
        const url = `https://shopee.vn/api/v2/search_items/?by=pop&limit=100&locations=H%25C3%25A0%2520N%25E1%25BB%2599i&match_id=${category.catid}&newest=${pageItemIndex}&order=desc&page_type=search&rating_filter=4&shopee_verified=1`;
        pageItemIndex+=100;
        // console.log(category.display_name + ' item ' + pageItemIndex);
        fetch(url).then(rs => {
          rs.items.forEach((product, index) => {
            const itemUrl = `https://shopee.vn/api/v2/item/get?itemid=${product.itemid}&shopid=${product.shopid}`;
            // setTimeout(() => {
              fetch(itemUrl).then(item => {
                // convert image url
               const imageUrl = 'https://cf.shopee.vn/file/';
               item.item.image = imageUrl + item.item.image;
               item.item.images = item.item.images.map(ii => imageUrl + ii);
                if (index == 0) {
                  fs.appendFile(`category_${category.catid}.json`, '[', function (err) {
                    if (err) throw err;
                    fs.appendFile(`category_${category.catid}.json`, JSON.stringify(item) + ',', function (err) {
                      if (err) throw err;
                    });
                  });
                } else {
                  fs.appendFile(`category_${category.catid}.json`, JSON.stringify(item) + ',', function (err) {
                    if (err) throw err;
                    if (rs.items.length - 1 == index) {
                      fs.appendFile(`category_${category.catid}.json`, ']', function (err) {
                        if (err) throw err;
                      });
                    }
                  });
                }
              });
            // }, 100);
          });
        });
      }
    });
  });
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
