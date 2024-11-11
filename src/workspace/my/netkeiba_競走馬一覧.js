const Axios = require('axios');
const parser = require('node-html-parser');
const iconv = require('iconv-lite'); // 文字コード変換用にiconv-liteをインポート
const path = require('path');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');
const https = require('https');

// 日本の時間を取得
let currentDate = new Date().toLocaleString('ja-JP', {
  timeZone: 'Asia/Tokyo',
});
let year = new Date(currentDate).getFullYear();
let month = new Date(currentDate).getMonth() + 1;
let date = new Date(currentDate).getDate();
let yesterday = `${year}-${month}-${date - 1}`;
console.log(yesterday);

const fileName = `netkeiba_競走馬一覧`;
const outputdir = 'my-output\\netkeiba\\競走馬一覧';
if (!fs.existsSync(outputdir)) {
  fs.mkdirSync(outputdir, { recursive: true });
}

let results = [];
(async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const baseUrl = `https://db.netkeiba.com/?pid=horse_list&word=&match=partial_match&sire=&keito=&mare=&bms=&trainer=&owner=&breeder=&under_age=0&over_age=none&prize_min=&prize_max=&sort=prize&list=100&page=${i}`;

      const response = await Axios({
        method: 'get',
        url: baseUrl,
        responseType: 'arraybuffer', // バイナリデータとして取得
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });

      // iconv-liteを使ってEUC-JPからUTF-8に変換(decodeはutf-8に戻す関数)
      const html = iconv.decode(response.data, 'EUC-JP');

      const document = parser.parse(html);
      let a = [...document.querySelectorAll('.nk_tb_common.race_table_01 tr')];
      a.shift(); // ヘッダー行を削除

      let result = a.map((i) => {
        let td = [...i.querySelectorAll('td')];
        td.splice(0, 1);
        td.splice(3, 1); // 3番目の要素を削除
        let label = [];
        for (let j = 0; j < td.length; j++) {
          label[j] = td[j]?.innerText.replace(/\n/g, ''); // インデックス0から始める
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
          prize: label[9],
        };
      });

      results.push(result);
      console.log(result);
    }

    const outputData = stringify(results.flat(), { header: true });

    try {
      fs.writeFileSync(`${outputdir}/${fileName}.csv`, outputData, {
        encoding: 'utf-8',
      });
      console.log('ファイルが正常に保存されました');
    } catch (error) {
      console.log('ファイルの保存中にエラーが発生しました:', error);
    }
  } catch (error) {
    console.error(error);
  }
})();
