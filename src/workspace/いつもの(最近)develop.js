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

a = [...document.querySelectorAll('[data-testid="name-control"]')];

b = a.map((i) => {
  name = i.querySelector('a').innerText.replace(/,/g, '');
  url = i.querySelector('a').getAttribute('href');
  return { name, url };
});

// 重複を削除するためのフィルター
c = b.filter(
  (item, index, self) =>
    index === self.findIndex((t) => t.name === item.name && t.url === item.url)
);

d = convertCsvData(c, ['name', 'url']);
e = downloadCSVFile(d, '〇〇URL.csv');
