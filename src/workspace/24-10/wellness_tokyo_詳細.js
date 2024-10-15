const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策

const fileName = 'Wellness_Tokyo.csv';

(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../../../output/wellness_tokyo_URL.csv',
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });

    let results = [];

    //読み込むURL(件数)分ループさせる
    for (i = 0; i < records.length; i++) {
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
      let rawName, address, tel, email, website, koma, kyoudou;
      clickTarget = records[i].url;
      koma = document
        .querySelector('.exhibitors-detail-top__booth-number')
        .innerText.replace('小間番号：', '');
      kyoudou = document.querySelector(
        '.exhibitors-detail-top__zone'
      ).innerText;
      a = document
        .querySelector('.recommend-list-section')
        .querySelectorAll('tr');
      Array.from(a).forEach((i) => {
        const thText = i.querySelector('th').innerText;
        const tdText = i.querySelector('td').innerText;
        if (thText === '会社名') {
          rawName = tdText;
        } else if (thText === '住所') {
          address = tdText;
        } else if (thText === '電話番号') {
          tel = tdText;
        } else if (thText === 'メールアドレス') {
          email = tdText;
        } else if (thText === 'URL') {
          website = i.querySelector('a').getAttribute('href');
        }
      });
      const result = {
        rawName,
        clickTarget,
        address,
        tel,
        email,
        website,
        koma,
        kyoudou,
      };
      console.log(result);
      results.push(result);
    }
    // console.log(results);
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();
