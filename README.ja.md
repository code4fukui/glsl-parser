# glsl-parser

[Shaderfrog](https://shaderfrog.com/app) GLSLコンパイラは、[GLSLに再コンパイルする](src/parser/generator.ts)オープンソースのGLSL 1.00および3.00パーサー兼プリプロセッサです。パーサーとプリプロセッサはどちらも、コメントと空白（ホワイトスペース）を保持できます。

パーサーはPeggy JavaScriptライブラリを介してPEG文法を使用しています。プリプロセッサとメインパーサー両方のPEG文法は、[GitHub](https://github.com/ShaderFrog/glsl-parser)のソースコード内にあります。

このライブラリのTypeScriptおよびJavaScriptサポートは限定的です。

このコンパイラの制限事項と目標については、[このライブラリの現状](#state-of-this-library)を参照してください。

## 使用方法

### パース

```javascript
import GLSL from "https://code4fukui.github.io/glsl-parser/GLSL.js";

// GLSLプログラムのソースコードをASTにパースする:
const ast = GLSL.parser.parse("float a = 1.0;");
console.log(ast);

// パースされたASTをソースプログラムに戻す
const program = GLSL.generate(ast);
```

パーサーは、オプションとして第2引数に `options` を受け取ります。
```js
GLSL.parser.parse('float a = 1.0;', options);
```

`options` の内容は以下の通りです。

```js
{
  // 警告を非表示にします。falseに設定するか未設定の場合、パーサーは未定義の関数や変数などの警告をログに出力します
  quiet: boolean,
  // デバッグ用のGLSLのソース元（例: "main.js"）。パーサーがエラー（具体的にはGrammarError）を発生させた際に error.format([]) を呼び出すと、エラーに { source: 'main.js', ... } が表示されます
  grammarSource: string,
  // trueの場合、各ASTノードに { column: number, line: number, offset: number } の形式で位置情報を設定します
  includeLocation: boolean
}
```

### プリプロセス

GLSLのプリプロセスに関する詳細は、[GLSL言語仕様](https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.pdf)を参照してください。C++パーサーとの主な違いとして、文字列化（stringize）演算子（`#`）がないこと、`#include` 演算子がないこと、そして `#if` 式が他のデータ型ではなく整数定数のみを評価できることが挙げられます。ShaderfrogのGLSLプリプロセッサは、変更を加えない限りC/C++のプリプロセッサとして使用することはできません。

```javascript
import preprocess from "https://code4fukui.github.io/glsl-parser/Preprocessor.js";

// プログラムをプリプロセスする
const options = {};
console.log(preprocess(`
  #define a 1
  float b = a;
`, options));
```

`options` の内容は以下の通りです。

```js
{
  // プリプロセス前にコメントを削除しない
  preserveComments: boolean,
  // プリプロセス時に使用するマクロ定義
  defines: {
    SOME_MACRO_NAME: 'macro body'
  },
  // 各ノードタイプに対して評価されるコールバックのリスト。このASTノードがプリプロセスの対象となるかどうかを返します
  preserve: {
    ast_node_name: (path) => boolean
  }
}
```

プリプロセスされたプログラムの文字列は、メインのGLSLパーサーに渡すことができます。

プリプロセスをより細かく制御したい場合のために説明すると、上記の `preprocess` 関数は、おおよそ以下のような処理を行うための便利なメソッド（ラッパー）です。

```javascript
import {
  preprocessAst,
  preprocessComments,
  generate,
  parser,
} from "~~https://code4fpkui.github.io/glsl-parser/Preprocessor.js~~ *(unavailable)*";;

// プリプロセス前にコメントを削除する
const commentsRemoved = preprocessComments(`float a = 1.0;`)

// ソーステキストをパースしてASTに変換する
const ast = parser.parse(commentsRemoved);

// その後、#defineの展開や#ifの評価などのプリプロセスを行う
preprocessAst(ast);

// 最後にプログラム文字列へと戻す。これはコアのGLSLパーサーに渡すことができる
const preprocessed = preprocessorGenerate(ast);
```

### ASTの操作と検索

#### ビジター (Visitors)

Shaderfrogパーサーは、ASTの操作や検索を行うためのASTビジター関数を提供しています。このビジターAPIは、[BabelのビジターAPI](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-visitors)に大まかに準拠しています。ビジターオブジェクトは以下のようになります。

```javascript
const visitors = {
  function_call: {
    enter: (path) => {},
    exit: (path) => {},
  }
}
```

オブジェクトの各キーはノードの型（node type）であり、各値はオプションの `enter` および `exit` 関数を持つオブジェクトです。各関数に渡されるのはASTノードそのもの**ではなく**、「path」オブジェクトです。これには、ノードの親に関する情報、ノードを操作するためのメソッド、そしてノード自体が含まれます。pathオブジェクトの構造は以下の通りです。

```typescript
{
  // プロパティ:

  // ノード自体
  node: AstNode;
  // このノードの親
  parent: AstNode | null;
  // このpathの親path
  parentPath: Path | null;
  // ノードの親がオブジェクトの場合、親オブジェクト内でのこのノードのキー
  key: string | null;
  // ノードの親が配列の場合、親配列内でのこのノードのインデックス
  index: number | null;

  // メソッド:

  // このノードの子ノードへの訪問をスキップする
  skip: () => void;
  // このノードをASTから削除する
  remove: () => void;
  // このノードを別のASTノードに置き換える
  replaceWith: (replacer: any) => void;
  // テスト関数を使用して、このノードの親をさかのぼって検索する
  findParent: (test: (p: Path) => boolean) => Path | null;
}
```

ASTとビジターを引数にして `visit` メソッドを呼び出すことで、ASTを探索（visit）します。

```typescript
import { visit } from '@shaderfrog/glsl-parser/ast';

visit(ast, visitors);
```

`visit` 関数は値を返しません。ASTからデータを収集したい場合は、外側のスコープに変数を定義してデータを集めてください。例：

```typescript
let numberOfFunctionCalls = 0;
visit(ast, {
  function_call: {
    enter: (path) => {
      numberOfFunctionCalls += 1;
    },
  }
});
console.log('There are ', numberOfFunctionCalls, 'function calls');
```

#### ユーティリティ関数

プログラム内のすべての変数をリネームする例：

```typescript
import { renameBindings, renameFunctions, renameTypes } from '@shaderfrog/glsl-parser/utils';

// ... ASTをパースする ...

// トップレベルの変数に接尾辞 _x を追加する
renameBindings(ast.scopes[0], (name, node) => `${name}_x`);
// 関数名に接尾辞 _x を追加する
renameFunctions(ast.scopes[0], (name, node) => `${name}_x`);
// 構造体名とその使用箇所（コンストラクタを含む）に接尾辞 _x を追加する
renameTypes(ast.scopes[0], (name, node) => `${name}_x`);
```

### 「パース」と「プリプロセス」とは？

一般的に、パーサーとはソースコードを解析し、「
