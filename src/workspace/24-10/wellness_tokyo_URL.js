const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策

const fileName = 'wellness_tokyo_URL.csv';

let results = [];
(async () => {
  try {
    // ページ数分ループ
    for (let i = 1; i <= 11; i++) {
      // スクレイピングするサイトの読み込み
      const baseUrl = `https://wellnesstokyo2024.reg-visitor.com/exhibitor?_gl=1*nnv1p5*_gcl_au*MTcyOTQ4OTY5LjE3MjUzNTExOTA&page=${i}#list`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), //AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);

      const doc = document.querySelector('ul.exhibitors-list');
      const a = Array.from(doc.querySelectorAll('.exhibitors-list__item'));
      b = a.map((i) => {
        name = i.querySelector('.exhibitors-list__name')?.innerText;
        url =
          'https://wellnesstokyo2024.reg-visitor.com' + i.getAttribute('href');
        return { name, url };
      });
      console.log(b);
      console.log(i);
      results.push(b);
    }
    console.log(results);
    toCsv(results.flat(), path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();
