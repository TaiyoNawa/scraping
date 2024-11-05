const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');

// CSVファイルのパスを指定
const csvFilePath = __dirname + '/../output/ErorrIndexURL.csv'; // ここにCSVファイルのパスを指定

// URLを保存するリスト
const urls = [];

// CSVからURLを読み込み
function readCsvFile() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // 'url' ヘッダーの値を取得してリストに追加
        urls.push(row.url);
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
        resolve();
      })
      .on('error', (error) => reject(error));
  });
}

// URLにアクセスする関数
async function fetchData(url) {
  try {
    const response = await axios.get(url);
    console.log(`Fetched data from: ${url}`);
  } catch (error) {
    if (error.response) {
      console.error(
        `Error ${error.response.status}: Failed to fetch data from: ${url}`
      );
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
}

// 1秒間隔で同期的にURLにアクセス
async function fetchUrlsInSequence(urls) {
  for (const url of urls) {
    await fetchData(url);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待機
  }
}

// 実行フロー
async function startProcess() {
  try {
    // CSVファイルからURLを読み込む
    await readCsvFile();

    // 読み込んだURLに順番にアクセス
    await fetchUrlsInSequence(urls);
  } catch (error) {
    console.error('Error during the process:', error.message);
  }
}

// プロセスの開始
startProcess();

//https://db.sales-radar.jp/companies/4020003017325
//https://db.sales-radar.jp/companies/4010801002999 ⇦アクセスできる
//https://db.sales-radar.jp/companies/4050003003495
//https://db.sales-radar.jp/companies/7410001002336
//https://db.sales-radar.jp/companies/7360001015418 ⇦アクセスできる
//https://db.sales-radar.jp/companies/7011501001891 ⇦アクセスできる
//https://db.sales-radar.jp/companies/8480001010496 ⇦アクセスできる
//https://db.sales-radar.jp/companies/9100001008932
//https://db.sales-radar.jp/companies/9020002066574
//https://db.sales-radar.jp/companies/5020002004843 ⇦アクセスできる
//https://db.sales-radar.jp/companies/4012701014645 ⇦アクセスできる
//https://db.sales-radar.jp/companies/4140001098925
