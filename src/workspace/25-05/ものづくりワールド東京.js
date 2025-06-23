/* docker使うコマンド
# docker imageを buildします。
docker-compose build
# docker app containerにアクセスします。(bash)
docker-compose run --rm app bash
# containerアクセス後、スクリプトを実行(例はsample-level3.js, googleの検索画面をpupeteerを使ってスクショ)
例：node src/workspace/sample-level3.js */

const { launchBrowser, displayLog } = require('../../lib/browser');
const fs = require('fs');
const path = require('path');
const { stringify } = require('csv-stringify/sync');
const parse = require('csv-parse/sync');
const outputdir = 'output';
const puppeteer = require('puppeteer');

(async () => {
  let browser;
  const results = [];

  try {
    const data = await fs.readFileSync(
      __dirname + '/../../../output/2025_05_15/ものづくりワールド東京URL.csv',
      'utf-8'
    );
    const records = parse.parse(data, { columns: true });

    browser = await launchBrowser();
    await new Promise((resolve) => setTimeout(resolve, 10000));

    for (let i = 0; i < records.length; i++) {
      try {
        const page = await browser.newPage();
        const URL = records[i].url;
        const name = records[i].name;
        await page.goto(URL, { timeout: 30000 });

        try {
          const event = {
            rawName: name,
            clickTarget: URL,
          };

          await page.waitForSelector('.data-loaded', { timeout: 30000 });

          const result = await page.evaluate(() => {
            let komabango = '',
              website = '',
              email = '',
              tel = '',
              country = '',
              address = '',
              tenji = '';
            const elements = document.querySelectorAll(
              '.exhibitor-details-contact-us-container'
            );

            komabango = Array.from(
              document.querySelectorAll('.stand-reference-label:nth-child(3)')
            )[0]?.innerText;

            Array.from(elements).forEach((j) => {
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
                  ?.getAttribute('href');
              }
              if (j.querySelector('[data-dtm="exhibitorDetails_phoneLink"]')) {
                tel = j
                  .querySelector('[data-dtm="exhibitorDetails_phoneLink"]')
                  ?.getAttribute('href')
                  .replace(/tel:/g, '');
              }
            });

            if (document.querySelector('.address p')) {
              const span = Array.from(
                document.querySelectorAll('.address p span')
              );
              country = span[0]?.innerText.replace(/\n/g, '');
              for (let k = 1; k < span.length; k++) {
                address += span[k]?.innerText.replace(/\n/g, '');
              }
            }

            const exponameTemp = Array.from(
              document.querySelectorAll(
                '[data-dtm-category-name="展示会・出展カテゴリ"] div span'
              )
            );
            const exponame =
              exponameTemp.length > 0
                ? exponameTemp
                    .map((i) => i.innerText.replace(/-/g, ''))
                    .join(',')
                : '';

            const tenjiTemp = Array.from(
              document.querySelectorAll(
                '[data-dtm-category-name="展示会"] span'
              )
            );
            tenji =
              tenjiTemp.length > 0
                ? tenjiTemp.map((i) => i.innerText.replace(/-/g, '')).join(',')
                : '';

            const kyodoTemp = Array.from(
              document.querySelectorAll('.sharer-section a')
            );
            const kyodoMainTemp = document.querySelectorAll(
              '#mainStandHolderLink'
            );
            kyodoTemp.unshift(...kyodoMainTemp);
            const kyodo =
              kyodoTemp.length > 0
                ? kyodoTemp.map((i) => i.innerText.replace(/-/g, '')).join(',')
                : '';

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
          });

          results.push(Object.assign(event, result));
          console.log(results[i]);
        } catch (innerErr) {
          console.log(innerErr);
        } finally {
          await page.close();
        }
      } catch (navErr) {
        console.log(`Error navigating to URL: ${records[i].name} - ${navErr}`);
        results.push({
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
  } catch (err) {
    console.error('❌ 全体のエラー:', err);
  } finally {
    try {
      const outputData = stringify(results, { header: true });
      const fullOutputDir = path.join(outputdir, '2025_05_15'); //日付のフォルダを作る
      if (!fs.existsSync(fullOutputDir)) {
        fs.mkdirSync(fullOutputDir, { recursive: true });
      }
      fs.writeFileSync(
        `${fullOutputDir}/ものづくりワールド東京3.csv`, //出力するCSVファイル名を指定
        outputData,
        {
          encoding: 'utf8',
        }
      );
      console.log('✅ CSVファイルを書き出しました');
    } catch (writeErr) {
      console.error('❌ CSV出力時にエラー:', writeErr);
    }

    if (browser) await browser.close();
  }
})();
