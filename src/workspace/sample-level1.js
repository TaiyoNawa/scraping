const Axios = require('axios');
const parser = require('node-html-parser');
const path = require('path');

const toCsv = require('../lib/generateCsv');

const baseUrl = 'https://www.labnavi.info/category/%E7%90%86%E7%B3%BB/';
const fileName = 'sample-level2.csv';

(async () => {
  try {
    const response = await Axios({
      method: 'get',
      url: baseUrl,
    });
    const html = response.data;
    const document = parser.parse(html);

    const elements = document.querySelectorAll(
      '.article_list'
    );
    const values = Array.from(elements).map((element) => {
  
      const url = element.querySelector('a').getAttribute('href');
      if (url !== '') {
        return {
          url
        };
      }
    });

    console.log(values);
    toCsv(values, path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();
