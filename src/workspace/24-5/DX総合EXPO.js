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


function extractExpoInfo(text) {
    const match = text.match(/^(.*?) \(小間番号：(.*?)\)$/);
    if (match) {
        const exponame = match[1].trim();
        const koma = match[2].trim().replace(/\//g, ',');
        return { exponame, koma };
    } else {
        return null;
    }
}


(async () => {
  let browser;
  //CSVファイルの読み込み
  const data = await fs.readFileSync(
    __dirname + '/../output/DX総合EXPO.csv',
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
    for (i = 0 ; i < records.length; i++) {
      //URLとnameにCSVファイルのデータを格納し、仮想ブラウザーを立ち上げて、URLに格納したサイトに飛ぶ
      const page = await browser.newPage();
      const URL = await records[i].url ;
      const name = records[i].name;
      await page.goto(URL);

      try {
        //連想配列eventにnameとURLを入れる
        const event = {
          rawName: name,
          clickTarget: URL,
        };
        //クラス名.data-loadedが表示されるまで待つ
        await new Promise(resolve => setTimeout(resolve, 4000));
        const koma ="";
        const exponame ="";
        const result = await page.evaluate(() => {
          //スクレイピング  
          element = document.querySelector(".booth-num-text")?.innerText;
            a = document.querySelector(".booth-num-text")?.innerText.split(" (")
            if(a!=null){
            exponame = a[0]
            koma = a[1]?.replace(")","").replace("小間番号：","").replace(/\//g, ',');
            }else{
                exponame = ""
                koma = ""
            }
            return ({exponame, koma});
        }); //eveluate文終了
        results.push(Object.assign(event, result));
        console.log(results[i]);
      } catch (error) {
        console.log(error);
      } finally {
        await page.close();
      }
    }

    const outputData = stringify(results, { header: true });
    fs.writeFileSync(`${outputdir}/DX総合EXPO.csv`, outputData, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.log(error);
  } finally {
    browser.close();
  }
})();


