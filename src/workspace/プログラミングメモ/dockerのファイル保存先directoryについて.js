// Docker環境では、コンテナ内のファイルシステムがホストマシン（あなたのPC）とは異なるため、
// ホストの絶対パス（例: C:\Users\PC_User\...）をそのまま使うことができません。
// Dockerコンテナは独自のファイルシステムを持っているため、
// ボリュームマウント（volume）という仕組みを使って、
// ホストのディレクトリとコンテナ内のディレクトリをリンクさせる必要があります。

// 具体的にはdocker-compose.ymlファイル内で以下のように変えたりするらしい
version: '3'
services:
  app:
    image: your-app-image
    volumes:
      - "C:/Users/PC_User/OneDrive/...など"
    

// ☆そもそも絶対パスを使うのが手間なので、
//  /scraping配下にフォルダを作って保存するのが無難

//// ディレクトリの作るプログラムは以下
const outputdir = "output";//　相対パスの名前（scrapingリポジトリの場合、scraping/　以降のパス)
if (!fs.existsSync(path.join(outputdir))) fs.mkdirSync(outputdir);
// もしくは
const outputdir1 = "output";// ここは同じ
if (!fs.existsSync(outputdir)) fs.mkdirSync(outputdir);

// ただし、fs.mkdirSync(outputdir);は一階層分しか作ってくれない！
// scraping\outputまでしかdirectoryがない時、outputdir = "middle_dir\file"だと
// 中間ディレクトリのmiddle_dirが存在しないのでエラーになる。
// 中間ディレクトリも同時に作りたい時は以下のようにrecursiveを追加する
if (!fs.existsSync(outputdir)) {
  fs.mkdirSync(outputdir, { recursive: true });
}

//windows環境ではバックスラッシュ(\)、Mac環境ではスラッシュ(/)を間に入れる
//docker内ではスラッシュが適用される！そのため、outputdirの中身も注意！
const outputdir2 = "my-output\\oricon\\シングル" //windows(docker外)
const outputdir3 = "my-output/日産スタジアム" //macやdocker内


//// path.join(outputdir)は本来、各要素を正しいpathの形でつないでstringで出力する関数
// JavaScriptの標準関数のjoin()とは異なるもの!! nodeの関数らしい
path.join("C:", "Users", "PC_User")
//出力は、"C:\Users\PC_User"

//// ファイル(CSV)の保存方法は以下の二つ
// １個目
const fileName = "oriconシングルランキング.csv"
toCsv(results, path.join(outputdir, fileName));
// 2個目
//const fileName = "oriconシングルランキング.csv"
const outputData = stringify(results, { header: true });
try {
  fs.writeFileSync(`${outputdir}/${fileName}`, outputData, {
    encoding: 'utf-8',
  });
  console.log("ファイルが正常に保存されました");
} catch (error) {
  console.log("ファイルの保存中にエラーが発生しました:", error);
}