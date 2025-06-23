const axios = require('axios');
const baseUrl =
  'https://event.aismiley.co.jp/web_api/v2/booth/876/12559/318502';
//↑APIを叩く（リクエストするときのURL）
const params = {
  params:
    'category_ids=[]&booth_category_ids=[]&keyword=&type=UpdateNewArrival&priority_live_stream_enable=0&page=1&per_page=76&is_list=1',
};
const toCSV = require('../../lib/generateCsv');
const path = require('path');

(async () => {
  const response = await axios.get(
    baseUrl, //getでやる場合
    {
      //第二引数
      params: {
        category_ids: [],
        booth_category_ids: [],
        keyword: '',
        type: 'UpdateNewArrival',
        priority_live_stream_enable: 0,
        page: 1,
        per_page: 76,
        is_list: 1,
      },

      headers: {
        //headersはここに
        Language: 'jpn',
      },
    }
  );
  // console.log(response.data.data)
  const items = response.data.data.data; //response.dataまではjsonで取得した全体のデータ。それ以降は表示されているbodyから探る。
  console.log(items);
  const results = [];
  items.forEach((i) => {
    const url =
      'https://event.aismiley.co.jp/event/12559/module/booth/318502/' +
      i.booth_id;
    const name = i.items[2].value?.replace(/tel:/g, '');
    const result = { name, url };
    results.push(result);
    console.log(name, url);
  });

  toCSV(results, path.join('output/2025_03_18', 'AI博覧会SpringURL.csv'));
})();

/* 
①(async ...)の()は変数宣言省略の書き方（const 〇〇　がいらない）
②awaitはこの処理が終わるまで以降のプログラムを進めないで待つ（promissが帰ってくるまで待つ）
③
*/

/* 実行するコマンドはこれ
node src/workspace/24-3/japan-it-week.js
 */
