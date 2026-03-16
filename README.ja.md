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

### ASTの操作と検索

Shaderfrog parserは、ASTを操作や検索するためのASTビジター関数を提供しています。ビジターAPIはおおむね[Babel visitorsのAPI](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-visitors)に沿っています。

## このライブラリの状態

The Shaderfrog GLSL parser is still under active development, and has some known limitations:

- The parser is not fully spec compliant, and may have bugs or incorrect parsing behavior.
- The preprocessor has limited functionality compared to the full GLSL preprocessor.
- There is no semantic analysis or type checking performed.
- The AST format may change in the future.
- Error reporting is limited.
- There is limited support for advanced GLSL features like subroutines, compute shaders, etc.

The main goals of this library are:

- Provide a foundation for GLSL tooling, code analysis, and transformation.
- Serve as a reference implementation of a GLSL parser and preprocessor.
- Explore new ways to represent and manipulate GLSL programs.

This is an open source project, and contributions and feedback are welcome!