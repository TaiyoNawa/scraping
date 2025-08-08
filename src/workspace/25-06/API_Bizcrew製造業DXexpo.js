const axios = require('axios');
const baseUrl = 'https://expo.bizcrew.jp/web_api/v2/booth/569/13746/349949';

//↑APIを叩く（リクエストするときのURL）
const params = {
  params:
    'category_ids=[]&booth_category_ids=[]&keyword=&type=Random&priority_live_stream_enable=0&page=1&per_page=200&is_list=1',
};
const toCSV = require('../../lib/generateCsv');
const path = require('path');

(async () => {
  const response = await axios.get(
    baseUrl, //getでやる場合
    {
      //第二引数
      params: {
        // category_ids=[]&booth_category_ids=[]&keyword=&type=Random&priority_live_stream_enable=0&page=1&per_page=60&is_list=1
        //paramsはここに
        category_ids: [],
        booth_category_ids: [],
        priority_live_stream_enable: 0,
        page: 1,
        per_page: 180,
        is_list: 1,
      },
      headers: {
        //headersはここに
        Cookies:
          '_gcl_au=1.1.1223956729.1750646385; _ga=GA1.1.2121504174.1750646385; _fbp=fb.1.1750646385481.63805283427676517; _yjsu_yjad=1750646385.293af87e-a1b9-4452-a4e0-d4edeaf830c8; _uetsid=52e61b604fdb11f0baef7da4669b8672; _uetvid=b5c599e0039911f0b3c6673cda349c8f; _ga_KLW0NHNX7Y=GS2.1.s1750646385$o1$g1$t1750647428$j60$l0$h0',
        Device: 'Chrome',
        Language: 'jpn',
      },
    }
  );
  // console.log(response.data.data)
  const items = response.data.data.data; //response.dataまではjsonで取得した全体のデータ。それ以降は表示されているbodyから探る。
  //   console.log(items);
  const results = [];
  items.forEach((i) => {
    const url =
      'https://expo.bizcrew.jp/event/13746/module/booth/349949/' + i.booth_id; //ここのURLは適宜変えて
    const name = i.items[2].value?.replace(/tel:/g, '');
    const result = { name, url };
    results.push(result);
    console.log(name, url);
  });

  toCSV(
    results,
    path.join('output', '2025_06_26', 'Bizcrew製造業DXexpoURL.csv')
  );
})();

/* 
①(async ...)の()は変数宣言省略の書き方（const 〇〇　がいらない）
②awaitはこの処理が終わるまで以降のプログラムを進めないで待つ（promissが帰ってくるまで待つ）
③
*/

/* 実行するコマンドはこれ
node src/workspace/24-3/japan-it-week.js
 */
