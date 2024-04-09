//スクレイピングするURL https://www.japan-it.jp/spring/ja-jp/search/2024/directory.html#/
/* APIやるとき↓
デベロッパーツール→Network→Fetch/XHR→query?x-...(ここは物による)→Headers
 */
const axios = require('axios');
const baseUrl = 'https://xd0u5m6y4r-dsn.algolia.net/1/indexes/event-edition-eve-e6391676-76a4-473a-a04d-3d6f56051f9f_ja-jp/query?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%203.27.1&x-algolia-application-id=XD0U5M6Y4R&x-algolia-api-key=d5cd7d4ec26134ff4a34d736a7f9ad47'
//↑APIを叩く（リクエストするときのURL）
const params = {"params":"query=&hitsPerPage=1000&facets=*&filters=&highlightPreTag=&highlightPostTag="};
const toCSV = require("../../lib/generateCsv");
const path = require('path')


(async () => {
    const data = await axios.post(baseUrl, params)//APIを叩く（リクエストURLを用いてサーバーから情報を取ってくる）
    const items = data.data.hits;//dataの中のhitsのところに欲しい情報が入っているからそこを取得
    const results = []//配列形式を準備
    items.forEach(i => {//forEachはreturnがいらない処理の時に使う
        const name = i.name?.replace(/\"/g,'');//items.nameの中身を取得
        const url = i.website;//items.websiteの中身を取得
        const email = i.email;
        const phone = i.phone?.replace(/\+/g,'');
        const countryName = i.countryName;//items.countryNameの中身を取得
        const result = {name, url, email, phone, countryName}
        //オブジェクト形式に格納→上のような書き方をすると{name:〇〇, url:▲▲, countryName:✖️✖️}のように書いたものがキー値になる
        console.log(result);
        results.push(result);//resultsにresultを合成
        
    });
    console.log(items.length)//格納された数を表示

    toCSV(results, path.join('src/workspace/output', 'japan-it-week.csv'));

})();

/* 
①(async ...)の()は変数宣言省略の書き方（const 〇〇　がいらない）
②awaitはこの処理が終わるまで以降のプログラムを進めないで待つ（promissが帰ってくるまで待つ）
③
*/

/* 実行するコマンドはこれ
node src/workspace/24-3/japan-it-week.js
 */