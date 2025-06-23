const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策
const { add } = require('cheerio/lib/api/traversing');

const fileName = 'OPIE2025.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../../../output/2025_03_07/OPIE2025URL.csv',
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });

    let results = [];

    //読み込むURL(件数)分ループさせる
    for (i = 0; i < records.length; i++) {
      let 法人名称 = records[i].name,
        サイトURL = '',
        住所 = '',
        電話番号 = '',
        メールアドレス = '',
        収集サイト = records[i].url;
        展示会名 = records[i].exponame;

      // 収集サイトが空の場合の処理
      if (!収集サイト) {
        const result = {
          法人名称,
          サイトURL,
          住所,
          電話番号,
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
      a = Array.from(document.querySelectorAll("#main table tbody tr"))

      住所 = (a[2].innerText + a[3].innerText)
      .replace("〒", "")
      .replace(/\n/g, "")       // 改行を削除
      .replace(/\s+/g, "");     // 空白を削除
    
    サイトURL = a[4].innerText
      .replace("URL：", "")
      .replace(/\n/g, "")       // 改行を削除
      .replace(/\s+/g, "");     // 空白を削除
    
    電話番号 = a[8].innerText
      .replace("TEL：", "")
      .replace(/\n/g, "")       // 改行を削除
      .replace(/\s+/g, "")      // 空白を削除
      .split("FAX：")[0];       // "FAX："以降を削除
      const result = {
        法人名称,
        サイトURL,
        住所,
        電話番号,
        収集サイト,
        展示会名,
      };
      console.log(i, result);
      results.push(result);
    }
    // console.log(results);
    toCsv(results, path.join('output', '2025_03_07/' + fileName));
  } catch (error) {
    console.error(error);
  }
})();
