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
    __dirname + '/output/sample-level3-2.csv',
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
      //console.log(URL);
      await page.goto(URL);
      displayLog(page);

      //　　画面のスクリーンショット
      // await page.screenshot({ path: `screenshot.png` });

      try {
        //連想配列eventにnameとURLを入れる
        const event = {
          rawName: name,
          clickTarget: URL,
        };

        //クラス名.data-loadedが表示されるまで待つ
        await page.waitForSelector('.data-loaded');

        //resultにobj(後で設定する)を返す　evaluate内ではdevelopertoolと同じスクレイピング方法で情報を取得する
        const result = await page.evaluate(() => {
          //スクレイピング         
            const elements = document.querySelectorAll('.form-group-view-mode')
            let url, email, tel, address;
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
                address = j.querySelector('p')?.innerText.replace(/\n/g,'');
            }
          })
          //console.log(url,email,tel,address);
          return({
            url,
            email,
            tel,
            address            
          });
        }); //eveluate文終了

        const result2 = await page.evaluate(() => {
   
            const elements = document.querySelectorAll('.social-media-logo-container')
            let facebook, twitter,youtube, instagram;
            Array.from(elements).map((j) => {
              facebook = j.querySelector('.facebook-logo-color')?.getAttribute('href');
              twitter = j.querySelector(".twitter-logo-color")?.getAttribute('href');
              youtube = j.querySelector(".youtube-logo-color")?.getAttribute('href');
              instagram = j.querySelector(".instagram-logo-color")?.getAttribute('href');
          })
          console.log(facebook, twitter,youtube, instagram);
          return({
            facebook,
            twitter,
            youtube,
            instagram           
          });
        }); 

        results.push(Object.assign(event, result, result2));
        console.log(results);
      } catch (error) {
        console.log(error);
      } finally {
        await page.close();
      }
    }

    const outputData = stringify(results, { header: true });
    fs.writeFileSync(`${outputdir}/sample-kansai.csv`, outputData, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.log(error);
  } finally {
    browser.close();
  }
})();


            /*document.querySelectorAll('.form-group-view-mode')で取得したデータを順番にマップでループし、
            　j.querySelector('h2').innerText === '〇〇'　でh2タグのテキストを判定して
            　当てはまった〇〇の直後にあるpタグ（直後の一個のみ）の中身をurlやemailなどに格納する。(map１回で１URL分のデータを収集する)
            　mapが終わったらreturnしてresultが終了→resultsにpushして行を増やしていく
            　以上が一回のfor文ループで、次のURLのfor文ループが始まる。
            　for文が完了したらfs.writeFileSyncでcsvファイルの書き込みをする。
            */
          /*
            (async () => {...全体
              for{...URLのループ
                result = (()=>{
                  document.querySelectorAll()
                  map(() = > {...Allで取得した要素のループ
                    ※ALLで取得した要素それぞれを別の行のデータにするならここにpush入れる。
                  })
                  return({...result に値を返す
                    url,
                    emailなど
                  });
                  results.push(event,result)...resultsにpushして行を追加
                });  
              }
              fs.writeFileSync()...csvファイルに書き込み
            })
            */