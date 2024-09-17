const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const fs = require('fs');
const toCsv = require('../../lib/generateCsv');
const parse = require('csv-parse/sync');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策
const { contents } = require('cheerio/lib/api/traversing');

const fileName = '日経メッセ.csv';


//今回のURL：
(async () => {
  try {
    //CSVファイル読み込み
    const data = await fs.readFileSync(
      __dirname + '/../output/日経メッセ🙆.csv',
      'utf-8'
    );
    const records = parse.parse(data, {
      columns: true,
    });

    let results = [];

    //読み込むURL(件数)分ループさせる
    for (i = 0; i < records.length; i++) {
      try{
      // スクレイピングするサイトの読み込み
      const response = await Axios({
        method: 'get',
        url: records[i].url,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);

      // スクレイピング
      let rawName = records[i].name;
      clickTarget = records[i].url;
      let 小間番号 = document.querySelector(".boothNumber").innerText
                .replace("小間番号 :", "") // 「小間番号 : 」を削除
                .replace(/\s+/g, '')        // 余分な空白や改行を削除
                .trim();                    // 前後の空白を削除
      let contents = [...document.querySelector(".companyInfoContainer").querySelectorAll("tr")].map(i => {
        return i.querySelector("td")
    })

    const 住所 = contents[1].innerText.replace(/\s+/g, '') .replace(/\n/g, '').replace(/\t/g, '').trim();
    const 電話番号 = contents[2].innerText.replace(/\n/g, '').replace(/\t/g, '').replace(/\s+/g, '') .trim();
    const メールアドレス = contents[3].querySelector("a")?.innerText.replace(/\n/g, '').replace(/\t/g, '').replace(/\s+/g, '') .trim();
    const HP = contents[4].innerText.replace(/\n/g, '').replace(/\t/g, '').replace(/\s+/g, '') .trim();

    const result = { rawName, clickTarget, 小間番号, 住所, 電話番号, メールアドレス, HP};
    console.log(result);
    results.push(result)
    }catch(error){
        console.log(error)
        results.push({//resultsにプッシュしておく。変更あったらここも変える。
          rawName: records[i].name,
          clickTarget: records[i].rawName,
          小間番号: "",
          住所: "",
          電話番号: "",
          メールアドレス: "",
          HP: ""
        });
    }}
    // console.log(results);
    toCsv(results, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();