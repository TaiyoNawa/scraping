// CSVダウンロードメソッド（最後に使うやつ）
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

co = [...document.querySelectorAll(".exb_wrap")].map(i =>{
    rawname = i.querySelector(".exb_name").innerText;
    ind = i.querySelector(".exb_label").className.split(' ')[1];
    koma = i.querySelector(".exb_no_yh").innerText;

    let industry = '';

    switch(ind) {
        case 'label_bl':
            industry = 'テスティング';
            break;
        case 'label_ye':
            industry = '部品';
            break;
        case 'label_gre':
            industry = 'CAEソリューション';
            break;
        case 'label_re':
            industry = '自動車';
            break;
        case 'label_vi':
            industry = '材料';
            break;
        case 'label_pi':
            industry = 'カーエレクトロニクス';
            break;
        case 'label_lb':
            industry = 'R&D・出版・団体';
            break;
        default:
            industry = 'Unknown'; // 不明な場合のデフォルト値
    }

    return {rawname, industry, koma}
})


c = convertCsvData(co, ['rawname','industry','koma']);
d = downloadCSVFile(c, '人とくるまのテクノロジー展2024.csv');