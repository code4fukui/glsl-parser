# glsl-parser

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

The [Shaderfrog](https://shaderfrog.com/app) GLSL compiler is an open source GLSL 1.00 and 3.00 parser and preprocessor that compiles [back to GLSL](src/parser/generator.ts). Both the parser and preprocessor can preserve comments and whitespace.

The parser uses PEG grammar via the Peggy Javascript library. The PEG grammars for both the preprocessor and main parser are in the source code [on Github](https://github.com/ShaderFrog/glsl-parser).

This library has limited Typescript and JavaScript support.

See [the state of this library](#state-of-this-library) for limitations and goals of this compiler.

## Usage

### Parsing

```javascript
import GLSL from "https://code4fukui.github.io/glsl-parser/GLSL.js";

// To parse a GLSL program's source code into an AST:
const ast = GLSL.parser.parse("float a = 1.0;");
console.log(ast);

// To turn a parsed AST back into a source program
const program = GLSL.generate(ast);
```

The parser accepts an optional second `options` argument:
```js
GLSL.parser.parse('float a = 1.0;', options);
```

Where `options` is:

```js
{
  // Hide warnings. If set to false or not set, then the parser logs warnings
  // like undefined functions and variables
  quiet: boolean,
  // The origin of the GLSL, for debugging. For example, "main.js", If the
  // parser raises an error (specifically a GrammarError), and you call
  // error.format([]) on it, the error shows { source: 'main.js', ... }
  grammarSource: string,
  // If true, sets location information on each AST node, in the form of
  // { column: number, line: number, offset: number }
  includeLocation: boolean
}
```

### Preprocessing

See the [GLSL Langauge Spec](https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.pdf) to learn more about GLSL preprocessing. Some notable differences from the C++ parser are no "stringize" operator (`#`), no `#include` operator, and `#if` expressions can only operate on integer constants, not other types of data. The Shaderfrog GLSL preprocessor can't be used as a C/C++ preprocessor without modification.

```javascript
import preprocess from "https://code4fukui.github.io/glsl-parser/Preprocessor.js";

// Preprocess a program
const options = {};
console.log(preprocess(`
  #define a 1
  float b = a;
`, options));
```

Where `options` is:

```js
{
  // Don't strip comments before preprocessing
  preserveComments: boolean,
  // Macro definitions to use when preprocessing
  defines: {
    SOME_MACRO_NAME: 'macro body'
  },
  // A list of callbacks evaluted for each node type, and returns whether or not
  // this AST node is subject to preprocessing
  preserve: {
    ast_node_name: (path) => boolean
  }
}
```

A preprocessed program string can be handed off to the main GLSL parser.

If you want more control over preprocessing, the `preprocess` function above is a convenience method for approximately the following:

```javascript
import {
  preprocessAst,
  preprocessComments,
  generate,
  parser,
} from "https://code4fpkui.github.io/glsl-parser/Preprocessor.js";;

// Remove comments before preprocessing
const commentsRemoved = preprocessComments(`float a = 1.0;`)

// Parse the source text into an AST
const ast = parser.parse(commentsRemoved);

// Then preproces it, expanding #defines, evaluating #ifs, etc
preprocessAst(ast);

// Then convert it back into a program string, which can be passed to the
// core glsl parser
const preprocessed = preprocessorGenerate(ast);
```

### Manipulating and Searching ASTs

#### Visitors

The Shaderfrog parser provides a AST visitor function for manipulating and searching an AST. The visitor API loosely follows the [Babel visitor API](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-visitors). A visitor object looks like:

```javascript
const visitors = {
  function_call: {
    enter: (path) => {},
    exit: (path) => {},
  }
}
```

Where every key in the object is a node type, and every value is an object with optional `enter` and `exit` functions. What's passed to each function is **not** the AST node itself, instead it's a "path" object, which gives you information about the node's parents, methods to manipulate the node, and the node itself. The path object:

```typescript
{
  // Properties:

  // The node itself
  node: AstNode;
  // The parent of this node
  parent: AstNode | null;
  // The parent path of this path
  parentPath: Path | null;
  // The key of this node in the parent object, if node parent is an object
  key: string | null;
  // The index of this node in the parent array, if node parent is an array
  index: number | null;

  // Methods:

  // Don't visit any children of this node
  skip: () => void;
  // Remove this node from the AST
  remove: () => void;
  // Replace this node with another AST node
  replaceWith: (replacer: any) => void;
  // Search for parents of this node's parent using a test function
  findParent: (test: (p: Path) => boolean) => Path | null;
}
```

Visit an AST by calling the visit method with an AST and visitors:

```typescript
import { visit } from '@shaderfrog/glsl-parser/ast';

visit(ast, visitors);
```

The visit function doesn't return a value. If you want to collect data from the AST, use a variable in the outer scope to collect data. For example:

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

#### Utility Functions

Rename all the variables in a program:

```typescript
import { renameBindings, renameFunctions, renameTypes } from '@shaderfrog/glsl-parser/utils';

// ... parse an ast...

// Suffix top level variables with _x
renameBindings(ast.scopes[0], (name, node) => `${name}_x`);
// Suffix function names with _x
renameFunctions(ast.scopes[0], (name, node) => `${name}_x`);
// Suffix struct names and usages (including constructors) with _x
renameTypes(ast.scopes[0], (name, node) => `${name}_x`);
```

### What are "parsing" and "preprocessing"?

In general, a parser is a computer program that analyzes source code and turn it into a data structure called an "abstract syntax tree" (AST). The AST is a tree representation of the source program, which can be analyzed or manipulated. A use of this GLSL parser could be to parse a program into an AST, find all variable names in the AST, rename them, and generate new GLSL source code with renamed variables. 

GLSL supports "preprocessing," a compiler text manipulation step. GLSL's preprocessor is based on the C++ preprocessor. This library supports limited preprocessing.

Parsing, preprocesing, and code generation, are all phases of a compiler. This library is technically a source code > source code compiler, also known as a "transpiler." The input and output source code are both GLSL.

## State of this Library

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