const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');

const toCsv = require('../lib/generateCsv');

const baseUrl = 'http://www.photonext.jp/exhivition';
const fileName = 'sample-level1.csv';

(async () => {
  try {
    const response = await Axios({
      method: 'get',
      url: baseUrl,
    });
    const html = response.data;
    const document = parser.parse(html);

    const elements = document.querySelectorAll(
      '#Containerpocsb .font_8 span a'
    );
    const values = Array.from(elements).map((element) => {
      const name = element.innerText;
      const url = element.getAttribute('href');
      if (name !== '') {
        return {
          name,
          url,
          exhibitionName:
            '10thAniversary PHOTONEXT2019 フォトグラファー&フォトビジネスフェア',
        };
      }
    });

    console.log(values);
    toCsv(values, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();
