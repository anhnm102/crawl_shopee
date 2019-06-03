main();
const MAX_ITEMS = 4; // 100 ~ 5000
const ITEMS_PER_PAGE = 2; // 0 ~ 100
const IMAGE_URL = 'https://cf.shopee.vn/file/';

async function main() {

  const listCategory = (await getListCategory()).data.category_list;
  console.log(listCategory.length + ' categories');
  
  const du = [listCategory[0]];
  return du.forEach(async category => {
    let pageItemIndex = 0;
    const total = [];
    while (pageItemIndex < MAX_ITEMS) {
      const items = (await getCategoryItems(category.catid, pageItemIndex)).items;
      const rs = [];
        items.forEach(async (product, index) => {
          const item = (await getItemDetail(product.itemid, product.shopid)).item;
              // convert image url
             item.image = IMAGE_URL + item.image;
             item.images = item.images.map(ii => IMAGE_URL + ii);

             const fileName = `category_${category.catid}.json`;

             rs.push(item);

        });
        total = [...total, ...rs];
        console.log(total);
        console.log(category.display_name + ': ' + pageItemIndex);
      pageItemIndex+=ITEMS_PER_PAGE;
    }
  });
  
}

function getItemDetail(itemId, shopId) {
  return ff(`https://shopee.vn/api/v2/item/get?itemid=${itemId}&shopid=${shopId}`);
}

function getCategoryItems(categoryId, pageItemIndex) {
  return ff(`https://shopee.vn/api/v2/search_items/?by=pop&limit=${ITEMS_PER_PAGE}&locations=H%25C3%25A0%2520N%25E1%25BB%2599i&match_id=${categoryId}&newest=${pageItemIndex}&order=desc&page_type=search&rating_filter=4&shopee_verified=1`);
}

function getListCategory() {
  return ff("https://shopee.vn/api/v2/category_list/get");
}

function ff(url) {
  return fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    return myJson;
  });
}
