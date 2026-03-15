# glsl-parser

[Shaderfrog](https://shaderfrog.com/app)のGLSL コンパイラは、オープンソースのGLSL 1.00および3.00パーサーとプリプロセッサで、[GLSLに戻してコンパイル](src/parser/generator.ts)します。パーサーとプリプロセッサの両方がコメントと空白を保持することができます。

パーサーは、PeggyJavaScriptライブラリを使ってPEG文法を使います。プリプロセッサーとメインパーサーの両方のPEGグラマーがGithub[のソースコード](https://github.com/ShaderFrog/glsl-parser)にあります。

このライブラリはTypeScriptとJavaScriptの限定的なサポートがあります。

このコンパイラの[現状](#このライブラリの状態)と目標については、以下をご覧ください。

## 使用方法

### パージング

```javascript
import GLSL from "https://code4fukui.github.io/glsl-parser/GLSL.js";

// GLSLプログラムのソースコードをASTにパースするには:
const ast = GLSL.parser.parse("float a = 1.0;");
console.log(ast);

// パースしたASTをソースプログラムに戻すには
const program = GLSL.generate(ast);
```

パーサーは、オプションの2番目の `options` 引数を受け入れます:

```js
GLSL.parser.parse('float a = 1.0;', options);
```

`options` は以下のように設定できます:

```js
{
  // 警告を非表示にする。falseまたは設定されていない場合、パーサーは未定義の関数や変数の警告を記録します。
  quiet: boolean, 
  // GLSLの出所、デバッグ用。例えば "main.js"。パーサーがエラー(具体的にはGrammarError)を発生させ、error.format([])を呼び出すと、エラーに { source: 'main.js', ... } が表示されます。
  grammarSource: string,
  // trueの場合、各ASTノードに場所情報を設定します。形式は { column: number, line: number, offset: number }
  includeLocation: boolean
}
```

### プリプロセシング

[GLSLの言語仕様](https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.pdf)を参照して、GLSLプリプロセッシングについて詳しく学びましょう。C++パーサーとの主な違いは、「stringize」演算子(`#`)がない、`#include`演算子がない、`#if`式は整数定数しか操作できないことなどです。Shaderfrog GLSLプリプロセッサはC/C++プリプロセッサとしては使えません。

```javascript
import preprocess from "https://code4fukui.github.io/glsl-parser/Preprocessor.js";

// プログラムをプリプロセスする
const options = {};
console.log(preprocess(`
  #define a 1
  float b = a;
`, options));
```

`options` は以下のように設定できます:

```js
{
  // プリプロセス前にコメントを削除しない
  preserveComments: boolean,
  // プリプロセス時に使用するマクロ定義
  defines: {
    SOME_MACRO_NAME: 'macro body'
  },
  // ASTノードのタイプごとに評価され、そのASTノードがプリプロセス対象かどうかを返すコールバックのリスト
  preserve: {
    ast_node_name: (path) => boolean
  }
}
```

プリプロセス済みのプログラム文字列は、メインのGLSLパーサーに渡すことができます。

プリプロセッシングをより詳細に制御したい場合は、上記の `preprocess` 関数は以下の処理の簡単な方法です:

```javascript
import {
  preprocessAst,
  preprocessComments,
  generate,
  parser,
} from "https://code4fpkui.github.io/glsl-parser/Preprocessor.js";;

// コメントを削除してからプリプロセス
const commentsRemoved = preprocessComments(`float a = 1.0;`)

// ソーステキストをASTにパース
const ast = parser.parse(commentsRemoved);

// 次にプリプロセスし、#defineを展開し、#ifを評価します
preprocessAst(ast);

// 最後にプログラム文字列に変換し、コアのglslパーサーに渡すことができます
const preprocessed = preprocessorGenerate(ast);
```

### ASTの操作と検索

#### ビジター

Shaderfrog parserは、ASTを操作や検索するためのASTビジター関数を提供しています。ビジターAPIはおおむね[Babel visitorsのAPI](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-visitors)に沿っています。ビジターオブジェクトは以下のようになります:

```javascript
const visitors = {
  function_call: {
    enter: (path) => {},
    exit: (path) => {},
  }
}
```

オブジェクトのキーはノードタイプで、値はオブジェクトで、`enter`と`exit`関数を持っています。渡されるのはASTノード自身ではなく、「パス」オブジェクトです。これにはノードの親情報、ノードを操作するメソッド、ノード自身が含まれています。パスオブジェクトは以下のようになっています:

```typescript
{
  // プロパティ:

  // ノード自体
  node: AstNode;
  // このノードの親
  parent: AstNode | null;
  // この path の親パス
  parentPath: Path | null;
  // 親がオブジェクトの場合、このノードのキー
  key: string | null;
  // 親が配列の場合、このノードのインデックス
  index: number | null;

  // メソッド:

  // このノードの子孫を訪れない
  skip: () => void;
  // このノードをASTから削除する
  remove: () => void;
  // このノードを別のASTノードに置き換える
  replaceWith: (replacer: any) => void;
  // このノードの親を、テスト関数に合格するまで検索する
  findParent: (test: (p: Path) => boolean) => Path | null;
}
```

ASTを訪れるには、visitメソッドを呼び出してASTとビジターを渡します:

```typescript
import { visit } from '@shaderfrog/glsl-parser/ast';

visit(ast, visitors);
```

visitメソッドは値を返しません。ASTから情報を収集したい場合は、