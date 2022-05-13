const rp = require('request-promise');
const cheerio = require('cheerio');
const path = require('path');

const toCsv = require('../lib/generateCsv');

const baseUrl = 'http://www.photonext.jp/exhivition';
const fileName = 'sample-level1.csv';

const options = {
  transform: (body) => {
    return cheerio.load(body);
  },
};

(async () => {
  try {
    const $ = await rp.get(baseUrl, options);
    const $items = $('#Containerpocsb .font_8');
    const values = $items.map((index, value) => {
      const name = $(value).children('span').find('a').text();
      const url = $(value).children('span').find('a').attr('href');
      if (name !== '') {
        return {
          name,
          url,
          exhibitionName:
            '10thAniversary PHOTONEXT2019 フォトグラファー&フォトビジネスフェア',
        };
      }
    });
    console.log(Array.from(values));
    toCsv(Array.from(values), path.join('output', fileName));
  } catch (error) {
    console.error(error);
  }
})();
