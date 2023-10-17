const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');

const fileName = 'sample-hospitalsfile.csv';

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
    for (i = 0; i < records.length; i++) {
      // スクレイピングするサイトの読み込み
      const response = await Axios({
        method: 'get',
        url: records[i].url,
      });
      const html = response.data;
      const document = parser.parse(html);

      // スクレイピング
      const elements = document.querySelectorAll('#info table.table-hospital tr');
      let name, admin, tel, adrs, bed, holi, site;
      Array.from(elements).map((element) => {
        name = records[i].name;
        if (/* element.querySelector('td').innerText &&  */element.querySelector('th').innerText === '管理者'){
            admin = element.querySelector('td').innerText;
        }
        if (element.querySelector('th').innerText === '電話番号'){
          tel = element.querySelector('td').innerText;
        }
        if (element.querySelector('th').innerText === '所在地'){
          adrs = element.querySelector('td').innerText.replace('\n','');
        }
        if (element.querySelector('th').innerText === '病床数'){
          bed = element.querySelector('td').innerText;
        }
        if (element.querySelector('th').innerText === '休診日'){
          holi = element.querySelector('td').innerText;
        }
        if (element.querySelector('th').innerText === '公式サイト'){
          site = element.querySelector('a').getAttribute('href');
        }
      });
      if (admin !== '') {
        results.push({
          name,
          admin,
          tel,
          adrs,
          bed,
          holi,
          site
        });
      }
    }
    console.log(results);
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();