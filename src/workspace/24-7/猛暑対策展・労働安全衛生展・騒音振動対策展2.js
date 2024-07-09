const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策


const fileName = '猛暑対策展・労働安全衛生展・騒音振動対策展.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../output/猛暑対策展URL.csv',//dirnameは現在のディレクトリを表す
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });//recordsにCSVファイルが配列で入る
    let results = [];

    for (i = 0; i < records.length; i++) {//for文でURLを回す
        try{
      const response = await Axios({
        method: 'get',
        url: records[i].url,
      });
      const html = response.data;
      const document = parser.parse(html);

      const rawName = records[i].name
      const div = document.querySelector(".details.tit_headline.mb40.mb30sp")
      const website = div.querySelector("a")?.getAttribute("href")
      const tenji = div.querySelector(".list_dots li").innerText
      const koma = div.querySelector(".bol.fs20").innerText.replace("ブース番号 ", "");
      const url = records[i].url
      if (rawName !== '') {
          results.push({
            rawName,
            website,
            tenji,
            koma,
            url
          });
        }
        console.log(results[i]);
    } catch (error){
        console.error(error);
        console.log(`Error navigating to URL: ${records[i].name} - ${error}`);
        results.push({//resultsにrawNameだけプッシュしておく。変更あったらここも変える。
            rawName: records[i].name,
            website: "",
            tenji: "",
            koma: "",
          });
    }
      };
      
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();