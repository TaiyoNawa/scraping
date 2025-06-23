const Axios = require('axios'); //axiosだとデフォだとスマホサイズのHTML要素を取得するので、デスクトップサイズのHTML要素を取得する際には注意
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策

const fileName = 'CPHI_Japan.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../../../output/2025_03_31/CPHI_JapanURL.csv',
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });

    let results = [];

    //読み込むURL(件数)分ループさせる
    for (i = 0; i < records.length; i++) {
      let 法人名称 = records[i].法人名称,
        収集サイト = records[i].収集サイト,
        小間番号 = records[i].小間番号,
        住所 = '',
        電話番号 = '',
        メールアドレス = '',
        サイトURL = '',
        FAX = '';

      // 収集サイトが空の場合の処理
      if (!収集サイト) {
        const result = {
          法人名称,
          サイトURL,
          住所,
          電話番号,
          メールアドレス,
          小間番号,
          FAX,
          収集サイト,
        };
        console.log(i, '収集サイトが空です:', result);
        results.push(result);
        continue; // 次のループへ
      }
      // スクレイピングするサイトの読み込み
      const response = await Axios({
        method: 'get',
        url: 収集サイト,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), //AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);

      // スクレイピング
      a = [...document.querySelectorAll('.tblGr tr')];
      for (j = 0; j < a.length; j++) {
        if (a[j].querySelector('th').innerText.includes('住所')) {
          住所 = a[j].querySelector('td').innerText.trim().replace(/\n/g, '');
        }
        if (a[j].querySelector('th').innerText.includes('URL')) {
          サイトURL = a[j]
            .querySelector('td')
            .innerText.trim()
            .replace(/\n/g, '');
        }
        if (a[j].querySelector('th').innerText.includes('TEL')) {
          電話番号 = a[j]
            .querySelector('td')
            .innerText.trim()
            .replace(/\n/g, '');
        }
        if (a[j].querySelector('th').innerText.includes('Email')) {
          メールアドレス = a[j]
            .querySelector('td')
            .innerText.trim()
            .replace(/\n/g, '');
        }
        if (a[j].querySelector('th').innerText.includes('FAX')) {
          FAX = a[j].querySelector('td').innerText.trim().replace(/\n/g, '');
        }
      }
      const result = {
        法人名称,
        サイトURL,
        住所,
        電話番号,
        メールアドレス,
        小間番号,
        FAX,
        収集サイト,
      };
      console.log(i, result);
      results.push(result);
    }
    // console.log(results);
    toCsv(results, path.join('output', '2025_03_31/' + fileName));
  } catch (error) {
    console.error(error);
  }
})();
