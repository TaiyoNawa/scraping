const axios = require("axios");
const baseUrl = 'https://expo.bizcrew.jp/web_api/v2/booth/569/8881/249577';
//↑APIを叩く（リクエストするときのURL）
const params = {"params":"category_ids=[]&booth_category_ids=[]&keyword=&type=Random&priority_live_stream_enable=0&page=1&per_page=201&is_list=1"};
const toCSV = require("../../lib/generateCsv")
const path = require('path');


(async () => {
  const response = await axios.get(baseUrl,//getでやる場合
      {//第二引数
      params: {//paramsはここに
      category_ids:[],
      booth_category_ids:[],
      priority_live_stream_enable:0,
      page:1,
      per_page:203,
      is_list:1
    },
    headers: {//headersはここに
        'Cookies': '_gcl_au=1.1.184754559.1715306474; _yjsu_yjad=1715306473.ae166200-9a80-411f-b8e9-45d64a0f8ecb; _fbp=fb.1.1715306474015.777968471; _clck=1qmi763%7C2%7Cfln%7C0%7C1591; _ga=GA1.1.580739014.1715306476; _uetsid=2e2d9f400e7111efa87cc7ca1134f824; _uetvid=2e2e36900e7111ef8a712b16ac01bcb1; _clsk=1373e34%7C1715315788876%7C1%7C1%7Cp.clarity.ms%2Fcollect; _ga_KLW0NHNX7Y=GS1.1.1715314061.2.1.1715316059.0.0.0',
        'Anonymous-Token': 'xuhh7b61kb8ajwtgs57hmbjq9to74fu6',
        'App-Type' : 'Event',
        'Device' : 'Chrome',
        'Language' : 'jpn'
    },
  }
  );
// console.log(response.data.data)
    const items = response.data.data.data;//response.dataまではjsonで取得した全体のデータ。それ以降は表示されているbodyから探る。
    const results = []
    items.forEach(i=>{
      const url = "https://expo.bizcrew.jp/event/8881/module/booth/249577/" + i.booth_id;
      const name = i.items[2].value?.replace(/tel:/g, '');
      const result = {name, url}
      results.push(result)
      console.log(name, url)
    })

    toCSV(results, path.join('src/workspace/output', 'XR総合EXPO.csv'));

})();

/* 
①(async ...)の()は変数宣言省略の書き方（const 〇〇　がいらない）
②awaitはこの処理が終わるまで以降のプログラムを進めないで待つ（promissが帰ってくるまで待つ）
③
*/

/* 実行するコマンドはこれ
node src/workspace/24-3/japan-it-week.js
 */