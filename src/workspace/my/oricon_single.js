// 取得URL：https://www.oricon.co.jp/rank/

const Axios = require('axios');
const parser = require('node-html-parser');
const iconv = require('iconv-lite');// 文字コード変換用にiconv-liteをインポート
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
let twoDaysBefore = `${year}-${month}-${date-2}`;
console.log(twoDaysBefore)
const fileName = `オリコンシングルランキング_${twoDaysBefore}.csv`;
const outputdir = "my-output\\oricon\\シングル"
if (!fs.existsSync(outputdir)) {
  fs.mkdirSync(outputdir, { recursive: true });
}

let results = [];
(async () => {
  try {
    // ページ数分ループ
    for(let i = 1; i <= 3; i++){

      // スクレイピングするサイトの読み込み
      const baseUrl = `https://www.oricon.co.jp/rank/js/d/${twoDaysBefore}/p/${i}/`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        responseType: 'arraybuffer', // バイナリデータとして取得
        httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      
      // iconv-liteを使ってShift_JISからUTF-8に変換(decodeはutf-8に戻す関数)
      const html = iconv.decode(response.data, 'Shift_JIS');
      
      const document = parser.parse(html);
      a = Array.from(document.querySelectorAll(".box-rank-entry"))
      b = a.forEach(i => {
          title = i.querySelector(".title").innerText
          name = i.querySelector(".name").innerText
          if(name) results.push({title,name})
      })
    }
    console.log(results);
    const outputData = stringify(results, { header: true });
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
