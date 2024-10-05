//解説：https://qiita.com/nakajima417/items/937509491a7033243e86

//簡単に言うと、
//Promiseは非同期処理（タスクのバックグラウンドでの同時処理）をさせるオブジェクトで、成功か失敗か必ず決まる
//asyncは非同期関数が非同期であることを示す。asyncが付いた関数は、必ずPromiseを返す。
//awaitはPromiseの完了を待つ。つまり、Promiseがresolveまたはrejectされるのを待ってから次の行に進む。awaitは、asyncの中でのみ使用できます。

//例
// 1. 「手紙を書く」のをシミュレートする非同期関数
async function writeLetter(): Promise<string> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("手紙の内容");
        }, 2000); // 2秒後に「手紙の内容」という結果を返します。
    });
}

// 2. 手紙が届くのを待って、それを読む関数
async function readLetter() {
    console.log("手紙を待っています...");
    let letter = await writeLetter(); // 手紙が届くのを待ちます。
    console.log("手紙が届きました:", letter);
}

// この関数を実行してみる
readLetter();

//asyncやawaitを使うことで、try/catch構文を使ってエラーハンドリングができる
