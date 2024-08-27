
// 共同出展社を全て取得して配列格納
let kyodoTemp = Array.from(document.querySelectorAll('.sharer-section a'));

// メイン出展社を取得して配列の先頭に追加
let kyodoMainTemp = Array.from(document.querySelectorAll("#mainStandHolderLink"));
kyodoTemp.unshift(...kyodoMainTemp);

// kyodoMainTempはNodeList であり、unshiftメソッドを使うとNodeList全体が一つの要素としてkyodoTempの最初に追加されるのではなく、一つの配列として追加されてしまいます。
// kyodoMainTempの中の要素を個別にkyodoTempの先頭に追加するためにはunshift()にspread演算子(...)も使って書く

