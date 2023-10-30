const puppeteer = require('puppeteer');

const launchBrowser = () =>
  puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });

const displayLog = (page) =>
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

module.exports = { launchBrowser, displayLog };