const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');

const fileName = 'sample-level2.5-2.csv';

let results = [];
(async () => {
  try {
    //ページ数分ループ（2重）
    for(i = 11; i < 15; i++){
    for (i = 1; i < 32; i++) {
      // スクレイピングするサイトの読み込み
      const baseUrl = `hhttps://beauty.hotpepper.jp/pre${i}/PN${j}/`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
      });
      const html = response.data;
      const document = parser.parse(html);

      // スクレイピング←手つけてない
      const elements = document.querySelectorAll(
        '.result-header'
      );
      Array.from(elements).map((element) => {
        let url
        if(element.querySelector('.result__name')){
            url = 'https://hospitalsfile.doctorsfile.jp' + element
            .querySelector('.result__name')
            .getAttribute('href');
        }
        if (url !== '') {
            results.push({
              url,
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