const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策
const { add } = require('cheerio/lib/api/traversing');

const fileName = '化粧品産業技術展.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../../../output/2025_03_14/化粧品産業技術展URL.csv',
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
        収集サイト = records[i].url,
        小間番号 = null;

      // 収集サイトが空の場合の処理
      if (!収集サイト) {
        const result = {
          法人名称,
          サイトURL,
          住所,
          電話番号,
          メールアドレス,
          収集サイト,
          小間番号,
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
      a = document.querySelector('.details-info');
      strongTag = a.querySelector('strong'); // 小間番号の <strong> タグを取得
      小間番号 = strongTag.nextSibling.textContent.trim(); //<strong>の次のノードのテキストを取得
      b = document.querySelector('.mt20');
      td = Array.from(b.querySelectorAll('td'));
      住所 = td[0].querySelector('div')
        ? td[0]
            .querySelector('div')
            .textContent.trim()
            .replace('〒 ', '')
            .replace(/\n/g, '')
        : null; //textContentは非表示でも取得できる

      text = td[1]?.textContent;
      if (text) {
        // 電話番号を取得
        phoneMatch = text.match(/TEL\s*:\s*([\d-]+)/);
        電話番号 = phoneMatch ? phoneMatch[1] : null;

        // サイトURLを取得
        linkElement = td[1].querySelector('a[href^="http"]'); // 最初のaタグを取得
        サイトURL = linkElement ? linkElement.getAttribute('href') : null;

        // メールアドレスを取得
        emailElement = td[1].querySelector("a[href^='mailto:']");
        メールアドレス = emailElement
          ? emailElement.getAttribute('href').replace('mailto:', '')
          : null;
      }

      const result = {
        法人名称,
        サイトURL,
        住所,
        電話番号,
        メールアドレス,
        収集サイト,
        小間番号,
      };
      console.log(i, result);
      results.push(result);
    }
    // console.log(results);
    toCsv(results, path.join('output', '2025_03_14/' + fileName));
  } catch (error) {
    console.error(error);
  }
})();
