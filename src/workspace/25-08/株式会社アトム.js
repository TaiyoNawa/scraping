const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策

const fileName = '株式会社アトム.csv';

let results = [];
(async () => {
  try {
    // ページ数分ループ
    for (let i = 0; i <= 240; i += 30) {
      // スクレイピングするサイトの読み込み
      const baseUrl = `https://www.atom-corp.co.jp/search/index.php?mode=search&area1_no=&name=&address=&station=&contact=&zip_tel=&page=${i}`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), //AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);

      a = Array.from(document.querySelectorAll('.result_list a'));
      b = a.map((i) => {
        div = i.querySelectorAll('div');
        name = div[0].innerText
          .replace(/\n/g, '')
          .trim()
          .replace('ランチ営業', '')
          .replace(/ /g, '');
        td = div[1].querySelectorAll('.table_plain td');
        address = td[0].innerText.replace(/\n/g, '').trim().replace(/ /g, '');
        tel = td[2].innerText.replace(/\n/g, '').trim().replace(/ /g, '');
        return { name, address, tel };
      });

      results.push(b);
    }
    console.log(results);
    toCsv(results.flat(), path.join('output', '2025_08_04', fileName));
  } catch (error) {
    console.error(error);
  }
})();
