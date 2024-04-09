const axios = require('axios');
const baseUrl = 'https://exhibitorsearch.hk.messefrankfurt.com/service/esb/2.1/search/exhibitor?language=ja-JP&q=&orderBy=name&pageNumber=1&pageSize=1000&findEventVariable=INTERPETSASIAPACIFIC'
const params = {"params":"query=&hitsPerPage=1000&facets=*&filters=&highlightPreTag=&highlightPostTag="};
const toCSV = require("../../lib/generateCsv");
const path = require('path')