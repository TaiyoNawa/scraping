const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策

const fileName = '猛暑対策展URL.csv';

let results = [];
(async () => {
  try {
    // ページ数分ループ（2重）
    for(let i = 1; i < 5; i++){

      // スクレイピングするサイトの読み込み
      const baseUrl = `https://www.jma-exhibition.com/7all/webguide_jp_stt/list.php?page=${i}&`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);

      const a = Array.from(document.querySelectorAll(".txt"))

      a.map((element) => {
        let name, url;
        name = element.innerText.replace(/,/g, "").replace(/ /g, "").replace(/\r/g, "").replace(/\n/g, "");
        url = "https://www.jma-exhibition.com/7all/webguide_jp_stt/" + element.getAttribute('href');
        if(name){
            results.push({name,url})
        }
      });
    }
    console.log(results);
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();
