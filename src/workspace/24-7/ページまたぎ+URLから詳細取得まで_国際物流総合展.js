const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');
const toCsv = require('../../lib/generateCsv');
const https = require('https');//AxiosError: unable to verify the first certificateの対応策

const fileName = '国際物流総合展.csv';

let records = [];
(async () => {
  try {
    // ページ数分ループ
    for(let i = 1; i < 14; i++){

      // スクレイピングするサイトの読み込み
      const baseUrl = `https://www.logistech-online.com/webguide/list.php?page=${i}`;
      const response = await Axios({
        method: 'get',
        url: baseUrl,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })//AxiosError: unable to verify the first certificateの対応策
        //なんかSSL証明書の検証に失敗しているらしいので、検証自体を無効にする設定らしい
      });
      const html = response.data;
      const document = parser.parse(html);

    temprecords = Array.from(document.querySelectorAll(".textlink"))
    temprecords.forEach(i => {
        records.push({
            name: i.innerText,
            url: i.getAttribute("href")
        })
    })
    }
    try {
        let results = [];
        for (i = 0; i < records.length; i++) {//for文でURLを回す
            try{
          const response = await Axios({
            method: 'get',
            url: "https://www.logistech-online.com/webguide/" + records[i].url,
          });
          const html = response.data;
          const document = parser.parse(html);
          const website = document.querySelector(".textlink")?.getAttribute("href") ?? "";
          const rawName = records[i].name
          const lists = Array.from(document.querySelectorAll(".list_dots.mb20.mb0sp li"))
          let tenji = lists[0]?.innerText.includes("展") ? lists[0].innerText : "";
          let koma = lists[2]?.innerText.includes("ブース番号") ? lists[2].innerText.replace("ブース番号 ", "") : "";

          const clickTarget = "https://www.logistech-online.com/webguide/" + records[i].url
          if (rawName !== '') {
              results.push({
                rawName,
                clickTarget,
                website,
                tenji,
                koma,
              });
            }
            console.log(results[i]);
        } catch (error){
            console.error(error);
            console.log(`Error navigating to URL: ${records[i].name} - ${error}`);
            results.push({//resultsにrawNameだけプッシュしておく。変更あったらここも変える。
                rawName: records[i].name,
                clickTarget: "https://www.logistech-online.com/webguide/" + records[i].url,
                website: "",
                tenji: "",
                koma: "",
              });
        }
          };
          
        toCsv(results, path.join('output', fileName));
      } catch (error) {
        console.error(error);
      }
  } catch (error) {
    console.error(error);
  }
})();


