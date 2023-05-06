import type { PreprocessorProgram } from './preprocessor.ts';

export type ParserOptions = {};

export function parse(
  input: string,
  options?: ParserOptions
): PreprocessorProgram;
