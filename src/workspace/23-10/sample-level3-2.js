//デベロッパーツールでやったからいらないと思う
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
    __dirname + '/output/sample-level3-1.csv',
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
    for (i = 0; i < 2; i++) {
      //URLとnameにCSVファイルのデータを格納し、仮想ブラウザーを立ち上げて、URLに格納したサイトに飛ぶ
      const page = await browser.newPage();
      const URL = await records[i].url;
      const name = records[i].name;
    //   const categroy = records[i].categroy;
      console.log(URL)
      await page.goto(URL);
      displayLog(page);
	
			//　　画面のスクリーンショット
      // await page.screenshot({ path: `screenshot.png` });

      try {
        //連想配列eventにnameとURLを入れる
        const event = {
          rawName: name,
          clickTarget: URL,
          categroy: categroy,
        };

        //クラス名.data-loadedが表示されるまで待つ
        await page.waitForSelector('.data-loaded');

        //resultにobj(後で設定する)を返す　evaluate内ではdevelopertoolと同じスクレイピング方法で情報を取得する
        const result = await page.evaluate(() => {
          //スクレイピング
/*          a = document.querySelectorAll('.col-md-4 .right-column-section.row')[1]
 */         
            const elements = document.querySelectorAll('.form-group-view-mode')
            let url, email, tel, addres;
            Array.from(elements).map((j) => {
            if(j.querySelector('h2').innerText === 'ウェブサイト'){
                url = j.querySelector('p')?.innerText.replace(/\n/g,'');
            }
            if(j.querySelector('h2').innerText === 'Eメールアドレス'){
                email = j.querySelector('p')?.innerText.replace(/\n/g,'');
            }
            if(j.querySelector('h2').innerText === '電話番号'){
                tel = j.querySelector('p')?.innerText.replace(/\n/g,'');
            }
            if(j.querySelector('h2').innerText === '住所'){
                addres = j.querySelector('p')?.innerText.replace(/\n/g,'');
            }
          })
        //   console.log(name,url,email,addres);
          if(name != ''){
            results.push({
                name,
                url,
                email,
                tel,
                addres
            })
          }
        }); //eveluate文終了
        //assignでeventにresultをコピーして挿入して、resultsにそれを入れる
        results.push(Object.assign(event, result));
        console.log(results);
      } catch (error) {
        console.log(error);
      } finally {
        await page.close();
      }
    }

    //結果を入れるCSVファイルの作成
    const outputData = stringify(results, { header: true });
    fs.writeFileSync(`${outputdir}/???.csv`, outputData, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.log(error);
  } finally {
    browser.close();
  }
})();
//Docker　compornent のパス指定はどうする？
//Docker run を抜けるには？Dockerデスクトップを消す？