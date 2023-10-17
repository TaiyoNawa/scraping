const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');

const fileName = 'sample-level3-1.csv';

let results = [];
(async () => {
  try {
      // スクレイピングするサイトの読み込み
      const baseUrl = 'https://wsew2022-aki.tems-system.com/exhiSearch/WSEW/jp/ExhiList?_ga=2.36667424.1446410406.1658713741-1736183450.1658713741';
      const response = await Axios({
        method: 'get',
        url: baseUrl,
      });
      const html = response.data;
      const document = parser.parse(html);

      // スクレイピング
      let name, url;
      const elements = document.querySelectorAll('table.exhi-table');
      Array.from(elements).map((element) => {
        if(element.querySelector('.exhi_link').innerText){
            name = element.querySelector('.exhi_link').innerText;
        }
        if(element.querySelector('.exhi_link').innerText){
            url = 'https://wsew2022-aki.tems-system.com/exhiSearch/WSEW/jp/Details?refno' + element.querySelector('.exhi_link').getAttribute('val-id');
        }
        console.log(element.querySelector('.exhi_link').innerText);
        if (name !== '') {
          results.push({
            name,
            url
          });
        }
      });
    console.log(results);
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();