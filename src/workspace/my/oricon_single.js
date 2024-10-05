const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');//ファイル操作に関する関数を利用可能に
const { stringify } = require('csv-stringify/sync');//CSV形式のデータを文字列に変換するモジュール
const toCsv = require('../../lib/generateCsv');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策


const date = new Date()
console.log(date)
const today = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()-2
const fileName = `オリコンシングルランキング_${today}.csv`;
const outputdir = "my-output\\oricon\\シングル"
if (!fs.existsSync(outputdir)) {
  fs.mkdirSync(outputdir, { recursive: true });
}

let results = [];
(async () => {
  try {
    // ページ数分ループ
    for(let i = 1; i < 4; i++){

      // スクレイピングするサイトの読み込み
      const baseUrl = `https://www.oricon.co.jp/rank/js/d/2024-10-01/p/${i}/`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
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
