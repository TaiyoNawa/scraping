const axios = require('axios');
const baseUrl =
  'https://api.messefrankfurt.com/service/esb_api/exhibitor-service/api/2.1/public/exhibitor/search';
//↑APIを叩く（リクエストするときのURL）
const params = {
  params:
    'language=ja-JP&q=&orderBy=name&pageNumber=1&pageSize=30&orSearchFallback=false&findEventVariable=BEAUTYWORLDJAPANTOKYO&exhibitorProgramId=mf_sip_slx_A8GYXA0D9EO7A8GYXA000BUV',
};
const toCSV = require('../../lib/generateCsv');
const path = require('path');

(async () => {
  const response = await axios.get(baseUrl, {
    //第二引数
    params: {
      language: 'ja-JP', //ここはjp指定しないと結果が変わる
      q: '',
      orderBy: 'name',
      pageNumber: 1,
      pageSize: 210,
      orSearchFallback: false,
      findEventVariable: 'BEAUTYWORLDJAPANNAGOYA', //←ここで展示会名指定
    },
    headers: {
      //headersはここに
      Apikey: 'LXnMWcYQhipLAS7rImEzmZ3CkrU033FMha9cwVSngG4vbufTsAOCQQ==', //APIキーは毎回変わらないかもしれない
    },
  });
  // console.log(response.data.data)
  const items = response.data.result.hits; //response.dataまではjsonで取得した全体のデータ。それ以降は表示されているbodyから探る。
  //   console.log(items);
  const results = [];
  items.forEach((i) => {
    // const url =
    //   'https://expo.bizcrew.jp/event/12551/module/booth/318261/' + i.booth_id;
    const name = i.exhibitor.name
      .replace(/,/g, '')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    //「&amp;」は「&」のエスケープ文字(HTMLでコードに変換せずそのまま表示したい時に使う文字。&を論理積と捉えないための表記法らしい)
    //「&#39;」は「'」のエスケープ文字
    const phone = i.exhibitor.contacts[0]?.phone;
    const email = i.exhibitor.contacts[0]?.email;
    const hollText =
      i.exhibitor.exhibition.exhibitionHall[0].nameLabel.labels['ja-JP'].text;
    const koma = i.exhibitor.exhibition.exhibitionHall[0].stand[0].name;
    const komabango = hollText + ' ' + koma;
    const result = { name, phone, email, komabango };
    results.push(result);
    console.log(name, phone, email, komabango);
  });

  toCSV(
    results,
    path.join('output', '2025_06_02', 'ビューティーワールドジャパン名古屋.csv')
  );
})();

/* 
①(async ...)の()は変数宣言省略の書き方（const 〇〇　がいらない）
②awaitはこの処理が終わるまで以降のプログラムを進めないで待つ（promissが帰ってくるまで待つ）
③
*/

/* 実行するコマンドはこれ
node src/workspace/25-06/APIビューティーワールドジャパン名古屋.js
 */
