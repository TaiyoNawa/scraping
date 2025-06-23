const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策
const { add } = require('cheerio/lib/api/traversing');

const fileName = 'usonar.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../../../output/2025_05_19/usonar_case.csv',
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });

    let results = [];

    //読み込むURL(件数)分ループさせる
    for (i = 0; i < records.length; i++) {
      let 会社名 = records[i].会社名,
        事例タイトル = records[i].事例タイトル,
        事例のURL = records[i].事例のURL,
        導入前の課題 = '',
        導入の決め手 = '',
        得られた効果 = '',
        役職 = '';

      // 収集サイトが空の場合の処理
      if (!事例のURL) {
        const result = {
          会社名,
          事例タイトル,
          事例のURL,
          導入前の課題,
          導入の決め手,
          得られた効果,
          役職,
        };
        console.log(i, '収集サイトが空です:', result);
        results.push(result);
        continue; // 次のループへ
      }
      // スクレイピングするサイトの読み込み
      const response = await Axios({
        method: 'get',
        url: records[i].事例のURL,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), //AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);
      // スクレイピング
      a = Array.from(document.querySelectorAll('.caseSingleSolution .item'));
      if (a.length !== 0) {
        a.forEach((i) => {
          if (i.querySelector('p')?.innerText === '導入前の課題')
            導入前の課題 = i.querySelector('ul').innerText.trim();

          if (i.querySelector('p')?.innerText === '導入の決め手')
            導入の決め手 = i.querySelector('ul').innerText.trim();

          if (i.querySelector('p')?.innerText === '得られた効果')
            得られた効果 = i.querySelector('ul').innerText.trim();
        });
      }
      yaku = [];
      tmp = Array.from(document.querySelectorAll('.caseSingleClient ul li'));
      if (tmp.length !== 0) {
        for (j = 0; j < tmp.length; j++) {
          yaku[j] = '・' + tmp[j].innerText.replace(/\n/g, '').trim();
        }
      }
      役職 = yaku.join('');

      const result = {
        会社名,
        事例タイトル,
        事例のURL,
        導入前の課題,
        導入の決め手,
        得られた効果,
        役職,
      };
      console.log(i, result);
      results.push(result);
    }
    // console.log(results);
    toCsv(results, path.join('output', '2025_05_19/' + fileName));
  } catch (error) {
    console.error(error);
  }
})();
