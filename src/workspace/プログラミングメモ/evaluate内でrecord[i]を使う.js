/* evaluate内で
records[i].name
などを使おうとすると、recordsが未定義であるとエラーが出る。
Puppeteerのevaluateメソッドでは、
ブラウザのページ上で実行するJavaScriptコードを指定するが、
その中で外部の変数やデータにアクセスする場合、
明示的に渡す必要がある。
 
       const result = await page.evaluate((record) => {
        ...
        name = record.name;

       },records[i]); 

とすると、明示的になるので、うまくいく

(src/workspace/24-6/社長メシ2.jsを参考に)
 */