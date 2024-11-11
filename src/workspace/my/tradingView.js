const downloadCSVFile = (csv, filename) => {
  let csv_file, download_link;
  csv_file = new Blob([csv], { type: 'text/csv' });
  download_link = document.createElement('a');
  download_link.download = filename;
  download_link.href = window.URL.createObjectURL(csv_file);
  download_link.style.display = 'none';
  document.body.appendChild(download_link);
  download_link.click();
};

const convertCsvData = (arrayObj, headers) => {
  const csvRawData = arrayObj.map((array) =>
    headers.map((header) => array[header])
  );
  csvRawData.unshift(headers); //先頭にヘッダー（nameなど）を追加
  const csvdata = csvRawData.map((csv) => [csv.join(','), '\r\n'].join(''));
  return csvdata.join('');
};

// 日本時間で日付を取得する関数
function getCurrentDateInJST() {
  const now = new Date();
  const jstDate = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
  );
  const year = jstDate.getFullYear();
  const month = String(jstDate.getMonth() + 1).padStart(2, '0');
  const day = String(jstDate.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function convertToNumber(value) {
  // 空白、カンマ、「T」「JPY」を削除
  let numStr = value.replace(/,/g, '').replace(/\s|JPY/g, '');
  // 単位に対応した乗数を定義
  const units = {
    K: 1e3, // キロ
    M: 1e6, // メガ
    B: 1e9, // ビリオン
    T: 1e12, // テラ
  };
  // テラ（T）または他の単位が含まれているかチェック
  const unit = numStr.slice(-1);
  if (unit === 'T') {
    // Tの場合、Tを削除し、10^12を掛けて変換
    return parseFloat(numStr.slice(0, -1)) * units['T'];
  } else if (units[unit]) {
    // その他の単位が含まれている場合、該当の乗数で変換
    return parseFloat(numStr.slice(0, -1)) * units[unit];
  } else {
    // 単位がない場合、そのまま数値に変換
    return parseFloat(numStr);
  }
}
// 使用例
// const value = '3.353 T JPY';
// const numericValue = convertToNumber(value);
// console.log(numericValue); // 3353000000000

row = [...document.querySelectorAll('.listRow')];
columns = row.map((i) => {
  コード = i.querySelector('.tickerName-GrtoTeat').innerText;
  社名 = i.querySelector('.tickerDescription-GrtoTeat').innerText;
  td_right = i.querySelectorAll('.right-RLhfr_y4');
  td_left = i.querySelectorAll('.left-RLhfr_y4');
  セクター = td_left[1].innerText;
  株価 = convertToNumber(td_right[0].innerText);
  変動 = td_right[1].innerText;
  PER = td_right[2].innerText;
  PBR = td_right[3].innerText;
  流動資産_四半期 = convertToNumber(td_right[4].innerText);
  負債合計_四半期 = convertToNumber(td_right[5].innerText);
  時価総額 = convertToNumber(td_right[6].innerText);
  配当利回り = td_right[7].innerText;
  ROE_直近12ヶ月 = td_right[8].innerText;
  出来高 = convertToNumber(td_right[9].innerText);
  相対出来高 = td_right[10].innerText;
  希薄EPS_12ヶ月 = convertToNumber(td_right[11].innerText);
  希薄化EPS成長率_12ヶ月前年比 = td_right[12].innerText;
  アナリスト評価 = td_left[2].innerText;
  return {
    コード,
    社名,
    セクター,
    株価,
    変動,
    PER,
    PBR,
    流動資産_四半期,
    負債合計_四半期,
    時価総額,
    配当利回り,
    ROE_直近12ヶ月,
    出来高,
    相対出来高,
    希薄EPS_12ヶ月,
    希薄化EPS成長率_12ヶ月前年比,
    アナリスト評価,
  };
});

d = convertCsvData(columns, [
  'コード',
  '社名',
  'セクター',
  '株価',
  '変動',
  'PER',
  'PBR',
  '流動資産_四半期',
  '負債合計_四半期',
  '時価総額',
  '配当利回り',
  'ROE_直近12ヶ月',
  '出来高',
  '相対出来高',
  '希薄EPS_12ヶ月',
  '希薄化EPS成長率_12ヶ月前年比',
  'アナリスト評価',
]);

// ファイル名に日付を付加
const filename = `${getCurrentDateInJST()}_tradingView.csv`;
e = downloadCSVFile(d, filename);
