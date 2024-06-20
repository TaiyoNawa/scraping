/* docker使うコマンド
# docker imageを buildします。
docker-compose build

# docker app containerにアクセスします。(bash)
docker-compose run --rm app bash

# containerアクセス後、スクリプトを実行(例はsample-level3.js, googleの検索画面をpupeteerを使ってスクショ)
例：node src/workspace/sample-level3.js */

const { launchBrowser, displayLog } = require('./../../lib/browser');
const fs = require('fs');
const path = require('path');
const { stringify } = require('csv-stringify/sync');
const parse = require('csv-parse/sync');
const outputdir = 'output';
const puppeteer = require('puppeteer');


(async () => {
  let browser;
  //CSVファイルの読み込み
  const data = await fs.readFileSync(
    __dirname + '/../output/社長メシURL.csv',
    'utf-8'
  );
  const records = parse.parse(data, {
    columns: true,
  });
  //最終的な結果を入れる
  const results = [];

  //CSVファイルを作るディレクトリの作成
  if (!fs.existsSync(path.join(outputdir))) fs.mkdirSync(outputdir);

  try {
    //仮想的なブラウザーを立ち上げるための関数をbrowserに格納
    browser = await launchBrowser();

    //スクレイピングする会社の数だけループする
    for (i = 0; i < records.length; i++) {//URLとnameにCSVファイルのデータを格納し、仮想ブラウザーを立ち上げて、URLに格納したサイトに飛ぶ。
      try{//URLのタイムアウトエラーなどのエラーが起こった際に、強制終了せずに次のfor文に繋げるようにtry-catch構文を使う。
      const page = await browser.newPage();
      const URL = await records[i].url;
      const name = records[i].name;
      await page.goto(URL,{ timeout: 60000});//pageに飛ぶ際のtimeoutをここで設定する。timeout: 0で無限に待つ。
      //displayLog(page);

      try {
        //連想配列eventにnameとURLを入れる
        const event = {
          rawName: name,
          clickTarget: URL,
        };

        //クラス名.data-loadedが表示されるまで待つ
        await page.waitForSelector('.basic-info-wrapper', {timeout: 60000});//（多分欲しい情報が表示されるまでの時間を）ここで時間を決めれる。0で無限に待つ。
        //ロードされた後に表示されるクラス名をここで指定しておけば、そのクラス名が表示されるまでtimeoutミリ秒待つ。

        const result = await page.evaluate((record) => {
          //スクレイピング  
          const rawName = record.name
          let website = document.querySelector(".company-container a")?.getAttribute("href");
          console.log(website)
          const rep = record.rep.trim();
          const url = record.url;
            
          return({
            rawName, website, rep, url
          });
        },records[i]); //eveluate文終了
        results.push(Object.assign(result));
        console.log(results[i]);
      } catch (error) {
        console.log(error);
      } finally {
        await page.close();
      }
    }catch (error) {//URL遷移などのエラーが起きた時の処理
      console.log(`Error navigating to URL: ${records[i].name}, ${records[i].url} - ${error}`);
      results.push({//resultsにrawNameだけプッシュしておく。変更あったらここも変える。
        rawName: records[i].name,
        website: "",
        rep: records[i].rep.trim(),
        url: records[i].url
      });
    }
  }

    const outputData = stringify(results, { header: true });
    fs.writeFileSync(`${outputdir}/社長メシ.csv`, outputData, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.log(error);
  } finally {
    browser.close();
  }
})();

/* evaluate内で
records[i].name
などを使おうとすると、recordsが未定義であるとエラーが出る。
Puppeteerのevaluateメソッドでは、
ブラウザのページ上で実行するJavaScriptコードを指定するが、
その中で外部の変数やデータにアクセスする場合、
明示的に渡す必要がある。
上のように 
       const result = await page.evaluate((record) => {
        ...
        name = record.name;

       },records[i]); 

とすると、明示的になるので、うまくいく

 */