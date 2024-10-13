/*
文字化け参考サイト！　https://tools.m-bsys.com/ex/html-mojibake.php
CSVファイルをエクセルで開くときの参考サイト！　https://www.vosaic.jp/support/support-open-csv-file-by-excel/
⇑のエクセルの処理は、おそらくUTF-8で見れるようにするというより内容を全てshift-jisに変換している
（ExcelでCSVファイルを開く際の標準文字コードはShift_JISだから）
なのでそのまま保存すると、shift-jisコードのファイルになってしまうので、VScode上だと文字化けするかもしれない
対策としては、excelのデフォルト文字コードをShift-jisにする（できるかわからない）か、VScode上でフッターのボタンを押してエンコード（utf-8からs-jisへ）してから表示させる
*/

/* EUC-JP を UTF-8で表示させようとすると以下のように見える
キタサンブラック → ��������֥�å�
これを変換させるには、取得内容をEUC-JPをUTF-8に変換してから、UTF-8環境で表示させる */

//EUC-JPからUTF-8に変換させるコードは以下
const iconv = require('iconv-lite');//文字コード変換用にiconv-liteをインポート
const baseUrl = `https://db.netkeiba.com/?pid=horse_list&word=&match=partial_match&sire=&keito=&mare=&bms=&trainer=&owner=&breeder=&under_age=0&over_age=none&prize_min=&prize_max=&sort=prize&list=100&page=${i}`;
const response = await Axios({
    method: 'get',
    url: baseUrl,
    responseType: 'arraybuffer', // バイナリデータとして取得
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});
// iconv-liteを使ってEUC-JPからUTF-8に変換
const html = iconv.decode(response.data, 'EUC-JP');
const document = parser.parse(html);
//あとはいつも通りdocument.queryなどする


// 解説
inconv.encode(変換したいデータ, '変換先の文字コード名');//UTF-8から他の文字コード形式に変換するときに使用します。
inconv.decode(変換したいデータ, '変換元の文字コード名');//他の文字コード形式からUTF-8に変換するときに使用します。
//1. UTF-8から別の文字コードに変換する場合
const utf8Text = "これはUTF-8でエンコードされたテキストです。";
// UTF-8をShift_JISに変換
const shiftJisBuffer = iconv.encode(utf8Text, 'Shift_JIS');

// 2. 他の文字コードからUTF-8に変換する場合
const shiftJisText = "ああああ"
// Shift_JISをUTF-8に変換
const utf8Buffer = iconv.decode(shiftJisText, 'Shift_JIS');

/*
引数に入れる文字コード名一覧
Shift_JIS→ 'Shift_JIS'
EUC-JP→ 'EUC-JP'
ISO-2022-JP→ 'ISO-2022-JP'
*/
