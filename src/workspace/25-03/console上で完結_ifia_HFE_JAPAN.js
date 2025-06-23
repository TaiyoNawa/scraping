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

a = [...document.querySelectorAll('.exhibitor')];
b = a.map((i) => {
  法人名称 = i.querySelector('dt a').childNodes[0].textContent.trim(); // 最初のテキストノードの内容を取得
  td = i.querySelectorAll('td');
  小間番号 = td[0].innerText
    .trim()
    .replace('ブース番号　[ ', '')
    .replace(' ]', '')
    .match(/\d+/)
    ? td[0].innerText.trim().replace('ブース番号　[ ', '').replace(' ]', '')
    : '';
  住所 = td[1]?.innerText.trim();
  電話番号 = td[2]?.innerText.trim();
  FAX番号 = td[3]?.innerText.trim();
  サイトURL = td[4]?.innerText.trim();
  メールアドレス = '';
  収集サイト = '';
  return {
    法人名称,
    サイトURL,
    住所,
    電話番号,
    メールアドレス,
    収集サイト,
    小間番号,
    FAX番号,
  };
});

d = convertCsvData(b, [
  '法人名称',
  'サイトURL',
  '住所',
  '電話番号',
  'メールアドレス',
  '収集サイト',
  '小間番号',
  'FAX番号',
]);
e = downloadCSVFile(d, 'ifia_HFE_JAPAN.csv');
