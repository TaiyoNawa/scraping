// src/workspace/X/CopyOfScrapingXImpression.js
/*
docker-compose build
docker-compose run --rm app bash
node パス名
*/

//‼️できたらNotionAPIから取得したURLを指定して実行し、結果をNotionに書き込む

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import puppeteer from 'puppeteer';
import { fetchNotionzDBSNSItems } from '../../api/notion/index.js';

// ------------SRの設定-----------------
// const MAIL_ADDRESS = process.env.SR_X_MAIL_ADDRESS; //ユーザー名またはメールまたは電話番号
// const ACCOUNT_NAME = '@sales_radar'; //アカウント名
// const PASSWORD = process.env.SR_X_PASSWORD; //パスワード
// const {
//   SR_X_ACCOUNT_NAME: ACCOUNT_NAME,
//   SR_X_MAIL_ADDRESS: MAIL_ADDRESS,
//   SR_X_PASSWORD: PASSWORD,
// } = require('../../workspace/X/env.js');

// ------------SYUの設定-----------------
// const MAIL_ADDRESS = process.env.SYU_X_MAIL_ADDRESS; //ユーザー名またはメールまたは電話番号
// const ACCOUNT_NAME = '@shuchaning'; //アカウント名
// const PASSWORD = process.env.SYU_X_PASSWORD; //パスワード
import {
  SYU_X_ACCOUNT_NAME as ACCOUNT_NAME,
  SYU_X_MAIL_ADDRESS as MAIL_ADDRESS,
  SYU_X_PASSWORD as PASSWORD,
} from '../../workspace/X/env.js'; //多分.env.localではなく.envなら読み込める

// -------------------設定変数-----------------
const outputdir = 'output/X';
const file_name = 'X'; //ファイル名を指定
// -------------------------------------------

async function main() {
  const { results, next_cursor, has_more } = await fetchNotionzDBSNSItems();
  console.log('取得した件数:', results.length);
  console.log('1件目のタイトル:', results[0]?.title);
}

(async () => {
  const data = await fs.readFileSync(
    __dirname + '/../../../output/X/' + file_name + 'PostURLList.csv',
    'utf-8'
  );
  const records = parse.parse(data, { columns: true });
  const results = [];

  if (!fs.existsSync(path.join(outputdir))) fs.mkdirSync(outputdir);

  const browser = await puppeteer.launch({ headless: 'new' }); // ログイン処理の可視化のため false 推奨
  const page = await browser.newPage();

  // === ログイン処理 ===
  try {
    await page.goto('https://x.com/login', { waitUntil: 'networkidle2' });

    // メアド入力
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.type('input[type="text"]', MAIL_ADDRESS);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000); // 遷移待ち

    // 確認画面の入力が必要か判定する
    let needAccountName = false;
    try {
      await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    } catch (e) {
      needAccountName = true;
    }
    if (needAccountName) {
      // アカウント名入力画面が表示された場合の処理
      await page.waitForSelector('input[type="text"]', { timeout: 10000 });
      await page.type('input[type="text"]', ACCOUNT_NAME);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000); // 遷移待ち
    }
    // パスワード入力
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.type('input[name="password"]', PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('✅ ログイン成功');
  } catch (e) {
    console.error('❌ ログイン失敗:', e);
    await browser.close();
    return;
  }

  // === 投稿ごとの取得 ===
  try {
    for (let i = 0; i < records.length; i++) {
      let title = records[i].title;
      let url = records[i].url;
      let url_analytics = url + '/analytics';
      let リプライ数 = 0,
        リポスト数 = 0,
        いいね数 = 0,
        ブックマーク数 = 0,
        インプレッション数 = 0,
        エンゲージメント数 = 0,
        詳細のクリック数 = 0,
        プロフィールへのアクセス数 = 0,
        リンククリック数 = 0;

      if (!(title && url)) {
        results.push({
          title,
          url,
          url_analytics,
          リプライ数,
          リポスト数,
          いいね数,
          ブックマーク数,
          インプレッション数,
          エンゲージメント数,
          詳細のクリック数,
          プロフィールへのアクセス数,
          リンククリック数,
        });
        continue;
      }

      const page = await browser.newPage();
      try {
        //①リプライ・リポスト・いいね・ブックマーク数取得
        await page.goto(url, { timeout: 60000 });
        await page.waitForSelector('.css-175oi2r.r-xoduu5.r-1udh08x', {
          timeout: 15000,
        });
        const items = await page.$$eval(
          '.css-175oi2r.r-xoduu5.r-1udh08x',
          (nodes) => nodes.map((n) => n.innerText)
        );
        if (items.length !== 0) {
          リプライ数 = items[1] === '' ? 0 : Number(items[1]);
          リポスト数 = items[2] === '' ? 0 : Number(items[2]);
          いいね数 = items[3] === '' ? 0 : Number(items[3]);
          ブックマーク数 = items[4] === '' ? 0 : Number(items[4]);
        }

        // --- アナリティクスページへ遷移 ---
        await page.goto(url_analytics, {
          timeout: 60000,
          waitUntil: 'networkidle2',
        });
        // ②インプレッション数・インプレッション詳細取得
        await page.waitForSelector(
          '.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-1tl8opc.r-uho16t.r-nwxazl.r-b88u0q',
          { timeout: 15000 }
        );
        インプレッション数 = await page.$eval(
          '.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-1tl8opc.r-uho16t.r-nwxazl.r-b88u0q',
          (el) => Number(el.innerText.trim())
        );
        const detailTexts = await page.$$eval(
          '.css-175oi2r.r-1habvwh.r-6koalj.r-eqz5dr',
          (nodes) => nodes.map((n) => n.innerText)
        );

        for (const text of detailTexts) {
          if (text.includes('エンゲージメント'))
            エンゲージメント数 = Number(
              text
                .replace('エンゲージメント', '')
                .replace(/\n/g, '')
                .replace(/,/g, '')
            );
          if (text.includes('詳細のクリック数'))
            詳細のクリック数 = Number(
              text
                .replace('詳細のクリック数', '')
                .replace(/\n/g, '')
                .replace(/,/g, '')
            );
          if (text.includes('プロフィールへのアクセス数'))
            プロフィールへのアクセス数 = Number(
              text
                .replace('プロフィールへのアクセス数', '')
                .replace(/\n/g, '')
                .replace(/,/g, '')
            );
          if (text.includes('リンククリック数'))
            リンククリック数 = Number(
              text
                .replace('リンククリック数', '')
                .replace(/\n/g, '')
                .replace(/,/g, '')
            );
        }
        results.push({
          title,
          url,
          リプライ数,
          リポスト数,
          いいね数,
          ブックマーク数,
          インプレッション数,
          エンゲージメント数,
          詳細のクリック数,
          プロフィールへのアクセス数,
          リンククリック数,
        });
        console.log(results[i]);
      } catch (error) {
        console.log(`Error at ${i}: ${title} - ${error}`);
        results.push({
          title,
          url,
          リプライ数,
          リポスト数,
          いいね数,
          ブックマーク数,
          インプレッション数,
          エンゲージメント数,
          詳細のクリック数,
          プロフィールへのアクセス数,
          リンククリック数,
        });
      } finally {
        await page.close();
      }
    }

    const outputData = stringify(results, { header: true });
    fs.writeFileSync(
      `${outputdir}/${file_name}PostAnalyzeList.csv`,
      outputData,
      {
        encoding: 'utf8',
      }
    );
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
