// 取得URL：https://www.oricon.co.jp/rank/

const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');//ファイル操作に関する関数を利用可能に
const { stringify } = require('csv-stringify/sync');//CSV形式のデータを文字列に変換するモジュール
const toCsv = require('../../lib/generateCsv');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策
//時間取得（前日）
let currentDate = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });//東京の時間を取得
let year = new Date(currentDate).getFullYear();
let month = new Date(currentDate).getMonth() + 1; // 月は0ベースなので+1する必要があります
let date = new Date(currentDate).getDate();
// let hour = new Date(currentDate).getHours();
let today = `${year}-${month}-${date}`;
console.log(today)
const fileName = `netkeiba競走馬一覧.csv`;
const outputdir = "my-output\\netkeiba\\競走馬一覧"
if (!fs.existsSync(outputdir)) {
  fs.mkdirSync(outputdir, { recursive: true });
}

let results = [];
(async () => {
  try {
    // ページ数分ループ
    for(let i = 1; i <= 2; i++){

      // スクレイピングするサイトの読み込み
      const baseUrl = `https://db.netkeiba.com//?pid=horse_list&word=&match=partial_match&sire=&keito=&mare=&bms=&trainer=&owner=&breeder=&under_age=0&over_age=none&prize_min=&prize_max=&sort=prize&list=100&page=${i}`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);
      let a = [...document.querySelectorAll(".nk_tb_common.race_table_01 tr")];
      a.shift(); // ヘッダー行を削除

      let result = a.map(i => {
      let td = [...i.querySelectorAll("td")];
      td.splice(0,1)
      td.splice(3,1); // 3番目の要素を削除
      let label = []; // labelをリセット

      for (let j = 0; j < td.length; j++) {
          label[j] = td[j]?.innerText; // インデックス0から始める
      }
    
      return {
        name: label[0],
        gender: label[1],
        birthYear: label[2],
        stable: label[3],
        father: label[4],
        mother: label[5],
        mamsFather: label[6],
        owner: label[7],
        farm: label[8],
        prize: label[9]
      };
    });
    results.push(result)
    console.log(result);
    }
    const outputData = stringify(results.flat(), { header: true });//.flat()で二次元配列を一次元に
    try {
      fs.writeFileSync(`${outputdir}/${fileName}.csv`, outputData, {
        encoding: 'utf-8',
      });
      console.log("ファイルが正常に保存されました");
    } catch (error) {
      console.log("ファイルの保存中にエラーが発生しました:", error);
    }
    //上の８行（try～）は toCsv(results, path.join(outputdir, fileName));で代用可
  } catch (error) {
    console.error(error);
  }
})();
