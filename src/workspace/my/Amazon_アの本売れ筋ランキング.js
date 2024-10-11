/* dockerコマンド
docker-compose build
docker-compose run --rm app bash
node src/workspace/... */

//年齢確認ページを通り抜けられるようにする

const { launchBrowser, displayLog } = require('./../../lib/browser');
const fs = require('fs');//ファイル操作に関する関数を利用可能に
const path = require('path');//パスの結合、解析、正規化などの操作が可能に
const { stringify } = require('csv-stringify/sync');//CSV形式のデータを文字列に変換するモジュール
const parse = require('csv-parse/sync');//CSV形式の文字列を解析してJavaScriptのオブジェクトに変換するためのモジュール
const puppeteer = require('puppeteer');//headless:newにするためにとりあえずインポート
const directoryName = "アダルト本の売れ筋ランキング"//取得するものの名前
const outputdir = `my-output/Amazon/${directoryName}`;//scraping/　以降のパスを指定。
//時間取得
let currentDate = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });//東京の時間を取得
let year = new Date(currentDate).getFullYear();
let month = new Date(currentDate).getMonth() + 1; // 月は0ベースなので+1する必要があります
let date = new Date(currentDate).getDate();
let hour = new Date(currentDate).getHours();
let fileDate = `${year}-${month}-${date}-${hour}`;

(async () => {
    console.log(fileDate)
    console.log(currentDate)
    let browser;
    //最終的な結果を入れる
    const all_results = [];
    
    //CSVファイルを作るディレクトリの作成
    if (!fs.existsSync(outputdir)) {
        fs.mkdirSync(outputdir, { recursive: true });
      }

    try {
      //仮想的なブラウザーを立ち上げるための関数をbrowserに格納
       // browser = await launchBrowser();
       browser = await launchBrowser();
       await new Promise(resolve => setTimeout(resolve, 5000)); //最初のブラウザ立ち上げから5秒待つ（これしないと最初の行が取得できない）

      //スクレイピングする月の数だけループする
      for (let i = 1; i <= 2; i++) {
        try {
          const page = await browser.newPage();
          const URL = `https://www.amazon.co.jp/gp/bestsellers/books/10667101/ref=zg_bs_pg_${i}_books?ie=UTF8&pg=${i}`
          await page.goto(URL, { timeout: 10000 });
          // スクリーンショットを撮影してファイルに保存
          //await page.screenshot({ path: `${outputdir}/screenshot.png`, fullPage: true });
          try {

          //クラス名.data-loadedが表示されるまで待つ
          // await page.waitForSelector('#gridItemRoot', {timeout: 6000});
          // ページを最後までスクロール
          await autoScroll(page);
          const result = await page.evaluate(() => {
            const results = []
            a = [...document.querySelectorAll("#gridItemRoot")]

            b = a.forEach(i => {
              temp = i.querySelector(".zg-grid-general-faceout div div:nth-child(2) div")
              name = temp.querySelector("a").innerText
              url = "https://www.amazon.co.jp" + temp.querySelector("a").getAttribute("href")
              temp_div = temp.querySelectorAll(".a-row")
              auther = temp.querySelector(".a-size-small.a-link-child")?.innerText || temp.querySelector(".a-size-small.a-color-base")?.innerText
              category = temp.querySelector(".a-color-secondary").innerText || ""
              price = temp_div[[...temp_div].length -2].innerText
              point = temp_div[[...temp_div].length -1].innerText
              review = temp.querySelector(".a-icon-row a") ? temp.querySelector(".a-icon-row a").getAttribute("title")?.replace("5つ星のうち","") + `(${temp.querySelector(".a-icon-row a .a-size-small")?.innerText})` : ""
              if(name) results.push({name,url,auther,category,price,point,review})
          });
            return results;
          }); // month変数を引数として渡す
          console.log(result)
          all_results.push(...result);  // 配列を展開して結果を追加
        } catch (error) {
          console.log(error);
        } finally {
          await page.close();
        }
      }catch (error) {
        console.log(error)
      }
    }
      const outputData = stringify(all_results, { header: true });
      try {
        fs.writeFileSync(`${outputdir}/Amazon_${directoryName}_${fileDate}.csv`, outputData, {
          encoding: 'utf8',
        });
        console.log("ファイルが正常に保存されました");
      } catch (error) {
        console.log("ファイルの保存中にエラーが発生しました:", error);
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }    
  })();

// ページを最後までスクロールする関数
async function autoScroll(page) {
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          let totalHeight = 0;
          const distance = 100; // スクロールする距離(px)
          const timer = setInterval(() => {
              window.scrollBy(0, distance);
              totalHeight += distance;

              // ページの全体の高さに到達したらスクロールを停止
              if (totalHeight >= document.body.scrollHeight) {
                  clearInterval(timer);
                  resolve();
              }
          }, 100); // 100msごとにスクロール
      });
  });
}