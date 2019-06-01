fetch('https://shopee.vn/api/v2/category_list/get', {
  method: 'GET', // *GET, POST, PUT, DELETE, etc.
  mode: 'no-cors', // no-cors, cors, *same-origin
  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  credentials: 'same-origin', // include, *same-origin, omit
  headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
  },
  redirect: 'follow', // manual, *follow, error
  referrer: 'no-referrer', // no-referrer, *client
})
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    data.data.category_list.forEach(element => {
      console.log(element.catid);
    });
  });


  fetch('https://shopee.vn/api/v2/search_items/?by=pop&limit=50&locations=H%25C3%25A0%2520N%25E1%25BB%2599i&match_id=13030&newest=0&order=desc&page_type=search&rating_filter=4&shopee_verified=1')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(JSON.stringify(myJson));
  });