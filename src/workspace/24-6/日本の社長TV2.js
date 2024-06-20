const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策


const fileName = '日本の社長TV.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../output/日本の社長URL.csv',//dirnameは現在のディレクトリを表す
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });//recordsにCSVファイルが配列で入る

    let results = [];

    for (i = 0; i < records.length - 2; i++) {//for文でURLを回す
        try{
      const response = await Axios({
        method: 'get',
        url: records[i].url,
      });
      const html = response.data;
      const document = parser.parse(html);

      const rawName = records[i].name
      const website = document.querySelector(".more_info.serif li a")?.getAttribute("href");
      // Select the element with the class name 'name02'
      const temprep = document.querySelector(".name02");
      // Check if the element exists
      let rep
      if (temprep) {
        // Get the text content of the element excluding the span element
        const spanText = temprep.querySelector("span").innerText;
        const fullText = temprep.innerText;
        // Remove the span text from the full text to get the desired result
        rep = fullText.replace(spanText, "").trim();
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
    } catch (error){
        console.error(error)
    }
      };
      
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();