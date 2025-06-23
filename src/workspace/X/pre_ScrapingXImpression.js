/*
docker-compose build
docker-compose run --rm app bash
node パス名
*/
const fs = require('fs');
const path = require('path');
const parse = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const puppeteer = require('puppeteer');

const outputdir = 'output/X';

(async () => {
  const data = await fs.readFileSync(
    __dirname + '/../../../output/X/XPostURLList.csv',
    'utf-8'
  );
  const records = parse.parse(data, { columns: true });
  const results = [];

  if (!fs.existsSync(path.join(outputdir))) fs.mkdirSync(outputdir);

  const browser = await puppeteer.launch({ headless: 'new' }); // ログイン処理の可視化のため false 推奨

  try {
    for (let i = 0; i < records.length; i++) {
      let title = records[i].title;
      let url = records[i].url;
      let NumberOfReply = 0,
        NumberOfRepost = 0,
        NumberOfLike = 0,
        NumberOfBookmark = 0,
        NumberOfImpression = 0;

      if (!(title && url)) {
        results.push({
          title,
          url,
          NumberOfReply,
          NumberOfRepost,
          NumberOfLike,
          NumberOfBookmark,
          NumberOfImpression,
        });
        continue;
      }

      const page = await browser.newPage();
      try {
        await page.goto(url, { timeout: 60000 });
        await page.waitForSelector('.css-175oi2r.r-xoduu5.r-1udh08x', {
          timeout: 15000,
        });

        //スクレイピング
        const items = await page.$$eval(
          '.css-175oi2r.r-xoduu5.r-1udh08x',
          (nodes) => nodes.map((n) => n.innerText)
        );

        if (items.length === 5) {
          NumberOfImpression = items[0] === '' ? 0 : Number(items[0]);
          NumberOfReply = items[1] === '' ? 0 : Number(items[1]);
          NumberOfRepost = items[2] === '' ? 0 : Number(items[2]);
          NumberOfLike = items[3] === '' ? 0 : Number(items[3]);
          NumberOfBookmark = items[4] === '' ? 0 : Number(items[4]);
        } else if (items.length === 4) {
          NumberOfImpression = 0;
          NumberOfReply = items[0] === '' ? 0 : Number(items[0]);
          NumberOfRepost = items[1] === '' ? 0 : Number(items[1]);
          NumberOfLike = items[2] === '' ? 0 : Number(items[2]);
          NumberOfBookmark = items[3] === '' ? 0 : Number(items[3]);
        } else {
          NumberOfImpression = NaN;
          NumberOfReply = NaN;
          NumberOfRepost = NaN;
          NumberOfLike = NaN;
          NumberOfBookmark = NaN;
        }

        results.push({
          title,
          url,
          NumberOfReply,
          NumberOfRepost,
          NumberOfLike,
          NumberOfBookmark,
          NumberOfImpression,
        });
        console.log(
          i,
          title,
          url,
          NumberOfImpression,
          NumberOfReply,
          NumberOfRepost,
          NumberOfLike,
          NumberOfBookmark
        );
      } catch (error) {
        console.log(`Error at ${i}: ${title} - ${error}`);
        results.push({
          title,
          url,
          NumberOfReply,
          NumberOfRepost,
          NumberOfLike,
          NumberOfBookmark,
          NumberOfImpression,
        });
      } finally {
        await page.close();
      }
    }

    const outputData = stringify(results, { header: true });
    fs.writeFileSync(`${outputdir}/XPostAnalyzeList.csv`, outputData, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
