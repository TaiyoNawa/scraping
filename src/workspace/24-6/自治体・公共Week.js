/* docker使うコマンド
# docker imageを buildします。
docker-compose build

# docker app containerにアクセスします。(bash)
docker-compose run --rm app bash

# containerアクセス後、スクリプトを実行(例はsample-level3.js, googleの検索画面をpupeteerを使ってスクショ)
例：node src/workspace/sample-level3.js */

// 自治体・公共Week
const { launchBrowser, displayLog } = require('./../../lib/browser');
const fs = require('fs');
const path = require('path');
const { stringify } = require('csv-stringify/sync');
const parse = require('csv-parse/sync');
const outputdir = 'output';

(async () => {
  let browser;
  //CSVファイルの読み込み
  const data = await fs.readFileSync(
    __dirname + '/../output/自治体・公共Week.csv',
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
    for (i = 0; i < records.length; i++) {
      //URLとnameにCSVファイルのデータを格納し、仮想ブラウザーを立ち上げて、URLに格納したサイトに飛ぶ
      const page = await browser.newPage();
      const URL = await records[i].url;
      const name = records[i].name;
      await page.goto(URL,{timeout:0});
      //displayLog(page);

      try {
        //連想配列eventにnameとURLを入れる
        const event = {
          rawName: name,
          clickTarget: URL,
        };

        //クラス名.data-loadedが表示されるまで待つ
        await page.waitForSelector('.data-loaded', {timeout: 0});//ここで時間を決めれる

        const result = await page.evaluate(() => {
          //スクレイピング  
          const tenji = document.querySelector('[data-dtm-category-name="展示会"] span')?.innerText;
          const elements = document.querySelectorAll('.right-column-section')
            let komabango, website, email, tel ,country;
            let address = ""
            
            Array.from(elements).map((j) => {
            if(j.querySelector("h2").innerText === '小間番号：'){
                komabango = j.querySelector("p").innerText
            }
            if(j.querySelector('.website a')){
                website = j.querySelector('.website a')?.getAttribute("href")
            }
            if(j.querySelector('.email a')){
                email = j.querySelector('.email a')?.getAttribute("href")
            }
            if(j.querySelector(".phone a")){
                tel = j.querySelector(".phone a")?.getAttribute("href").replace(/tel:/g, '')
            }

            if(j.querySelector(".address p")){
                span = Array.from(j.querySelectorAll(".address p span"))
                country = span[0]?.innerText.replace(/\n/g, '')
                for(let k=1; k<span.length; k++){
                    address += span[k]?.innerText.replace(/\n/g, '');
                }
            }
          })
          const exponameTemp = Array.from(document.querySelectorAll('[data-dtm-category-name="展示会名"] div span'))//展示会名を全て取得して配列格納し、','で区切って結合
          if(exponameTemp!=null){
            exponame = exponameTemp.map(i => {
              name = i.innerText.replace(/-/g,"")
              return name
            }).join(",")
            }else{
            exponame = ""
          }
          return({
            exponame,tenji, komabango, website, tel, email, address, country, 
          });
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
    fs.writeFileSync(`${outputdir}/自治体・公共Week.csv`, outputData, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.log(error);
  } finally {
    browser.close();
  }
})();

