const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策

const fileName = '経営者TIMES_URL.csv';
let results = [];
(async () => {
  try {
    // ページ数分ループ（2重）
    for(let i = 1; i < 5; i++){
      // スクレイピングするサイトの読み込み
      const baseUrl = `https://interview.interpresident.jp/page/${i}/`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);
      a = [...document.querySelectorAll("article")]
      b = a.forEach(i => {
          name = i.querySelector("h6").innerText;
          url = i.querySelector("a").getAttribute("href");
          console.log(name, url)
          results.push({name, url})
      })
    }
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();
