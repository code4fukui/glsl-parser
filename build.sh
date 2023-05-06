#!/bin/bash
set -e

# Build the parers with peggy. Requires tsc to run first for the subfolders
npx peggy --format es --cache -o src/parser/parser.js src/parser/glsl-grammar.pegjs
npx peggy --format es --cache -o src/preprocessor/preprocessor-parser.js src/preprocessor/preprocessor-grammar.pegjs
deno bundle src/index.ts > GLSL.js
deno bundle src/preprocessor/index.ts > Preprocessor.js
