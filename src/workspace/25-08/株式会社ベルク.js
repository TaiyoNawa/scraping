const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策
const { add } = require('cheerio/lib/api/traversing');

const fileName = '株式会社ベルク.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../../../output/2025_08_04/株式会社ベルクURL.csv',
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });

    let results = [];

    //読み込むURL(件数)分ループさせる
    for (i = 0; i < records.length; i++) {
      let 拠点名 = records[i].name,
        収集サイト = records[i].url,
        拠点の住所 = '';
      拠点の電話番号 = '';
      拠点のFAX番号 = '';

      // 収集サイトが空の場合の処理
      if (!収集サイト) {
        const result = {
          拠点名,
          拠点の住所,
          拠点の電話番号,
          拠点のFAX番号,
          収集サイト,
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
      const items = document.querySelectorAll('.m-lst-desc__lstItm');

      items.forEach((item) => {
        const label = item
          .querySelector('.m-lst-desc__dt .m-lst-desc__txt')
          ?.innerText.trim();
        const value = item
          .querySelector('.m-lst-desc__dd .m-lst-desc__txt')
          ?.innerText.replace(/\n/g, '')
          .trim();

        if (label && value) {
          if (label.includes('住所')) 拠点の住所 = value;
          else if (label.includes('電話番号')) 拠点の電話番号 = value;
        }
      });

      const result = {
        拠点名,
        拠点の住所,
        拠点の電話番号,
        拠点のFAX番号,
        収集サイト,
      };
      console.log(i, result);
      results.push(result);
    }
    // console.log(results);
    toCsv(results, path.join('output', '2025_08_04/' + fileName));
  } catch (error) {
    console.error(error);
  }
})();
