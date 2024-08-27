const puppeteer = require('puppeteer');

const launchBrowser = () =>
  puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
    headless: 'new',
      //Headless:newだとブラウザ画面表示(UI的な？)を行わない。→プログラム内でブラウザを動かすときに高速化が見込める。
      // `headless: true` (default) enables old Headless;
      // `headless: 'new'` enables new Headless;
      // `headless: false` enables “headful” mode.
      //protocolTimeout: 120000,  //ここでタイムアウトを設定
  });

const displayLog = (page) =>
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

module.exports = { launchBrowser, displayLog };