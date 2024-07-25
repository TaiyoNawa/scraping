const downloadCSVFile = (csv, filename) => {
	let csv_file, download_link;
	csv_file = new Blob([csv], {type: "text/csv"});
	download_link = document.createElement("a");
	download_link.download = filename;
	download_link.href = window.URL.createObjectURL(csv_file);
	download_link.style.display = "none";
	document.body.appendChild(download_link);
	download_link.click();
}

// CSVコンバートメソッド（最後から二番目に使うやつ）
const convertCsvData = (arrayObj, headers) => {
	const csvRawData = arrayObj.map(array => headers.map(header => array[header])) 
	csvRawData.unshift(headers);//先頭にヘッダー（nameなど）を追加
	const csvdata = csvRawData.map(csv => [csv.join(','), '\r\n'].join(''))
  return csvdata.join('');
}

a =  Array.from(document.querySelectorAll(".company-info"));//..directory-itemの方がいいかも

b = a.map(i => {
    name =   i.querySelector("a").innerText.replace(/,/g, "");
    url = i.querySelector("a").getAttribute("href");
    return {name, url}
})
//mapを使うと配列の中にreturnの結果が格納されていく
//↑は[{...},{...},...,{...}]のようになる

// 重複を削除するためのフィルター
c = b.filter((item, index, self) =>
    index === self.findIndex((t) => (
        (t.name === item.name) && (t.url === item.url)
    ))
);

d = convertCsvData(c, ['name','url']);
e = downloadCSVFile(d, '〇〇.csv');

/* filterの説明
b.filter は、配列 b の各要素に対して指定された関数を実行し、新しい配列 c を作成します。
filter 関数内のコールバック関数は、現在の要素 item のインデックス index と配列 self を引数に取ります。
self.findIndex((t) => (t.name === item.name)) は、
配列 self の中で name が現在の item.name と一致する最初の要素のインデックスを返します。
index === self.findIndex((t) => ((t.name === item.name) && (t.url === item.url))) は、
現在の要素 item のインデックスがその nameとurl が最初に見つかったインデックスと一致する場合にのみ true を返します。
これにより、重複した name を持つ要素がフィルタリングされ、最初に見つかった要素のみが配列 c に保持されます。
*/

/////////////////////////////////////////////////////////////////////////////////////////////////////////

/* 写真にaタグがある場合はこっち */

// const downloadCSVFile = (csv, filename) => {
// 	let csv_file, download_link;
// 	csv_file = new Blob([csv], {type: "text/csv"});
// 	download_link = document.createElement("a");
// 	download_link.download = filename;
// 	download_link.href = window.URL.createObjectURL(csv_file);
// 	download_link.style.display = "none";
// 	document.body.appendChild(download_link);
// 	download_link.click();
// }

// // CSVコンバートメソッド（最後から二番目に使うやつ）
// const convertCsvData = (arrayObj, headers) => {
// 	const csvRawData = arrayObj.map(array => headers.map(header => array[header])) 
// 	csvRawData.unshift(headers);//先頭にヘッダー（nameなど）を追加
// 	const csvdata = csvRawData.map(csv => [csv.join(','), '\r\n'].join(''))
//   return csvdata.join('');
// }

// a =  Array.from(document.querySelectorAll(".directory-item"));

// b = a.map(i => {
//     name =   i.querySelector(".flexible-content a").innerText.replace(/,/g, "");
//     url = i.querySelector("a").getAttribute("href");
//     return {name, url}
// })

// c = convertCsvData(b, ['name','url']);
// d = downloadCSVFile(c, 'ContentTokyo.csv');


//課題
//展示会名と展示にそれぞれ2つ以上要素があったとき、展示会（tenji）の方は一個しか取れない。
//ただし、展示会の方は常に一つの可能性もある