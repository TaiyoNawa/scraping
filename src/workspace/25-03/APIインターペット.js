const axios = require('axios');
const baseUrl =
  'https://api.messefrankfurt.com/service/esb_api/exhibitor-service/api/2.1/public/exhibitor/search';
const toCSV = require('../../lib/generateCsv');
const path = require('path');

(async () => {
  try {
    const response = await axios.get(baseUrl, {
      params: {
        language: 'ja-JP',
        q: '',
        orderBy: 'name',
        pageNumber: 1,
        pageSize: 962,
        orSearchFallback: false,
        findEventVariable: 'INTERPETSASIAPACIFIC',
      },
      headers: {
        Apikey: 'LXnMWcYQhipLAS7rImEzmZ3CkrU033FMha9cwVSngG4vbufTsAOCQQ==',
      },
    });

    const items = response.data.result.hits;
    console.log(items);

    const results = [];
    items.forEach((i) => {
      let name = '';
      let phone = '';
      let email = '';
      let komabango = '';

      try {
        name = i.exhibitor.name.replace(/,/g, '') || '';
      } catch (error) {
        console.error(`name取得エラー: ${error.message}`);
      }

      try {
        phone = i.exhibitor.contacts[0]?.phone || '';
      } catch (error) {
        console.error(`phone取得エラー: ${error.message}`);
      }

      try {
        email = i.exhibitor.contacts[0]?.email || '';
      } catch (error) {
        console.error(`email取得エラー: ${error.message}`);
      }

      try {
        const hollText =
          i.exhibitor.exhibition.exhibitionHall[0].nameLabel.labels['ja-JP']
            .text || '';
        const koma =
          i.exhibitor.exhibition.exhibitionHall[0].stand[0].name || '';
        komabango = hollText + ' ' + koma;
      } catch (error) {
        console.error(`komabango取得エラー: ${error.message}`);
      }

      results.push({ name, phone, email, komabango });
      console.log(name, phone, email, komabango);
    });

    toCSV(results, path.join('output/2025_03_18', 'インターペット.csv'));
  } catch (error) {
    console.error(`リクエストエラー: ${error.message}`);
  }
})();
