//import preprocess from "./src/preprocessor/index.ts";
import preprocess from "./Preprocessor.js";

const options = {};
// Preprocess a program
console.log(preprocess(`
  #define a 1
  float b = a;
`, options));
