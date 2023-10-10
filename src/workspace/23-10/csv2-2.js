const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');

const fileName = 'sample-ja.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/output/sample-level2.csv',//dirnameは現在のディレクトリを表す
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });//recordsにCSVファイルが配列で入る

    let results = [];

    for (i = 0; i < records.length; i++) {//for文でURLを回す
      const response = await Axios({
        method: 'get',
        url: records[i].url,
      });
      const html = response.data;
      const document = parser.parse(html);

      const elements = document.querySelectorAll('#main section');
      Array.from(elements).map((element) => {
        let name, url;
        name = element
          .querySelector('h1')
          .innerText.replace(/\n/g, '')
          .replace(/\r/g, '');
        if (element.querySelector('.lab_eyecatching_link a')) {
          url = element
            .querySelector('.lab_eyecatching_link a')
            .getAttribute('href');
        }
        if (name !== '') {
          results.push({
            name,
            url,
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