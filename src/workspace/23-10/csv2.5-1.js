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
      __dirname + '/output/sample-level2.5-1.csv',
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
      /* console.log(records[i]) */
      const html = response.data;
      const document = parser.parse(html);

  
      // スクレイピング
      const elements = document.querySelectorAll('table.slnDataTbl tr');
      let name, tel, adrs, homepage, labor, ope, holi, condi, price;
      Array.from(elements).map((element) => {
        /* 電話番号,店名,住所,お店のホームページ,従業員数,営業時間,
        定休日,こだわり条件,カット価格,各店のホットペッパーサイトのURL */
      name = records[i].name.replace('&#39;','');
      if (element.querySelector('th').innerText === '電話番号') {
        tel = element.querySelector('td').innerText.replace(/&nbsp;/g, '');
      }
      if (element.querySelector('th').innerText === '住所') {
          adrs = element.querySelector('td').innerText.replace(/&nbsp;/g, '');
      }
      if (element.querySelector('th').innerText === 'スタッフ数') {
        labor = element.querySelector('td').innerText.replace(/&nbsp;/g, '');
      }
      if (element.querySelector('th').innerText === '営業時間') {
        ope = element.querySelector('td').innerText.replace(/&nbsp;/g, '');
      }
      if (element.querySelector('th').innerText === '定休日') {
        holi = element.querySelector('td').innerText.replace(/&nbsp;/g, '');
      }
      if (element.querySelector('th').innerText === 'こだわり条件') {
        condi = element.querySelector('td').innerText.replace(/&nbsp;/g, '');
      }
      if (element.querySelector('th').innerText === 'カット価格') {
        price = element.querySelector('td').innerText.replace(/&nbsp;/g, '');
      }
      /* console.log(tel) */
       
      });
      /* console.log(tel) */
        results.push({
          /* tel, */
          name,
          adrs,
          labor,
          ope,
          holi,
          condi,
          price
        });
    }
    console.log(results);
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();