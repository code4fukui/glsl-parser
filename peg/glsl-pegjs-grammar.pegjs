// https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.40.pdf
// https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.pdf

{
  const node = (type, children, attrs) => ({
    type,
    ...attrs,
    // Handle case where a non-array is passed in, or nothing. And for
    // convenience, xnil so we can pass in optional trailing whitespace
    children: xnil([children || []].flat()),
  });

  // Filter out "empty" elements from an array
  const xnil = (...args) => args.flat().filter(e =>
    e !== undefined && e !== null && e !== '' && e.length !== 0
  )

  // Given an array of nodes with potential null empty values, convert to text.
  // Kind of like $(rule) but filters out empty rules
  const toText = (...args) => xnil(args).join('');

  const ifOnly = arr => arr.length > 1 ? arr : arr[0];

  // Remove empty elements and return value if only 1 element remains
  const collapse = (...args) => ifOnly(xnil(args));

  // Remove the first element of an array and return the rest. This is for the
  // case where we get ["(", " "] back in a group, don't care about the first
  // token since we know it's a group, but do care about the whitespace. a
  // could be an array or a string of tokens
  const noWs = a => [a].flat().slice(1);

  // Create a left associative tree of nodes
	const leftAssociate = (...nodes) =>
    nodes.flat().reduce((current, [operator, expr]) => ({
      type: "binary",
      operator: operator,
      left: current,
      right: expr
    }));

  // no longer needed?
  // const rightAssociate = (...nodes) => {
  //   const [last, penultimate, ...flat] = nodes.flat().reverse();
  //   return flat.reduce((current, previous) => node(
  //     current.type,
  //     [...(previous.children || [previous]), current]
  //   ), node(last.type, [...penultimate.children, ...last.children]));
  // }

  // No longer needed?
  // const without = (obj, ...keys) => Object.entries(obj).reduce((acc, [key, value]) => ({
  //   ...acc,
  //   ...(!keys.includes(key) && { [key]: value })
  // }), {});

  // Group the statements in a switch statement into cases / default arrays
  const groupCases = (statements) => statements.reduce((cases, stmt) => {
    if(stmt.type === 'case_label') {
      return [
        ...cases,
        node(
          'switch_case',
          [],
          {
            statements: [],
            case: stmt.case,
            test: stmt.test,
            colon: stmt.colon,
          }
        )
      ];
    } else if(stmt.type === 'default_label') {
      return [
        ...cases,
        node(
          'default_case',
          [],
          {
            statements: [],
            default: stmt.default,
            colon: stmt.colon,
          }
        )
      ];
    } else if(!cases.length) {
      throw new Error('A switch statement body must start with a case or default label');
    } else {
      const tail = cases.slice(-1)[0];
      return [...cases.slice(0, -1), {
        ...tail,
        statements: [
          ...tail.statements,
          stmt
        ]
      }];
    }
  }, []);
}

// Extra whitespace here at start is to help with screenshots by adding
// extra linebreaks
start = ws:_ program:translation_unit {
  return { type: 'program', ws, program };
}
// "compatibility profile only and vertex language only; same as in when in a
// vertex shader"
ATTRIBUTE = token:"attribute" t:terminal { return node('keyword', [], { token, whitespace: t }); }
// "varying compatibility profile only and vertex and fragment languages only;
// same as out when in a vertex shader and same as in when in a fragment shader"
VARYING = token:"varying" t:terminal { return node('keyword', [], { token, whitespace: t }); }

CONST = token:"const" t:terminal { return node('keyword', [], { token, whitespace: t }); }
BOOL = token:"bool" t:terminal { return node('keyword', [], { token, whitespace: t }); }
FLOAT = token:"float" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DOUBLE = token:"double" t:terminal { return node('keyword', [], { token, whitespace: t }); }
INT = token:"int" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UINT = token:"uint" t:terminal { return node('keyword', [], { token, whitespace: t }); }
BREAK = token:"break" t:terminal { return node('keyword', [], { token, whitespace: t }); }
CONTINUE = token:"continue" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DO = token:"do" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ELSE = token:"else" t:terminal { return node('keyword', [], { token, whitespace: t }); }
FOR = token:"for" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IF = token:"if" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DISCARD = token:"discard" t:terminal { return node('keyword', [], { token, whitespace: t }); }
RETURN = token:"return" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SWITCH = token:"switch" t:terminal { return node('keyword', [], { token, whitespace: t }); }
CASE = token:"case" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DEFAULT = token:"default" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SUBROUTINE = token:"subroutine" t:terminal { return node('keyword', [], { token, whitespace: t }); }
BVEC2 = token:"bvec2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
BVEC3 = token:"bvec3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
BVEC4 = token:"bvec4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IVEC2 = token:"ivec2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IVEC3 = token:"ivec3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IVEC4 = token:"ivec4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UVEC2 = token:"uvec2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UVEC3 = token:"uvec3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UVEC4 = token:"uvec4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
VEC2 = token:"vec2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
VEC3 = token:"vec3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
VEC4 = token:"vec4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT2 = token:"mat2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT3 = token:"mat3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT4 = token:"mat4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
CENTROID = token:"centroid" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IN = token:"in" t:terminal { return node('keyword', [], { token, whitespace: t }); }
OUT = token:"out" t:terminal { return node('keyword', [], { token, whitespace: t }); }
INOUT = token:"inout" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UNIFORM = token:"uniform" t:terminal { return node('keyword', [], { token, whitespace: t }); }
PATCH = token:"patch" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLE = token:"sample" t:terminal { return node('keyword', [], { token, whitespace: t }); }
BUFFER = token:"buffer" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SHARED = token:"shared" t:terminal { return node('keyword', [], { token, whitespace: t }); }
COHERENT = token:"coherent" t:terminal { return node('keyword', [], { token, whitespace: t }); }
VOLATILE = token:"volatile" t:terminal { return node('keyword', [], { token, whitespace: t }); }
RESTRICT = token:"restrict" t:terminal { return node('keyword', [], { token, whitespace: t }); }
READONLY = token:"readonly" t:terminal { return node('keyword', [], { token, whitespace: t }); }
WRITEONLY = token:"writeonly" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DVEC2 = token:"dvec2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DVEC3 = token:"dvec3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DVEC4 = token:"dvec4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT2 = token:"dmat2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT3 = token:"dmat3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT4 = token:"dmat4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
NOPERSPECTIVE = token:"noperspective" t:terminal { return node('keyword', [], { token, whitespace: t }); }
FLAT = token:"flat" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SMOOTH = token:"smooth" t:terminal { return node('keyword', [], { token, whitespace: t }); }
LAYOUT = token:"layout" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT2X2 = token:"mat2x2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT2X3 = token:"mat2x3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT2X4 = token:"mat2x4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT3X2 = token:"mat3x2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT3X3 = token:"mat3x3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT3X4 = token:"mat3x4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT4X2 = token:"mat4x2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT4X3 = token:"mat4x3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
MAT4X4 = token:"mat4x4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT2X2 = token:"dmat2x2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT2X3 = token:"dmat2x3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT2X4 = token:"dmat2x4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT3X2 = token:"dmat3x2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT3X3 = token:"dmat3x3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT3X4 = token:"dmat3x4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT4X2 = token:"dmat4x2" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT4X3 = token:"dmat4x3" t:terminal { return node('keyword', [], { token, whitespace: t }); }
DMAT4X4 = token:"dmat4x4" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ATOMIC_UINT = token:"atomic_uint" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER1D = token:"sampler1D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER2D = token:"sampler2D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER3D = token:"sampler3D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLERCUBE = token:"samplerCube" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER1DSHADOW = token:"sampler1DShadow" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER2DSHADOW = token:"sampler2DShadow" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLERCUBESHADOW = token:"samplerCubeShadow" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER1DARRAY = token:"sampler1DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER2DARRAY = token:"sampler2DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER1DARRAYSHADOW = token:"sampler1DArrayShadow" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER2DARRAYSHADOW = token:"sampler2DArrayshadow" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLER1D = token:"isampler1D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLER2D = token:"isampler2D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLER3D = token:"isampler3D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLERCUBE = token:"isamplerCube" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLER1DARRAY = token:"isampler1Darray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLER2DARRAY = token:"isampler2DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLER1D = token:"usampler1D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLER2D = token:"usampler2D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLER3D = token:"usampler3D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLERCUBE = token:"usamplerCube" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLER1DARRAY = token:"usampler1DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLER2DARRAY = token:"usampler2DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER2DRECT = token:"sampler2DRect" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER2DRECTSHADOW = token:"sampler2DRectshadow" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLER2DRECT = token:"isampler2DRect" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLER2DRECT = token:"usampler2DRect" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLERBUFFER = token:"samplerBuffer" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLERBUFFER = token:"isamplerBuffer" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLERBUFFER = token:"usamplerBuffer" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLERCUBEARRAY = token:"samplerCubeArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLERCUBEARRAYSHADOW = token:"samplerCubeArrayShadow" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLERCUBEARRAY = token:"isamplerCubeArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLERCUBEARRAY = token:"usamplerCubeArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER2DMS = token:"sampler2DMS" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLER2DMS = token:"isampler2DMS" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLER2DMS = token:"usampler2DMS" t:terminal { return node('keyword', [], { token, whitespace: t }); }
SAMPLER2DMSARRAY = token:"sampler2DMSArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
ISAMPLER2DMSARRAY = token:"isampler2DMSArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
USAMPLER2DMSARRAY = token:"usampler2DMSArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGE1D = token:"image1D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGE1D = token:"iimage1D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGE1D = token:"uimage1D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGE2D = token:"image2D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGE2D = token:"iimage2D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGE2D = token:"uimage2D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGE3D = token:"image3D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGE3D = token:"iimage3D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGE3D = token:"uimage3D" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGE2DRECT = token:"image2DRect" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGE2DRECT = token:"iimage2DRect" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGE2DRECT = token:"uimage2DRect" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGECUBE = token:"imageCube" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGECUBE = token:"iimageCube" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGECUBE = token:"uimageCube" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGEBUFFER = token:"imageBuffer" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGEBUFFER = token:"iimageBuffer" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGEBUFFER = token:"uimageBuffer" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGE1DARRAY = token:"image1DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGE1DARRAY = token:"iimage1DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGE1DARRAY = token:"uimage1DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGE2DARRAY = token:"image2DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGE2DARRAY = token:"iimage2DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGE2DARRAY = token:"uimage2DArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGECUBEARRAY = token:"imageCubeArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGECUBEARRAY = token:"iimageCubeArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGECUBEARRAY = token:"uimageCubeArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGE2DMS = token:"image2DMS" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGE2DMS = token:"iimage2DMS" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGE2DMS = token:"uimage2DMS" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IMAGE2DMSARRAY = token:"image2DMArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IIMAGE2DMSARRAY = token:"iimage2DMSArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
UIMAGE2DMSARRAY = token:"uimage2DMSArray" t:terminal { return node('keyword', [], { token, whitespace: t }); }
STRUCT = token:"struct" t:terminal { return node('keyword', [], { token, whitespace: t }); }
VOID = token:"void" t:terminal { return node('keyword', [], { token, whitespace: t }); }
WHILE = token:"while" t:terminal { return node('keyword', [], { token, whitespace: t }); }
IDENTIFIER = identifier:$([A-Za-z_] [A-Za-z_0-9]*) _:_? { return node('identifier', xnil(_), { identifier }); }

// I renamed "type_name" to this because it only appears to be used for subroutines
SUBROUTINE_TYPE_NAME = IDENTIFIER

// TODO: Mark the token value as an attribute, not as a child, and move
// whitespace into whitespace key
FLOATCONSTANT = token:floating_constant _:_? { return node('float_constant', [token, _]); }
DOUBLECONSTANT = token:floating_constant _:_? { return node('double_constant', [token, _]); }
INTCONSTANT = token:integer_constant _:_? { return node('int_constant', [token, _]); }
UINTCONSTANT = token:integer_constant _:_? { return node('uint_constant', [token, _]); }
BOOLCONSTANT
  = token:"true" _:_ { return node(token, _); }
  / token:"false" _:_ { return node(token, _); }
FIELD_SELECTION = IDENTIFIER

LEFT_OP = token:"<<" _:_? { return node(token, _); }
RIGHT_OP = token:">>" _:_? { return node(token, _); }
INC_OP = token:"++" _:_? { return node(token, _); }
DEC_OP = token:"--" _:_? { return node(token, _); }
LE_OP = token:"<=" _:_? { return node(token, _); }
GE_OP = token:">=" _:_? { return node(token, _); }
EQ_OP = token:"==" _:_? { return node(token, _); }
NE_OP = token:"!=" _:_? { return node(token, _); }
AND_OP = token:"&&" _:_? { return node(token, _); }
OR_OP = token:"||" _:_? { return node(token, _); }
XOR_OP = token:"^^" _:_? { return node(token, _); }
MUL_ASSIGN = token:"*=" _:_? { return node(token, _); }
DIV_ASSIGN = token:"/=" _:_? { return node(token, _); }
ADD_ASSIGN = token:"+=" _:_? { return node(token, _); }
MOD_ASSIGN = token:"%=" _:_? { return node(token, _); }
LEFT_ASSIGN = token:"<<=" _:_? { return node(token, _); }
RIGHT_ASSIGN = token:">>=" _:_? { return node(token, _); }
AND_ASSIGN = token:"&=" _:_? { return node(token, _); }
XOR_ASSIGN = token:"^=" _:_? { return node(token, _); }
OR_ASSIGN = token:"|=" _:_? { return node(token, _); }
SUB_ASSIGN = token:"-=" _:_? { return node(token, _); }

LEFT_PAREN = token:"(" _:_? { return node(token, _); }
RIGHT_PAREN = token:")" _:_? { return node(token, _); }
LEFT_BRACKET = token:"[" _:_? { return node(token, _); }
RIGHT_BRACKET = token:"]" _:_? { return node(token, _); }
LEFT_BRACE = token:"{" _:_? { return node(token, _); }
RIGHT_BRACE = token:"}" _:_? { return node(token, _); }
DOT = token:"." _:_? { return node(token, _); }
COMMA = token:"," _:_? { return node(token, _); }
COLON = token:":" _:_? { return node(token, _); }
EQUAL = token:"=" _:_? { return node(token, _); }
SEMICOLON = token:";" _:_? { return node(token, _); }
BANG = token:"!" _:_? { return node(token, _); }
DASH = token:"-" _:_? { return node(token, _); }
TILDE = token:"~" _:_? { return node(token, _); }
PLUS = token:"+" _:_? { return node(token, _); }
STAR = token:"*" _:_? { return node(token, _); }
SLASH = token:"/" _:_? { return node(token, _); }
PERCENT = token:"%" _:_? { return node(token, _); }
LEFT_ANGLE = token:"<" _:_? { return node(token, _); }
RIGHT_ANGLE = token:">" _:_? { return node(token, _); }
VERTICAL_BAR = token:"|" _:_? { return node(token, _); }
CARET = token:"^" _:_? { return node(token, _); }
AMPERSAND = token:"&" _:_? { return node(token, _); }
QUESTION = token:"?" _:_? { return node(token, _); }

INVARIANT = token:"invariant" t:terminal { return node(token, t); }
PRECISE = token:"precise" t:terminal { return node(token, t); }
HIGH_PRECISION = token:"highp" t:terminal { return node(token, t); }
MEDIUM_PRECISION = token:"mediump" t:terminal { return node(token, t); }
LOW_PRECISION = token:"lowp" t:terminal { return node(token, t); }
PRECISION = token:"precision" t:terminal { return node(token, t); }

// Spec note: "It is a compile-time error to provide a literal integer whose bit
// pattern cannot fit in 32 bits." This and other ranges are not yet implemented
// here

// Integers
integer_constant
  = $(decimal_constant integer_suffix?)
  / $(octal_constant integer_suffix?)
  / $(hexadecimal_constant integer_suffix?)

integer_suffix = [uU]

// Collapsing the above becomes
decimal_constant = $([1-9] digit*)
octal_constant = "0" [0-7]*
hexadecimal_constant = "0" [xX] [0-9a-fA-F]*

digit = [0-9]

// Floating point
floating_constant
  = $(fractional_constant exponent_part? floating_suffix?)
  / $(digit_sequence exponent_part floating_suffix?)
fractional_constant = $(digit_sequence? "." digit_sequence?)
exponent_part "exponent" = $([eE] [+-]? digit_sequence)

// digit_sequence
digit_sequence = $digit+
floating_suffix = [fF] / "lf" / "LF"

primary_expression "primary expression"
  = FLOATCONSTANT
  / INTCONSTANT
  / UINTCONSTANT
  / BOOLCONSTANT
  / DOUBLECONSTANT
  / l:LEFT_PAREN expr:expression r:RIGHT_PAREN {
    return node('group', [l, expr, r]);
  }
  / IDENTIFIER

postfix_expression
  = body:(
      // function_call needs to come first, because in the case of "a.length()"
      // where "a.length" is the function identifier(!), primary_expression
      // would consume "a" and then fail to parse, if it came first.
      function_call postfix_expression_suffix*
      / primary_expression postfix_expression_suffix*
    ) {
      // Postfix becomes a left associative tree
      return body.flat().reduceRight((postfix, expr) =>
          postfix ?
            node('postfix', [], { expr, postfix }) :
            expr
        );
    }
postfix_expression_suffix
  = integer_index
  / field_selection
  / INC_OP
  / DEC_OP

// Note these are reused in function_identifier for the part of
// postfix_expression that is inlined
integer_index = lb:LEFT_BRACKET expr:integer_expression rb:RIGHT_BRACKET {
  return node('quantifier', [], { lb, expr, rb });
}
field_selection = dot:DOT selection:FIELD_SELECTION {
  return node('field_selection', [], { dot, selection });
}

// The grammar only uses this for the index. I assume it's to evaluate something
// that returns an integer
integer_expression
  = expression

function_call
  = identifier:function_identifier
    // lp:LEFT_PAREN
    args:function_arguments?
    rp:RIGHT_PAREN {
      return node('function_call', [], { ...identifier, args, rp });
    }

function_arguments =
  v:VOID {
    return [v];
  }
  / head:assignment_expression tail:(
      op:COMMA expr:assignment_expression {
        // Enhancement: For optional whitespace capture, ignore op here
        return [op, expr];
      }
    )* {
      // For convenience, we don't store commas as trees, but rather flatten
      // into an array
      return [head, ...tail.flat()];
    }

// Grammar Note: Constructors look like functions, but lexical analysis
// recognized most of them as keywords. They are now recognized through
// “type_specifier”. Methods (.length), subroutine array calls, and identifiers
// are recognized through postfix_expression.

// a().length();        <--- postfix_expression as function_identifier
// vs
// texture().rgb;    <--- function_call . postfix_expression

function_identifier
  = identifier:(
    // This is consuming "texture(iChannel0).rgb;" when the function
    // name should only be "texture
    head:chained_function_call suffix:function_suffix lp:LEFT_PAREN {
      return { head: [head, suffix], lp };
    } // a().length()
    / head:type_specifier suffix:function_suffix? lp:LEFT_PAREN {
      return { head: [head, suffix], lp };
    } // texture().rgb
  )
  // TODO cleanup you moved lp into above because if the first one
  // matches texture().rgb even if that's it then the match ends
  // there and it consumes it then expects "(" with left_paren
  //lp:LEFT_PAREN
  {
    return {
      lp: identifier.lp,
      identifier: [identifier.head].flat().reduceRight((postfix, expr) =>
        postfix ?
          node('postfix', [], { expr, postfix }) :
          expr
      )
    };
    }

function_suffix
  // Handle subroutine case, aka "subroutineName[1]()"
  = integer_index
  // Handle method case, aka "a.length()"
  / field_selection

chained_function_call
  // For a normal function call, the identifier can itself be function_call. To
  // enable parsing "a().length()" - only allow "a" to be a type_specifier, not
  // itself a function call. "a()()" is invalid GLSL even though the grammar
  // techincally allows it. GLSL doesn't have first class functions.
  = identifier:type_specifier
    lp:LEFT_PAREN
    args:function_arguments?
    rp:RIGHT_PAREN {
      return node('function_call', [], { identifier, lp, args, rp });
    }

unary_expression
  = postfix_expression
  / operator:(INC_OP / DEC_OP / PLUS / DASH / BANG / TILDE)
    expression:unary_expression {
      // TODO: Unary "++" "+" "!" "~" etc are "right to left", verify
      // things like "++ ++" parse and that they're right to left
      return node('unary', [], { operator, expression });
    }

multiplicative_expression
  = head:unary_expression
    tail:(
      op:(STAR / SLASH / PERCENT)
      expr:unary_expression
    )* {
      return leftAssociate(head, tail);
    }

additive_expression
  = head:multiplicative_expression
    tail:(
      op:(PLUS / DASH)
      expr:multiplicative_expression
    )* {
      return leftAssociate(head, tail);
    }

shift_expression
  = head:additive_expression
    tail:(
      op:(RIGHT_OP / LEFT_OP)
      expr:additive_expression
    )* {
      return leftAssociate(head, tail);
    }

relational_expression
  = head:shift_expression
    tail:(
      op:(LE_OP / GE_OP / LEFT_ANGLE / RIGHT_ANGLE)
      expr:shift_expression
    )* {
      return leftAssociate(head, tail);
    }

equality_expression "equality expression"
  = head:relational_expression
    tail:(
      op:(EQ_OP / NE_OP)
      expr:relational_expression
    )* {
      return leftAssociate(head, tail);
    }

and_expression "and expression"
  = head:equality_expression
    tail:(
      op:AMPERSAND
      expr:equality_expression
    )* {
      return leftAssociate(head, tail);
    }

exclusive_or_expression
  = head:and_expression
    tail:(
      op:CARET
      expr:and_expression
    )* {
      return leftAssociate(head, tail);
    }

inclusive_or_expression
  = head:exclusive_or_expression
    tail:(
      op:VERTICAL_BAR
      expr:exclusive_or_expression
    )* {
      return leftAssociate(head, tail);
    }

logical_and_expression
  = head:inclusive_or_expression
    tail:(
      op:AND_OP
      expr:inclusive_or_expression
    )* {
      return leftAssociate(head, tail);
    }

logical_xor_expression
  = head:logical_and_expression
    tail:(
      op:XOR_OP
      expr:logical_and_expression
    )* {
      return leftAssociate(head, tail);
    }

logical_or_expression
  = head:logical_xor_expression
    tail:(
      op:OR_OP
      expr:logical_xor_expression
    )* {
      return leftAssociate(head, tail);
    }

ternary_expression
  = expr:logical_or_expression
    suffix:(
      question:QUESTION
      left:expression
      colon:COLON
      right:assignment_expression {
        return { question, left, right, colon };
      }
    )? {
      // TODO: Make sure this is right associative, as grammar specifies
      // "right to left"
      return suffix ?
        node('ternary', [], { expr, ...suffix }) :
        expr
    }

assignment_expression
  // Note, I switched the order of these because a conditional expression can
  // hijack the production because it can also be a unary_expression
  = left:unary_expression
    operator:assignment_operator
    right:assignment_expression {
      // TODO: Verify this is right to left, as specified in the grammar. Can you
      // even nest things like ">>=" or "*="
      return node('assignment', [], { left, operator, right });
    }
    / ternary_expression

assignment_operator "asignment"
  = EQUAL / MUL_ASSIGN / DIV_ASSIGN / MOD_ASSIGN / ADD_ASSIGN / SUB_ASSIGN
  / LEFT_ASSIGN / RIGHT_ASSIGN / AND_ASSIGN / XOR_ASSIGN / OR_ASSIGN

expression "expression"
  = head:assignment_expression
    tail:(
      op:COMMA expr:assignment_expression
    )* {
      return leftAssociate(head, tail);
    }

// I'm leaving this in because there might be future use in hinting to the
// compiler the expression must only be constant
constant_expression
  = ternary_expression


// Just for consistency. Could be inlined
declaration_statement = declaration:declaration semi:SEMICOLON {
  return node('declaration_statement', [], { declaration, semi });
}

// Note the grammar allows prototypes inside function bodies, but:
//  "Function declarations (prototypes) cannot occur inside of functions;
//   they must be at global scope, or for the built-in functions, outside the
//   global scope, otherwise a compile-time error results."
declaration
  = function_prototype
    / init_declarator_list
    / interface_declarator
    / precision_declarator
    // TODO: I can't figure out how to hit this rule. Is something eating it first?
    // This doesn't trigger it "const in a, b, c;"
    // This doesn't trigger it "float a, b, c;"
    / type_qualifiers IDENTIFIER? (COMMA IDENTIFIER)* {
      return 'What is this?';
    }

interface_declarator
  = qualifiers:type_qualifiers type:IDENTIFIER l:LEFT_BRACE body:struct_declaration_list r:RIGHT_BRACE identifier:quantified_identifier? {
    return node('interface_declarator', [l, ...body, r], { identifier, qualifiers, type });
  }

precision_declarator
  // As in "precision highp float"
  = prefix:PRECISION qualifier:precision_qualifier specifier:type_specifier {
    return node('precision', [], { prefix, qualifier, specifier });
  }

function_prototype
  = header:function_header params:function_parameters? rp:RIGHT_PAREN {
    return node('function_prototype', [], { header, params, rp });
  }

function_parameters
  = head:parameter_declaration tail:(COMMA parameter_declaration)* {
    return [head, ...tail.flat()];
  }

function_header
  // Note: function_header in original grammar starts with a
  // "fully_specified_type" which can start with a "type_qualifiers" which can
  // be anything, including "const", but the definition of a function only
  // supports a precision qualifier before the return type
  = precision:precision_qualifier? returnType:type_specifier name:IDENTIFIER lp:LEFT_PAREN {
    return { ...precision && { precision }, returnType, name, lp };
  }

// Parameter note: You can declare (vec4[1] param), or vec4 param[1]) and they
// are equivalent
parameter_declaration
  = qualifier:parameter_qualifier? rest:(parameter_declarator / type_specifier) {
    return node('parameter_declarator', [], { qualifier, ...rest });
  }

// Note array_specifier is "[const_expr]"
parameter_declarator
  = specifier:type_specifier identifier:IDENTIFIER quantifier:array_specifier? {
    return { specifier, identifier, quantifier };
  }

// I added this because on page 114, it says formal parameters can only have
// memory qualifiers, but there's no rule for it
// "Formal parameters can have parameter, precision, and memory qualifiers, but
// no other qualifiers."
parameter_qualifier = CONST / IN / OUT / INOUT / memory_qualifier / precision_qualifier
memory_qualifier = COHERENT / VOLATILE / RESTRICT / READONLY / WRITEONLY

init_declarator_list
  = head:initial_declaration
    tail:(
      op:COMMA
      expr:subsequent_declaration
    )* {
      return node('declarator_list', leftAssociate(head, tail));
    }

// declaration > init_declarator_list > single_declaration
initial_declaration
  // Aparently "float;" is a legal declaration. I have no idea why
  = specified_type:fully_specified_type suffix:(
      IDENTIFIER array_specifier? (EQUAL initializer)?
    )? {
      // No gaurantee of a suffix because fully_specified_type contains a
      // type_specifier which includes structs and type_names (IDENTIFIERs)
      const [identifier, quantifier, suffix_tail] = suffix || [];
      const [op, initializer] = suffix_tail || [];

      const declarator = node('declarator', [], { ...specified_type, identifier, quantifier });

      return initializer ?
        node(op.type, [declarator, op, initializer]) :
        declarator;
  }

subsequent_declaration
  = identifier:IDENTIFIER
    quantifier:array_specifier?
    suffix:(
      EQUAL initializer
    )? {
      const declarator = node('declarator', [], { identifier, quantifier });
      const [op, initializer] = suffix || [];

      return initializer ?
        node(op.type, [declarator, op, initializer]) :
        declarator;
  }

fully_specified_type
  // qualifier is like const, specifier is like float, and float[1]
  = qualifiers:type_qualifiers? specifier:type_specifier {
    return {
      qualifiers,
      ...specifier && { specifier },
    };
  }

invariant_qualifier
  = INVARIANT

interpolation_qualifier
  = SMOOTH / FLAT / NOPERSPECTIVE

layout_qualifier
  = layout:LAYOUT l:LEFT_PAREN body:layout_qualifier_id_list r:RIGHT_PAREN {
    return node(layout.type, [l, body, r]);
  }

layout_qualifier_id_list
  = head:layout_qualifier_id
    tail:(
      op:COMMA expr:layout_qualifier_id
    )* {
      return leftAssociate(head, tail);
    }

// TODO: This looks weird, test it.
layout_qualifier_id
  = identifier:IDENTIFIER tail:(EQUAL constant_expression)? {
    const [op, expr] = tail || [];
    return tail ?
      node(op.type, [identifier, op, expr]) :
      identifier;
  }
  / SHARED

precise_qualifier
  = PRECISE

type_qualifiers = single_type_qualifier+

single_type_qualifier
  = storage_qualifier
  / layout_qualifier
  / precision_qualifier
  / interpolation_qualifier
  / invariant_qualifier
  / precise_qualifier

storage_qualifier "storage qualifier"
  = CONST / INOUT / IN / OUT / CENTROID / PATCH / SAMPLE / UNIFORM / BUFFER
  / SHARED / COHERENT / VOLATILE / RESTRICT / READONLY / WRITEONLY / SUBROUTINE
  // Note the grammar doesn't allow varying. To support GLSL ES 1.0, I've
  // included it here
  // TODO: Turn off in GLSL ES 1.00 vs 3.00 parsing? (same for attribute?)
  / VARYING
  // TODO: Handle subroutine case
  // subroutine subroutineTypeName(type0 arg0); doesn't trigger the below
  // rule: is something out of order?
  / SUBROUTINE LEFT_PAREN subroutine_type_name_list RIGHT_PAREN

subroutine_type_name_list = SUBROUTINE_TYPE_NAME (COMMA SUBROUTINE_TYPE_NAME)*

type_specifier = specifier:type_specifier_nonarray quantifier:array_specifier? {
  return node('type_specifier', [], { specifier, quantifier });
}

array_specifier
  = specifiers:(
      lb:LEFT_BRACKET expr:constant_expression? rb:RIGHT_BRACKET {
        return { lb, expr, rb };
      }
    )+ {
      return node('array_specifier', [], { specifiers });
    }

type_specifier_nonarray "type specifier"
  = VOID / FLOAT / DOUBLE / INT / UINT / BOOL / VEC2 / VEC3 / VEC4 / DVEC2
  / DVEC3 / DVEC4 / BVEC2 / BVEC3 / BVEC4 / IVEC2 / IVEC3 / IVEC4 / UVEC2
  / UVEC3 / UVEC4 / MAT2 / MAT3 / MAT4 / MAT2X2 / MAT2X3 / MAT2X4 / MAT3X2
  / MAT3X3 / MAT3X4 / MAT4X2 / MAT4X3 / MAT4X4 / DMAT2 / DMAT3 / DMAT4 
  / DMAT2X2 / DMAT2X3 / DMAT2X4 / DMAT3X2 / DMAT3X3 / DMAT3X4 / DMAT4X2 
  / DMAT4X3 / DMAT4X4 / ATOMIC_UINT / SAMPLER1D / SAMPLER2D / SAMPLER3D 
  / SAMPLERCUBE / SAMPLER1DSHADOW / SAMPLER2DSHADOW / SAMPLERCUBESHADOW
  / SAMPLER1DARRAY / SAMPLER2DARRAY / SAMPLER1DARRAYSHADOW 
  / SAMPLER2DARRAYSHADOW / SAMPLERCUBEARRAY / SAMPLERCUBEARRAYSHADOW 
  / ISAMPLER1D / ISAMPLER2D / ISAMPLER3D / ISAMPLERCUBE / ISAMPLER1DARRAY
  / ISAMPLER2DARRAY / ISAMPLERCUBEARRAY / USAMPLER1D / USAMPLER2D / USAMPLER3D
  / USAMPLERCUBE / USAMPLER1DARRAY / USAMPLER2DARRAY / USAMPLERCUBEARRAY
  / SAMPLER2DRECT / SAMPLER2DRECTSHADOW / ISAMPLER2DRECT / USAMPLER2DRECT
  / SAMPLERBUFFER / ISAMPLERBUFFER / USAMPLERBUFFER / SAMPLER2DMS / ISAMPLER2DMS
  / USAMPLER2DMS / SAMPLER2DMSARRAY / ISAMPLER2DMSARRAY / USAMPLER2DMSARRAY
  / IMAGE1D / IIMAGE1D / UIMAGE1D / IMAGE2D / IIMAGE2D / UIMAGE2D / IMAGE3D
  / IIMAGE3D / UIMAGE3D / IMAGE2DRECT / IIMAGE2DRECT / UIMAGE2DRECT / IMAGECUBE
  / IIMAGECUBE / UIMAGECUBE / IMAGEBUFFER / IIMAGEBUFFER / UIMAGEBUFFER
  / IMAGE1DARRAY / IIMAGE1DARRAY / UIMAGE1DARRAY / IMAGE2DARRAY / IIMAGE2DARRAY
  / UIMAGE2DARRAY / IMAGECUBEARRAY / IIMAGECUBEARRAY / UIMAGECUBEARRAY
  / IMAGE2DMS / IIMAGE2DMS / UIMAGE2DMS / IMAGE2DMSARRAY / IIMAGE2DMSARRAY
  / UIMAGE2DMSARRAY / struct_specifier / SUBROUTINE_TYPE_NAME

precision_qualifier = HIGH_PRECISION / MEDIUM_PRECISION / LOW_PRECISION

struct_specifier
  = struct:STRUCT identifier:IDENTIFIER? lb:LEFT_BRACE body:struct_declaration_list rb:RIGHT_BRACE {
    return node('struct', [], { lb, body, rb, struct, identifier })
  }

struct_declaration_list = (declaration:struct_declaration semi:SEMICOLON {
    return node('struct_stmt', [], { declaration, semi });
  })+

struct_declaration
  = specified_type:fully_specified_type
    field_declarator:quantified_identifier
    tail:(
      op:COMMA expr:quantified_identifier
    )* {
      const struct_declarator = node('struct_declarator', [], { ...specified_type, ...field_declarator });

      // TODO: You removed suffix() from the tail, verify this works
      return leftAssociate(struct_declarator, tail);
    }

quantified_identifier
  = identifier:IDENTIFIER quantifier:array_specifier? {
    return { identifier, quantifier };
  }

initializer
  = assignment_expression
  // TODO What are these cases - when do I need to handle them?
  / LEFT_BRACE initializer_list RIGHT_BRACE
  / LEFT_BRACE initializer_list COMMA RIGHT_BRACE

initializer_list
  = initializer (COMMA initializer)*

statement
  = compound_statement
  / simple_statement

// All of these should end in SEMICOLON if they expect them
simple_statement
  = jump_statement // Moved up to let "continue", etc, get picked up first
  / declaration_statement
  / expression_statement
  / if_statement
  / switch_statement
  / case_label
  / iteration_statement

// { block of statements }
compound_statement = lb:LEFT_BRACE statements:statement_list? rb:RIGHT_BRACE {
  return node('compound_statement', (statements || []).flat(), { lb, rb });
}

// Keeping this no-new-scope rule as it could be a useful hint to the compiler
compound_statement_no_new_scope = compound_statement

statement_no_new_scope
  = compound_statement_no_new_scope / simple_statement

statement_list = (statement / preprocessor)+

expression_statement = expression:expression? semi:SEMICOLON {
  return node('expression_statement', [], { expression, semi });
}

// Note: The grammar calls this "if statement"
if_statement
  = ifSymbol:IF lp:LEFT_PAREN condition:expression rp:RIGHT_PAREN tail:(
      statement (ELSE statement)?
    ) {
      const [body, elseBranch] = tail;
      return node(
        'if_statement',
        [],
        {
          'if': ifSymbol,
          body,
          lp,
          condition,
          rp,
          ...elseBranch && { 'else': elseBranch.flat() },
        });
  }

switch_statement
  = switchSymbol:SWITCH
    lp:LEFT_PAREN
    expression:expression
    rp:RIGHT_PAREN
    lb:LEFT_BRACE
    statements:statement_list
    rb:RIGHT_BRACE {
      return node(
        'switch_statement',
        [],
        {
          switch: switchSymbol,
          lp,
          expression,
          rp,
          lb,
          cases: groupCases(statements),
          rb
        }
      );
    }

case_label
  = caseSymbol:CASE test:expression colon:COLON {
    return node('case_label', [], { 'case': caseSymbol, test, colon });
  }
  / defaultSymbol:DEFAULT colon:COLON {
    return node('default_label', [], { default: defaultSymbol, colon });
  }

iteration_statement
  = whileSymbol:WHILE
    lp:LEFT_PAREN
    condition:condition
    rp:RIGHT_PAREN
    body:statement_no_new_scope {
      return node(
        'while_statement',
        [],
        {
          while: whileSymbol,
          lp,
          condition,
          rp,
          body
        }
      );
    }
  / doSymbol:DO
    body:statement
    whileSymbol:WHILE
    lp:LEFT_PAREN
    expression:expression
    rp:RIGHT_PAREN
    semi:SEMICOLON {
      return node(
        'do_statement',
        [],
        {
          do: doSymbol,
          body,
          while: whileSymbol,
          lp,
          expression,
          rp,
          semi
        }
      );
    }
  / forSymbol:FOR
    lp:LEFT_PAREN
    init:(
      expression? SEMICOLON /
      declaration SEMICOLON
    )?
    condition:condition?
    conditionSemi:SEMICOLON
    operation:expression?
    rp:RIGHT_PAREN
    body:statement_no_new_scope {
      return node(
        'for_statement',
        [],
        {
          'for': forSymbol,
          body,
          lp,
          init: init[0],
          initSemi: init[1],
          condition,
          conditionSemi,
          operation,
          rp,
          body
        }
      );
    }

condition
  // A condition is used in a for loop middle case, and also a while loop (but
  // not a do-while loop). I don't think this case is valid for either? An
  // expression makes sense
  = specified_type:fully_specified_type identifier:IDENTIFIER op:EQUAL initializer:initializer {
      const declarator = node('declarator', [], { ...specified_type, identifier });
      return node(op.type, [declarator, op, initializer])
  }
  / expression

jump_statement "jump statement"
  = jump:CONTINUE semi:SEMICOLON {
    return node('continue_statement', [], { continue: jump, semi });
  }
  / jump:BREAK semi:SEMICOLON {
    return node('break_statement', [], { break: jump, semi });
  }
  / jump:RETURN expression:expression? semi:SEMICOLON {
    return node('return_statement', [], { return: jump, expression, semi });
  }
  / jump:DISCARD semi:SEMICOLON { // Fragment shader only.
    return node('discard_statement', [], { discard: jump, semi });
  }

// TODO: This allows shaders with preprocessors to be parsed, and puts the
// preprocessor line in the AST. Do I want to do this, or do I want to
// always preprocess shaders before parsing? Not preprocessing will likely
// break the ability to parse if there is wacky define using
preprocessor = line:$('#' [^\n]*) _:_? { return node('preprocessor', [], { line, _ }); }

// Translation unit is start of grammar
translation_unit = (external_declaration / preprocessor)+

external_declaration
  = function_definition / declaration_statement

function_definition = prototype:function_prototype body:compound_statement_no_new_scope {
  return node('function', body, { prototype });
}

// The whitespace is optional so that we can put comments immediately after
// terminals, like void/* comment */
// The ending whitespace is so that linebreaks can happen after comments
_ "whitespace" = w:whitespace? rest:(comment whitespace?)* { return collapse(w, rest); }

comment
  = single_comment
  // Intention is to handle any type of comment case. A multiline comment
  // can be followed by more multiline comments, or a single comment, and
  // collapse everything into one array
  / a:multiline_comment d:(
    x:whitespace cc:comment { return xnil(x, cc); }
  )* { return xnil(a, d.flat()); }

single_comment = $('//' [^\n]*)
multiline_comment = $("/*" inner:(!"*/" i:. { return i; })* "*/")

whitespace
  = $[ \t\n\r]+

// A terminal node is something like "void" with optional whitespace and/or
// comments after it. By convention whitespace is stored as children of
// terminals in the AST.
// We need to avoid the case of "voidsomething" hence the negative lookahead
terminal = ![A-Za-z_0-9] _:_? { return _; }