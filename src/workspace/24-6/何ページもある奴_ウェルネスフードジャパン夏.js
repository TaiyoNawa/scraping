const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策

const fileName = 'ウェルネスフード.csv';

let results = [];
(async () => {
  try {
    // ページ数分ループ（2重）
    for(let i = 1; i < 11; i++){

      // スクレイピングするサイトの読み込み
      const baseUrl = `https://cafewfj2024.reg-visitor.com/exhibitor//?page=${i}#list`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);

      const a = document.querySelectorAll(
        '.exhibitors-list__item'
      );
      Array.from(a).map((element) => {
        let name, url;
        name = element.querySelector(".exhibitors-list__name").innerText.replace(/,/g, "");
        url = "https://cafewfj2024.reg-visitor.com" + element.getAttribute('href');
        if(name){
            results.push({name,url})//results=[]の中に{},{},...といった辞書をプッシュしている。
        }
      });
    }
    console.log(results);
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();
