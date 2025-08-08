const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策
const { add } = require('cheerio/lib/api/traversing');

const fileName = '鳥取銀行.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../../../output/2025_08_04/鳥取銀行URL.csv',
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
      const tr = document.querySelectorAll('tr');

      tr.forEach((row) => {
        const th = row.querySelector('th')?.innerText.trim();
        const td = row.querySelector('td')?.innerText.trim();

        if (!th || !td) return;

        if (th.includes('所在地')) {
          拠点の住所 = td;
        } else if (th.includes('電話番号')) {
          拠点の電話番号 = td;
        } else if (th.includes('FAX番号')) {
          拠点のFAX番号 = td;
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
