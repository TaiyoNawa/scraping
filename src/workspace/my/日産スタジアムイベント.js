/* dockerコマンド
docker-compose build
docker-compose run --rm app bash
node src/workspace/... */

//URL:https://www.nissan-stadium.jp/sp/calendar/
const { launchBrowser, displayLog } = require('./../../lib/browser');
const fs = require('fs');//ファイル操作に関する関数を利用可能に
const path = require('path');//パスの結合、解析、正規化などの操作が可能に
const { stringify } = require('csv-stringify/sync');//CSV形式のデータを文字列に変換するモジュール
const parse = require('csv-parse/sync');//CSV形式の文字列を解析してJavaScriptのオブジェクトに変換するためのモジュール
const puppeteer = require('puppeteer');//headless:newにするためにとりあえずインポート
const outputdir = "my-output/日産スタジアム";//scraping/　以降のパスを指定。


(async () => {
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
       month_english = ["","x","a"]
       months = [10, 11, 12]
       
      //スクレイピングする月の数だけループする
      for (let i = 0; i < month_english.length; i++) {
        try {
          const page = await browser.newPage();
          const URL = `https://www.nissan-stadium.jp/sp/calendar/?m=${month_english[i]}`
          const month = months[i]
          await page.goto(URL, { timeout: 60000 });
          try {

          //クラス名.data-loadedが表示されるまで待つ
          await page.waitForSelector('.mds_red_bg', {timeout: 60000});
  
          const result = await page.evaluate((month) => {
            const results = []
            const a = [...document.querySelectorAll(".calendartable01 tr")];
            a.forEach(row => {
              const 日 = row.querySelector("th").innerText;
              const 曜日 = row.querySelector(".th01").innerText;
              let イベント名 = row.querySelector("td")?.innerText.replace(/\n/g, "");
              if (日) {
                results.push({月: month, 日, 曜日, イベント名});
              } else {
                results[results.length - 1].イベント名 = イベント名;
              }
            });
            return results;
          }, month); // month変数を引数として渡す
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
        fs.writeFileSync(`${outputdir}/日産スタジアムイベント一覧(${months.join(",")}月).csv`, outputData, {
          encoding: 'utf8',
        });
        console.log("ファイルが正常に保存されました");
      } catch (error) {
        console.log("ファイルの保存中にエラーが発生しました:", error);
      }
    } catch (error) {
      console.log(error);
    } finally {
        browser.close();
    }
  })();

