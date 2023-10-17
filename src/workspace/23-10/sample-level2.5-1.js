const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');

const fileName = 'sample-level2.5-1.csv';

let results = [];
(async () => {
  try {
    //ページ数分ループ（2重）
    for(i = 11; i < 15; i++){
    for (j = 1; j < 2; j++) {
      // スクレイピングするサイトの読み込み
      const baseUrl = `https://beauty.hotpepper.jp/pre${i}/PN${j}/`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
      });
      const html = response.data;
      const document = parser.parse(html);

      const elements = document.querySelectorAll(
        'h3.slnName'
      );
      Array.from(elements).map((element) => {
        let name, url;
        if(element.querySelector('a')){
          name = element
          .querySelector('a')
          .innerText
          url = element
          .querySelector('a')
          .getAttribute('href');
        }
        if (url !== '') {
            results.push({
              name,
              url
            });
          }
      });
    }
    }
    console.log(results);
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();