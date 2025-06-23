const axios = require('axios');
const baseUrl = 'https://api.messefrankfurt.com/service/esb_api/exhibitor-service/api/2.1/public/exhibitor/search';
//↑APIを叩く（リクエストするときのURL）
const params = {
  params:
    'language=ja-JP&q=&orderBy=name&pageNumber=1&pageSize=30&orSearchFallback=false&findEventVariable=BEAUTYWORLDJAPANTOKYO&exhibitorProgramId=mf_sip_slx_A8GYXA0D9EO7A8GYXA000BUV',
};
const toCSV = require('../../lib/generateCsv');
const path = require('path');

(async () => {
  const response = await axios.get(
    baseUrl, //getでやる場合
    {
      //第二引数
      params: {
        language: "ja-JP",
        q: "",
        orderBy: "name",
        pageNumber: 1,
        pageSize: 244,
        orSearchFallback: false,
        findEventVariable: "BEAUTYWORLDJAPANTOKYO",
        exhibitorProgramId: "mf_sip_slx_A8GYXA0D9EO7A8GYXA000BUV",
      },
      headers: {
        //headersはここに
        Apikey: 'LXnMWcYQhipLAS7rImEzmZ3CkrU033FMha9cwVSngG4vbufTsAOCQQ==',
      },
    }
  );
  // console.log(response.data.data)
  const items = response.data.result.hits; //response.dataまではjsonで取得した全体のデータ。それ以降は表示されているbodyから探る。
  console.log(items);
  const results = [];
  items.forEach((i) => {
    // const url =
    //   'https://expo.bizcrew.jp/event/12551/module/booth/318261/' + i.booth_id;
    const name = i.exhibitor.name.replace(/,/g, '');
    const phone = i.exhibitor.contacts[0]?.phone;
    const email = i.exhibitor.contacts[0]?.email;
    const hollText = i.exhibitor.exhibition.exhibitionHall[0].nameLabel.labels['ja-JP'].text
    const koma = i.exhibitor.exhibition.exhibitionHall[0].stand[0].name;
    const komabango = hollText +" "+ koma;
    const result = { name, phone, email, komabango };
    results.push(result);
    console.log(name, phone, email, komabango);
  });

  toCSV(results, path.join('output', 'ビューティーワールドジャパン.csv'));
})();

/* 
①(async ...)の()は変数宣言省略の書き方（const 〇〇　がいらない）
②awaitはこの処理が終わるまで以降のプログラムを進めないで待つ（promissが帰ってくるまで待つ）
③
*/

/* 実行するコマンドはこれ
node src/workspace/24-3/japan-it-week.js
 */
