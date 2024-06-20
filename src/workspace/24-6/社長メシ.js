//デベロッパーツールで完結しました（社長めし）

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


results = []
a = document.querySelectorAll(".company-cell-wrapper");
a.forEach(i =>{
    rep = i.querySelector(".president-name").innerText;
    url = "https://career.shachomeshi.com" + i.querySelector("a")?.getAttribute("href");
    name = i.querySelector(".company-name").innerText;
    results.push({name, url, rep})
})
c = convertCsvData(results, ['name','url']);
d = downloadCSVFile(c, '社長メシURL.csv');

