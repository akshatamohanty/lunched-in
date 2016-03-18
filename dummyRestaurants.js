var dummyRestaurants = [
  {
    "code": "D1",
    "name": "Restaurant#01",
    "address": "70 Anson Road\nSingapore",
    "zipCod": 79905,
    "phone": "6222 0031",
    "price": 2,
    "cuisine": "Thai,  Western",
    "halal": true,
    "veg": true
  },
  {
    "code": "D2",
    "name": "Restaurant#02",
    "address": "12 Gopeng St\nSingapore",
    "zip": 78877,
    "phone": "6238 5863",
    "price": 0,
    "cuisine": "Thai,  French ,  Korean ,  Vietnamese ,  Western , Indian",
    "halal": false,
    "veg": true
  },
  {
    "code": "D3",
    "name": "Restaurant#03",
    "address": "100 Tras St\nSingapore",
    "zip": 569922,
    "phone": "6694 8809",
    "price": 2,
    "cuisine": "Vietnamese ,  Korean ,  Chinese ,  Thai, Indian ,  French",
    "halal": false,
    "veg": false
  },
  {
    "code": "D4",
    "name": "Restaurant#04",
    "address": "15 Enggor Street\nSingapore",
    "zip": 79716,
    "phone": 0,
    "price": 0,
    "cuisine": "Chinese ,  Western , Indian ,  French ,  Korean",
    "halal": true,
    "veg": true
  },
  {
    "code": "D5",
    "name": "Restaurant#05",
    "address": "100 Tras Street\nSingapore",
    "zip": 79027,
    "phone": "6604 9622",
    "price": 3,
    "cuisine": "Korean ,  French",
    "halal": false,
    "veg": false
  },
  {
    "code": "D6",
    "name": "Restaurant#06",
    "address": "100 Tras Street\nSingapore",
    "zip": 79027,
    "phone": 0,
    "price": 2,
    "cuisine": "Thai,  Western , Indian ,  Chinese ,  Vietnamese",
    "halal": true,
    "veg": true
  },
  {
    "code": "D7",
    "name": "Restaurant#07",
    "address": "12 Gopeng Street\nSingapore",
    "zip": 78877,
    "phone": "6534 8765",
    "price": 3,
    "cuisine": "French ,  Vietnamese , Indian ,  Thai,  Korean ,  Chinese ,  Western",
    "halal": false,
    "veg": true
  },
  {
    "code": "D8",
    "name": "Restaurant#08",
    "address": "1 Tanjong Pagar Plaza\nSingapore",
    "zip": 82001,
    "phone": 0,
    "price": 1,
    "cuisine": "Vietnamese , Indian ,  Chinese ,  Thai,  Western",
    "halal": true,
    "veg": true
  },
  {
    "code": "D9",
    "name": "Restaurant#09",
    "address": "1 Tras Link\nSingapore",
    "zip": 78867,
    "phone": "6604 8891",
    "price": 0,
    "cuisine": "Thai,  Western",
    "halal": false,
    "veg": false
  },
  {
    "code": "D10",
    "name": "Restaurant#10",
    "address": "6 Tanjong Pagar Plaza\nSingapore",
    "zip": 81006,
    "phone": 0,
    "price": 0,
    "cuisine": "Thai,  French ,  Korean ,  Vietnamese ,  Western , Indian",
    "halal": true,
    "veg": true
  },
  {
    "code": "D11",
    "name": "Restaurant#11",
    "address": "Singapore",
    "zip": 78877,
    "phone": 0,
    "price": 0,
    "cuisine": "Vietnamese ,  Korean ,  Chinese ,  Thai, Indian ,  French",
    "halal": true,
    "veg": true
  },
  {
    "code": "D12",
    "name": "Restaurant#12",
    "address": "80 Anson Road\nSingapore",
    "zip": 79907,
    "phone": 0,
    "price": 1,
    "cuisine": "Chinese ,  Western , Indian ,  French ,  Korean",
    "halal": true,
    "veg": true
  },
  {
    "code": "D13",
    "name": "Restaurant#13",
    "address": "5 Hoe Chiang Road\nSingapore",
    "zip": 89312,
    "phone": 0,
    "price": 0,
    "cuisine": "Korean ,  French",
    "halal": true,
    "veg": true
  },
  {
    "code": "D14",
    "name": "Restaurant#14",
    "address": "12 Gopeng St\nSingapore",
    "zip": 78877,
    "phone": "6224 6002",
    "price": 0,
    "cuisine": "Thai,  Western , Indian ,  Chinese ,  Vietnamese",
    "halal": false,
    "veg": true
  },
  {
    "code": "D15",
    "name": "Restaurant#15",
    "address": "Orchid Hotel\nSingapore",
    "zip": 78867,
    "phone": "6604 8891",
    "price": 2,
    "cuisine": "French ,  Vietnamese , Indian ,  Thai,  Korean ,  Chinese ,  Western",
    "halal": false,
    "veg": false
  },
  {
    "code": "D16",
    "name": "Restaurant#16",
    "address": "1 Tanjong Pagar Plaza\nSingapore",
    "zip": 82001,
    "phone": "8202 0522",
    "price": 0,
    "cuisine": "Vietnamese , Indian ,  Chinese ,  Thai,  Western",
    "halal": true,
    "veg": true
  },
  {
    "code": "D17",
    "name": "Restaurant#17",
    "address": "165 Tanjong Pagar Road\nSingapore",
    "zip": 88539,
    "phone": "6222 4688",
    "price": 4,
    "cuisine": "Thai,  Western",
    "halal": false,
    "veg": true
  },
  {
    "code": "D18",
    "name": "Restaurant#18",
    "address": "1 Tras Link\nSingapore",
    "zip": 78867,
    "phone": 0,
    "price": 3,
    "cuisine": "Thai,  French ,  Korean ,  Vietnamese ,  Western , Indian",
    "halal": true,
    "veg": true
  },
  {
    "code": "D19",
    "name": "Restaurant#19",
    "address": "1 Tras Link\nSingapore",
    "zip": 78867,
    "phone": 0,
    "price": 0,
    "cuisine": "Vietnamese ,  Korean ,  Chinese ,  Thai, Indian ,  French",
    "halal": true,
    "veg": true
  },
  {
    "code": "D20",
    "name": "Restaurant#20",
    "address": "2 Lim Teck Kim\nSingapore",
    "zip": 88933,
    "phone": "6324 2559",
    "price": 1,
    "cuisine": "Chinese ,  Western , Indian ,  French ,  Korean",
    "halal": true,
    "veg": true
  },
  {
    "code": "D21",
    "name": "Restaurant#21",
    "address": "100 Tras Street\nSingapore",
    "zip": 79027,
    "phone": "6444 4406",
    "price": 1,
    "cuisine": "Korean ,  French",
    "halal": false,
    "veg": false
  },
  {
    "code": "D22",
    "name": "Restaurant#22",
    "address": "70 Anson Road\nSingapore",
    "zip": 79905,
    "phone": 0,
    "price": 0,
    "cuisine": "Thai,  Western , Indian ,  Chinese ,  Vietnamese",
    "halal": true,
    "veg": true
  },
  {
    "code": "D23",
    "name": "Restaurant#23",
    "address": "15 Enggor St\nSingapore",
    "zip": 79716,
    "phone": "6534 9336",
    "price": 0,
    "cuisine": "French ,  Vietnamese , Indian ,  Thai,  Korean ,  Chinese ,  Western",
    "halal": false,
    "veg": true
  },
  {
    "code": "D24",
    "name": "Restaurant#24",
    "address": "7 Keppel Road\nSingapore",
    "zip": 89053,
    "phone": 0,
    "price": 0,
    "cuisine": "Vietnamese , Indian ,  Chinese ,  Thai,  Western",
    "halal": true,
    "veg": true
  }
]

module.exports = dummyRestaurants;