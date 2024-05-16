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

c = convertCsvData(b, ['name','url']);
d = downloadCSVFile(c, '〇〇.csv');



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