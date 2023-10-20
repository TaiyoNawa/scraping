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
      const elements = document.querySelectorAll('tr');
      /* console.log([...elements.querySelector('.exhi_link').innerText]); ←✖️querySelector('.exhi_link')はmapやfor内でしか使えない*/
      Array.from(elements).map((element) => {
        let name, url;
        if(element.querySelector('.exhi_link')){
          name = element.querySelector('.exhi_link')?.innerText;//?はそれより前の部分をnullかどうかを判定してnullだった場合にそれをを避ける
      }
      if(element.querySelector('.exhi_link')){
        url = 'https://wsew2022-aki.tems-system.com/exhiSearch/WSEW/jp/Details?refno=' + element.querySelector('.exhi_link')?.getAttribute('val-id');
      }
      console.log(name);
      if ((name !== '') && (url)) {
        results.push({
          name,
          url,
        });
      }
      });

    console.log(results);
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();