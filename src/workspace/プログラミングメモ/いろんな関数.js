//find
const website = [...document.querySelectorAll("tr")].find(i => i.querySelector("th")?.innerText.includes("HP"))?.querySelector("td a")?.getAttribute("href");
//.find(i => i.querySelector("th")?.innerText === "会社HP") で th 要素のテキストが「会社HP」と一致する最初の tr 要素を見つけている。便利。

//ifの簡略版（三項演算子）
const email = i.email ? i.email : ""
//i.phoneが存在するかどうかを確認し、存在すればその値を、存在しなければ空の文字列をemailに格納する。