const axios = require("axios");
const baseUrl = 'https://xd0u5m6y4r-3.algolianet.com/1/indexes/evt-90f18616-c864-42fa-b40c-fa7aa624a9d2-index/query?x-algolia-agent=Algolia for JavaScript (3.35.1); Browser&x-algolia-application-id=XD0U5M6Y4R&x-algolia-api-key=d5cd7d4ec26134ff4a34d736a7f9ad47';
//↑APIを叩く（リクエストするときのURL）
//const params = {"params":"category_ids=[]&booth_category_ids=[]&keyword=&type=Random&priority_live_stream_enable=0&page=1&per_page=201&is_list=1"};
const toCSV = require("../../lib/generateCsv")
const path = require('path');


(async () => {
    try{
        const results = []
        for(num=0;num<7;num++){//page=0からpage=6までをループ

            const response = await axios.post(//postメソッド
                baseUrl,
                {
                  params: `query=&page=${num}&filters=recordType%3Aexhibitor%20AND%20locale%3Aja-jp%20AND%20eventEditionId%3Aeve-f8d3ce7b-4b35-40f6-a369-fa35ec90c8df&facetFilters=&optionalFilters=%5B%5D`
                },
                {
                  headers: {
                    'Host': 'xd0u5m6y4r-3.algolianet.com',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                    'Content-Length' : '183',
                  }
                }
              );
        
        // console.log(response.data.hits[2])
            const items = response.data.hits;//response.dataまではjsonで取得した全体のデータ。それ以降は表示されているbodyから探る。
            items.forEach(i=>{
              const rawName = i.exhibitorName;
              const expoName = i.ppsAnswers ? i.ppsAnswers[0] : ""
              const koma = i.standReference;
              const website = i.website ? i.website : ""
              const tel = i.phone ? i.phone : ""
              const email = i.email ? i.email : ""
              const country = i.countryName
              const result = {rawName, expoName, koma, website, tel, email, country}
              results.push(result)
              console.log(rawName, koma, expoName)
            })
        

        }
        toCSV(results, path.join('output', '名古屋ネプコンジャパン・オートモーティブワールド.csv'));


    } catch (error) {
        console.log(error);
    }



        
        })();




/* 
①(async ...)の()は変数宣言省略の書き方（const 〇〇　がいらない）
②awaitはこの処理が終わるまで以降のプログラムを進めないで待つ（promissが帰ってくるまで待つ）
③
*/

/* 実行するコマンドはこれ
node src/workspace/24-3/japan-it-week.js
 */