const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策


const fileName = '経営者TIMES.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../output/経営者TIMES_URL.csv',//dirnameは現在のディレクトリを表す
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

      const rawName = records[i].name
      a = [...document.querySelector(".company-info-table").querySelectorAll("tr")]
      a.forEach(i => {
          if(i.querySelector("th").innerText === "ＵＲＬ"){
              website = i.querySelector("td").innerText;
          }
          if(i.querySelector("th").innerText === "代表者名"){
              rep = i.querySelector("td").innerText;
          }
      })
        const url = records[i].url;
      if (rawName !== '') {
          results.push({
            rawName,
            website,
            rep,
            url
          });
        }
        console.log(results[i]);

      };
      
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();