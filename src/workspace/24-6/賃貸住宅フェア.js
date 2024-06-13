//デベロッパーツール上で完結

//今回のURL：https://zenchin-fair.com/2024/tokyo/archives/5419
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

results = [];
a =  Array.from(document.querySelectorAll(".tpad"));

a.forEach((i) => {
    temp = i.querySelector(".name")
    name = temp.innerText;
    url = temp.querySelector("a").getAttribute("href");
    if(url=="/") url="";
    expoName = i.querySelector('td[width="75%"]').innerText.replace(/　/g, "")
    results.push({name, url, expoName})
})

c = convertCsvData(results, ['name','url', 'expoName']);
d = downloadCSVFile(c, '賃貸住宅フェア.csv');