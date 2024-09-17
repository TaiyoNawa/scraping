//全ての変数名を毎回確実に格納しないと、result内の全ての行でその変数が表示されなくなる！！
//エラー時の定義はもちろん、エラーじゃない時も宣言や、let 〇〇 = "" などとして、resultsに確実に格納されるようにしよう！！
const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');
const https = require('https'); //AxiosError: unable to verify the first certificateの対応策
Axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false }); //グローバルに証明書の検証を無効にする

const fileName = 'レジャー&アウトドアジャパン.csv';

let records = [];
(async () => {
  try {
    // ページ数分ループ
    for (let i = 1; i < 18; i++) {
      // スクレイピングするサイトの読み込み
      const baseUrl = `https://leisure2024.reg-visitor.com/exhibitor//?page=${i}`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }), //AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);
      a = [...document.querySelectorAll('.col-3')];
      a.forEach((i) => {
        name = i.querySelector('p').innerText.replace(',', '');
        url = i.querySelector('a')
          ? 'https://leisure2024.reg-visitor.com' +
            i.querySelector('a').getAttribute('href')
          : '';
        records.push({
          name,
          url,
        });
      });
    }
    try {
      let results = [];
      for (i = 0; i < records.length; i++) {
        //for文でURLを回す
        try {
          const response = await Axios({
            method: 'get',
            url: records[i].url,
          });
          const html = response.data;
          const document = parser.parse(html);
          let URL, 代表者名, 国, 住所, 電話番号, メールアドレス;
          contents = document.querySelector('.recommend-list-section');
          lists = Array.from(contents.querySelectorAll('tr'));
          listName = [
            ['会社名', ''],
            ['代表者名', ''],
            ['国', ''],
            ['住所', ''],
            ['電話番号', ''],
            ['メールアドレス', ''],
            ['URL', ''],
          ];
          listName.forEach((j) => {
            lists.forEach((k) => {
              if (k.querySelector('th')?.innerText === j[0]) {
                j[1] = k.querySelector('td').innerText;
                // values[j[0]] = j[1]; // 動的に変数のように扱う
                //これだと確実に定義されないからダメ
              }
            });
          });
          会社名 = listName[0][1];
          代表者名 = listName[1][1];
          国 = listName[2][1];
          住所 = listName[3][1];
          電話番号 = listName[4][1];
          メールアドレス = listName[5][1];
          URL = listName[6][1];
          取得URL = records[i].url;
          let 共同出展社 = document
            .querySelector('.exhibitors-detail-top__info-area div div')
            .innerText.replace('共同出展社：', '');
          if (会社名 !== '') {
            results.push({
              会社名,
              取得URL,
              代表者名,
              国,
              住所,
              電話番号,
              メールアドレス,
              URL,
              共同出展社,
            });
          }
          console.log(results[i]);
        } catch (error) {
          console.error(error);
          console.log(`Error navigating to URL: ${records[i].name} - ${error}`);
          results.push({
            //resultsにrawNameだけプッシュしておく。変更あったらここも変える。
            会社名: '',
            取得URL: records[i].url,
            URL: '',
            代表者名: '',
            国: '',
            住所: '',
            電話番号: '',
            メールアドレス: '',
            共同出展社: '',
          });
        }
      }
      toCsv(results, path.join('output', fileName));
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
})();
