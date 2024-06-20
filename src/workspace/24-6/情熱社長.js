const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策

const fileName = '情熱社長URL.csv';
let results = [];
(async () => {
  try {
    // ページ数分ループ（2重）
    for(let i = 1; i < 66; i++){
      // スクレイピングするサイトの読み込み
      const baseUrl = `https://jonetu-ceo.com/page/${i}/`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);
      a = [...document.querySelectorAll("[rel=bookmark]")]
      a.forEach((i)=>{
          name = i.querySelector("h2").innerText;
          url = i.getAttribute("href");
          console.log(name,url)
          results.push({name,url})
      })
    }
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();
