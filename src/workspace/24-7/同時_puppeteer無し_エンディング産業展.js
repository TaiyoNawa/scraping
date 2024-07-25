const Axios = require('axios');
const parser = require('node-html-parser');
const fs = require('fs');
const path = require('path');
const parse = require('csv-parse/sync');
const toCsv = require('../../lib/generateCsv');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策

const fileName = 'エンディング産業展URL.csv';
const fileName2 = 'エンディング産業展.csv'
let records;
(async () => {
  try {

      // スクレイピングするサイトの読み込み
      const baseUrl = `https://endex.event-lab.jp/v3/oguide/exhibitor/index/ENDEX?l=japanese`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);

    temprecords = Array.from(document.querySelectorAll("li.my-2"))
    records = temprecords.map(i=>{
        name = i.innerText.replace(/\n/g, "").trim()//文字列の両端から空白文字（スペース、タブ、改行など）を取り除く!
        url = i.querySelector("a").getAttribute("href")
        return {name, url}
    })
    console.log(records);
    toCsv(records, path.join('src/workspace/output', fileName));
  } catch (error) {
    console.error(error);
  }
})();
(async () => {
    try {
      //CSVファイル読み込み
      const data = await fs.readFileSync(
        __dirname + '/../output/エンディング産業展.csv',
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
          httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
          //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
        });
        const html = response.data;
        const document = parser.parse(html);
  
        // スクレイピング
        let rawName, address, tel, website, koma;
        rawName = records[i].name
        clickTarget = records[i].url;
        const table = [...document.querySelectorAll("table.table-form tr")]
        koma = table[0].querySelector("td").innerText.replace(/\n/g, "").trim()
        address = table[1].querySelector("td").innerText.replace(/\n/g, "").trim()
        tel = table[2]?.querySelector("td").innerText.replace(/\n/g, "").trim()
        website = table[3]?.querySelector("td").innerText.replace(/\n/g, "").trim()
      const result = { rawName, clickTarget, address, tel, website, koma};
      console.log(result);
      results.push(result)
      }
      // console.log(results);
      toCsv(results, path.join('output', fileName2));
    } catch (error) {
      console.error(error);
    }
  })();

