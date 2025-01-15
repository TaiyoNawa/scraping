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

a = [...document.querySelectorAll('.exhibitors')];
b = a.map((i) => {
  name = i.innerText.replace(/,/g, '');
  aTag = i.querySelector('a');
  if (aTag) {
    if (aTag.getAttribute('href').includes('http')) {
      url = '';
    } else {
      url = 'https://messe.nikkei.co.jp' + aTag.getAttribute('href');
    }
  }
  return { name, url };
});

c = convertCsvData(b, ['name', 'url']);
d = downloadCSVFile(c, '〇〇_URL.csv');
