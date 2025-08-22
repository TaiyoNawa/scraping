const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策
const { add } = require('cheerio/lib/api/traversing');

const fileName = 'FOOD展.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../../../output/2025_08_22/FOOD展URL.csv', // こちらのファイルパスはご自身の環境に合わせてください
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });

    let results = [];

    //読み込むURL(件数)分ループさせる
    for (i = 0; i < records.length; i++) {
      const name = records[i].name;
      const url = records[i].url;
      let 住所 = '',
        郵便番号 = '',
        tel = '',
        email = '',
        ホームページ = '',
        出展分野 = '';

      // 収集サイトが空の場合の処理
      if (!url) {
        const result = {
          name,
          url,
          住所,
          郵便番号,
          tel,
          email,
          ホームページ,
          出展分野,
        };
        console.log(i, '収集サイトが空です:', result);
        results.push(result);
        continue; // 次のループへ
      }
      // スクレイピングするサイトの読み込み
      const response = await Axios({
        method: 'get',
        url: records[i].url,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), //AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);

      // スクレイピング
      koma = document
        .querySelector('.attribute__item.--location')
        .innerText.trim()
        .replace('小間番号：', '')
        .replace('\n', '');
      const info = document.querySelector('.overview');
      const tr = info.querySelectorAll('tr');
      tr?.forEach((i) => {
        th = i.querySelector('th').innerText;
        td = i.querySelector('td').innerText.replace(/\n/g, '').trim();
        switch (th) {
          case '住所':
            // 郵便番号と住所を分ける
            const addressMatch = td.match(/^〒?(\d{7})(.+)$/);
            if (addressMatch) {
              郵便番号 = addressMatch[1]; // 7桁の数字
              住所 = addressMatch[2].trim(); // 残りの部分
            } else {
              郵便番号 = '';
              住所 = td;
            }
            break;
          case 'TEL':
            tel = td;
            break;
          case 'E-mail':
            email = td;
            break;
          case 'ホームページ':
            ホームページ = td;
            break;
          case '出展分野':
            出展分野 = td;
            break;
          default:
            // 該当しない項目の場合は何もしない
            break;
        }
      });

      const result = {
        name,
        url,
        住所,
        郵便番号,
        tel,
        email,
        ホームページ,
        出展分野,
      };
      console.log(i, result);
      results.push(result);
    }
    // console.log(results);
    toCsv(results, path.join('output', '2025_08_22/' + fileName)); // こちらのファイルパスはご自身の環境に合わせてください
  } catch (error) {
    console.error(error);
  }
})();
