const puppeteer = require('puppeteer');

(async () => {
  // Puppeteerを起動する
  const browser = await puppeteer.launch({
      headless: 'new',
      // `headless: true` (default) enables old Headless;
      // `headless: 'new'` enables new Headless;（おすすめ）
      // `headless: false` enables “headful” mode.
    });

  try {
    // 新しいページを開く
    const page = await browser.newPage();
    
    // Googleのトップページに移動する
    await page.goto('https://www.google.com');
    
    // ページのタイトルを取得する
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // ブラウザを閉じる
    await browser.close();
  }
})();