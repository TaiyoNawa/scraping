const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策
const { add } = require('cheerio/lib/api/traversing');

const fileName = '株式会社魚喜.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../../../output/2025_08_04/株式会社魚喜URL.csv', // こちらのファイルパスはご自身の環境に合わせてください
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
      // 店舗情報テーブル内の全行を取得
      const rows = document.querySelectorAll('.store-info table tr');

      // 各行をループして情報を抽出
      rows.forEach((row) => {
        const th = row.querySelector('th');
        const td = row.querySelector('td');

        // thとtdの両方が存在する場合のみ処理
        if (th && td) {
          const label = th.innerText.trim(); // ラベル（'住所', 'TEL', 'FAX'など）
          const value = td.innerText.trim(); // 値

          if (label === '住所') {
            // 郵便番号（〒...）の行を除外し、改行をなくして住所を整形
            const addressParts = value.split('\n');
            if (addressParts[0].includes('〒')) {
              addressParts.shift(); // 最初の要素（郵便番号）を削除
            }
            拠点の住所 = addressParts.join('').trim().replace(/\t/g, ''); // 残りの部分を結合
          } else if (label === 'TEL') {
            拠点の電話番号 = value;
          } else if (label === 'FAX') {
            拠点のFAX番号 = value;
          }
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
    toCsv(results, path.join('output', '2025_08_04/' + fileName)); // こちらのファイルパスはご自身の環境に合わせてください
  } catch (error) {
    console.error(error);
  }
})();
