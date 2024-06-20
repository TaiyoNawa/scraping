const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策


const fileName = '情熱社長.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../output/情熱社長URL.csv',//dirnameは現在のディレクトリを表す
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });//recordsにCSVファイルが配列で入る

    let results = [];

    for (i = 0; i < records.length; i++) {
        try{
      const response = await Axios({
        method: 'get',
        url: records[i].url,
      });
      const html = response.data;
      const document = parser.parse(html);

      let rawName = records[i].name
      const website = [...document.querySelectorAll("tr")].find(i => i.querySelector("th")?.innerText.includes("HP"))?.querySelector("td a")?.getAttribute("href");
      const rep = document.querySelector("#h2_back h2")?.innerText;
      //.find(i => i.querySelector("th")?.innerText === "会社HP") で th 要素のテキストが「会社HP」と一致する最初の tr 要素を見つけている。便利。
      const newRawName = rawName.replace(rep, "");

      if (newRawName.trim() === rawName.trim()) {
          // replace が行われなかった場合
          rawName = "○" + rawName;
      } else if(newRawName === ""){
        rawName = "❌" + records[i].name;
      }
       else {
          // replace が行われた場合
          rawName = newRawName.trim();
      }
      const url = records[i].url
      if (rawName !== '') {
          results.push({
            rawName,
            website,
            rep,
            url
          });
        }
        console.log(results[i]);
    }catch(error){
      //一回rawNameなどにnullやundefinedが入ると以降もresultsがundefinedになってしまうので、
      //この辺に、erorrが起きたらresultsにrawName = ""などをpushするようにプログラムを書くべき（多分いつもの展示会.jsが参考になる）
        console.error(error);
    }
      };
      
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();