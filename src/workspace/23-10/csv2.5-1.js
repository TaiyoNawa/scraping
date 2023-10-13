const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');

const fileName = 'sample-hotpeppersalon.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/output/sample-level2.5-2.csv',
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });

    let results = [];

    //読み込むURL(件数)分ループさせる
    for (i = 0; i < 2; i++) {
      // スクレイピングするサイトの読み込み
      const response = await Axios({
        method: 'get',
        url: records[i].url,
      });
      const html = response.data;
      const document = parser.parse(html);

      // スクレイピング
      const elements = document.querySelectorAll('tr');
      Array.from(elements).map((element) => {
      let admin, tel, adrs, bed, holi, url;
      if (element.querySelector('th').innerText === '電話番号') {
            tel = element.querySelector('td').innerText;
        }
        if (tel !== '') {
          results.push({
            tel
          });
        }
      });
    }
    console.log(results);
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();