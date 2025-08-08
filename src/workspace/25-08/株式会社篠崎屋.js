const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https');

const fileName = '株式会社篠崎屋.csv';

(async () => {
  // ★トップレベルのtry...catchは、CSV読み込みなど致命的なエラーを捕捉するために残しておきます。
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../../../output/2025_08_04/株式会社篠崎屋URL.csv', // こちらのファイルパスはご自身の環境に合わせてください
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });

    let results = [];

    //読み込むURL(件数)分ループさせる
    for (let i = 0; i < records.length; i++) {
      // ★ let i = 0 に変更
      let 拠点名 = records[i].name,
        収集サイト = records[i].url,
        拠点の住所 = '',
        拠点の電話番号 = '',
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
        console.log(`[${i}] 収集サイトが空です: ${拠点名}`);
        results.push(result);
        continue;
      }

      // =================================================================
      // ★ここからがループ内のエラーハンドリング処理です
      // =================================================================
      try {
        // スクレイピングするサイトの読み込み
        const response = await Axios({
          method: 'get',
          url: 収集サイト, // ★ records[i].url から 収集サイト に変更
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          timeout: 10000, // ★タイムアウトを10秒に設定
        });
        const html = response.data;
        const document = parser.parse(html);

        // スクレイピング
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach((row) => {
          const tds = row.querySelectorAll('td');
          if (tds.length === 2) {
            const label = tds[0].innerText.trim();
            const value = tds[1].innerText.trim();
            if (label.includes('電話番号')) {
              拠点の電話番号 = value;
            } else if (label.includes('住所')) {
              拠点の住所 = value;
            }
          }
        });
      } catch (error) {
        // ★ Axiosでエラー（リンク切れ、タイムアウト等）が発生した場合の処理
        console.error(
          `[${i}] ${拠点名} のURLでエラーが発生しました: ${収集サイト}`
        );
        // エラー内容に応じて、出力するCSVの項目に印を付けます
        if (error.response) {
          // 404エラーなど、サーバーから応答があったがエラーの場合
          拠点の住所 = `エラー: ${error.response.status} ${error.response.statusText}`;
        } else {
          // サーバーからの応答がない場合（DNS解決エラー、タイムアウトなど）
          拠点の住所 = `エラー: サーバーに接続できません`;
        }
        // console.error(error.message); // 詳細なエラーメッセージが必要な場合
      }
      // =================================================================
      // ★エラーハンドリング処理ここまで
      // =================================================================

      // エラーがあってもなくても、結果は必ずresults配列に追加します
      const result = {
        拠点名,
        拠点の住所,
        拠点の電話番号,
        拠点のFAX番号,
        収集サイト,
      };
      console.log(`[${i}] 処理完了: ${拠点名}`);
      results.push(result);
    }

    toCsv(results, path.join('output', '2025_08_04/' + fileName)); // こちらのファイルパスはご自身の環境に合わせてください
  } catch (error) {
    console.error('スクリプト全体で致命的なエラーが発生しました:', error);
  }
})();
