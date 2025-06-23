/* docker使うコマンド
# docker imageを buildします。
docker-compose build
# docker app containerにアクセスします。(bash)
docker-compose run --rm app bash
# containerアクセス後、スクリプトを実行(例はsample-level3.js, googleの検索画面をpupeteerを使ってスクショ)
例：node src/workspace/sample-level3.js */

const { launchBrowser, displayLog } = require('../../lib/browser');
const fs = require('fs'); //ファイル操作に関する関数を利用可能に
const path = require('path'); //パスの結合、解析、正規化などの操作が可能に
const { stringify } = require('csv-stringify/sync'); //CSV形式のデータを文字列に変換するモジュール
const parse = require('csv-parse/sync'); //CSV形式の文字列を解析してJavaScriptのオブジェクトに変換するためのモジュール
const outputdir = 'output/2025_03_18';
const puppeteer = require('puppeteer'); //headless:newにするためにとりあえずインポート。使われてないように見えるが、launchBrowse()内では使用されている

(async () => {
  let browser;
  const data = await fs.readFileSync(
    __dirname + '/../../../output/2025_03_18/ものづくりワールド名古屋URL.csv',
    'utf-8'
  );
  const records = parse.parse(data, {
    columns: true,
  });

  const results = [];

  //CSVファイルを作るディレクトリの作成
  if (!fs.existsSync(path.join(outputdir))) fs.mkdirSync(outputdir);

  try {
    //仮想的なブラウザーを立ち上げるための関数をbrowserに格納
    browser = await launchBrowser();
    await new Promise((resolve) => setTimeout(resolve, 10000)); //最初のブラウザ立ち上げから10秒待つ（これしないと最初の行が取得できない）

    //スクレイピングする会社の数だけループする
    for (i = 0; i < records.length; i++) {
      try {
        const page = await browser.newPage();
        const URL = await records[i].url;
        const name = records[i].name;
        await page.goto(URL, { timeout: 60000 });
        //displayLog(page);

        try {
          //連想配列eventにnameとURLを入れる
          const event = {
            rawName: name,
            clickTarget: URL,
          };

          //クラス名.data-loadedが表示されるまで待つ
          await page.waitForSelector('.data-loaded', { timeout: 60000 });

          const result = await page.evaluate(() => {
            //最初に宣言しないとCSVに含まれない可能性もあるので初期化
            let komabango = '',
              website = '',
              email = '',
              tel = '',
              country = '',
              address = '',
              tenji = '';
            //tenji = document.querySelector('[data-dtm-category-name="展示会"] span')?.innerText ?? "";
            const elements = document.querySelectorAll(
              '.exhibitor-details-contact-us-container'
            );
            //小間番号⇨新規で作ったから取れてるかチェックして
            komabango = Array.from(
              document.querySelectorAll('.stand-reference-label:nth-child(3)')
            )[0]?.innerText;
            Array.from(elements).map((j) => {
              if (
                j.querySelector('[data-dtm="exhibitorDetails_externalLink"]')
              ) {
                website = j
                  .querySelector('[data-dtm="exhibitorDetails_externalLink"]')
                  ?.getAttribute('href');
              }
              if (j.querySelector('[data-dtm="exhibitorDetails_emailLink"]')) {
                email = j
                  .querySelector('[data-dtm="exhibitorDetails_emailLink"]')
                  ?.getAttribute('href')
                  .replace(/mailto:/g, '');
              }
              if (j.querySelector('[data-dtm="exhibitorDetails_phoneLink"]')) {
                tel = j
                  .querySelector('[data-dtm="exhibitorDetails_phoneLink"]')
                  ?.getAttribute('href')
                  .replace(/tel:/g, '');
              }
            });
            if (document.querySelector('.address p')) {
              span = Array.from(document.querySelectorAll('.address p span'));
              country = span[0]?.innerText.replace(/\n/g, '');
              for (let k = 1; k < span.length; k++) {
                address += span[k]?.innerText.replace(/\n/g, '');
              }
            }
            //ここ以降新バージョンに変更してないので上手く取れなかったら改善してください（kyodoは撮れること確認済み）
            const exponameTemp = Array.from(
              document.querySelectorAll(
                '[data-dtm-category-name="展示会・出展カテゴリ"] div span'
              )
            ); //展示会名を全て取得して配列格納し、','で区切って結合。名前はうまく変えて。
            if (exponameTemp != null) {
              exponame = exponameTemp
                .map((i) => {
                  name = i.innerText.replace(/-/g, '');
                  return name;
                })
                .join(',');
            } else {
              exponame = '';
            }
            const tenjiTemp = Array.from(
              document.querySelectorAll(
                '[data-dtm-category-name="展示会"] span'
              )
            ); //展示会名を全て取得して配列格納し、','で区切って結合。名前はうまく変えて。
            if (tenjiTemp != null) {
              tenji = tenjiTemp
                .map((i) => {
                  name = i.innerText.replace(/-/g, '');
                  return name;
                })
                .join(',');
            } else {
              tenji = '';
            }
            kyodoTemp = Array.from(
              document.querySelectorAll('.sharer-section a')
            ); //共同出展社を全て取得して配列格納し、','で区切って結合。
            kyodoMainTemp = document.querySelectorAll('#mainStandHolderLink');
            kyodoTemp.unshift(...kyodoMainTemp); //...を使うことで配列としてではなく要素そのものを挿入できる
            if (kyodoTemp != null) {
              kyodo = kyodoTemp
                .map((i) => {
                  name = i.innerText.replace(/-/g, '');
                  return name;
                })
                .join(',');
            } else {
              kyodo = '';
            }
            return {
              exponame,
              tenji,
              komabango,
              website,
              tel,
              email,
              address,
              country,
              kyodo,
            };
          }); //eveluate文終了
          results.push(Object.assign(event, result));
          console.log(results[i]);
        } catch (error) {
          console.log(error);
        } finally {
          await page.close();
        }
      } catch (error) {
        //URL遷移などのエラーが起きた時の処理
        console.log(`Error navigating to URL: ${records[i].name} - ${error}`);
        results.push({
          //resultsにプッシュしておく。変更あったらここも変える。
          rawName: records[i].name,
          clickTarget: '',
          exponame: '',
          tenji: '',
          komabango: '',
          website: '',
          tel: '',
          email: '',
          address: '',
          country: '',
          kyodo: '',
        });
      }
    }

    const outputData = stringify(results, { header: true });
    fs.writeFileSync(`${outputdir}/ものづくりワールド名古屋.csv`, outputData, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.log(error);
  } finally {
    browser.close();
  }
})();
