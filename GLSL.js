// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const makeGenerator = (generators)=>{
    const gen = (ast)=>typeof ast === 'string' ? ast : ast === null || ast === undefined ? '' : Array.isArray(ast) ? ast.map(gen).join('') : ast.type in generators ? generators[ast.type](ast) : `NO GENERATOR FOR ${ast.type}` + ast;
    return gen;
};
const makeEveryOtherGenerator = (generate)=>{
    const everyOther = (nodes, eo)=>nodes.reduce((output, node, index)=>output + generate(node) + (index === nodes.length - 1 ? '' : generate(eo[index])), '');
    return everyOther;
};
const generators = {
    program: (node)=>generate(node.wsStart) + generate(node.program),
    preprocessor: (node)=>generate(node.line) + generate(node._),
    keyword: (node)=>generate(node.token) + generate(node.whitespace),
    precision: (node)=>generate(node.prefix) + generate(node.qualifier) + generate(node.specifier),
    expression_statement: (node)=>generate(node.expression) + generate(node.semi),
    if_statement: (node)=>generate(node.if) + generate(node.lp) + generate(node.condition) + generate(node.rp) + generate(node.body) + generate(node.else),
    switch_statement: (node)=>generate(node.switch) + generate(node.lp) + generate(node.expression) + generate(node.rp) + generate(node.lb) + generate(node.cases) + generate(node.rb),
    break_statement: (node)=>generate(node.break) + generate(node.semi),
    do_statement: (node)=>generate(node.do) + generate(node.body) + generate(node.while) + generate(node.lp) + generate(node.expression) + generate(node.rp) + generate(node.semi),
    continue_statement: (node)=>generate(node.continue) + generate(node.semi),
    return_statement: (node)=>generate(node.return) + generate(node.expression) + generate(node.semi),
    discard_statement: (node)=>generate(node.discard) + generate(node.semi),
    while_statement: (node)=>generate(node.while) + generate(node.lp) + generate(node.condition) + generate(node.rp) + generate(node.body),
    for_statement: (node)=>generate(node.for) + generate(node.lp) + generate(node.init) + generate(node.initSemi) + generate(node.condition) + generate(node.conditionSemi) + generate(node.operation) + generate(node.rp) + generate(node.body),
    condition_expression: (node)=>generate(node.specified_type) + generate(node.identifier) + generate(node.operator) + generate(node.initializer),
    declaration_statement: (node)=>generate(node.declaration) + generate(node.semi),
    fully_specified_type: (node)=>generate(node.qualifiers) + generate(node.specifier),
    layout_qualifier: (node)=>generate(node.layout) + generate(node.lp) + generateWithEveryOther(node.qualifiers, node.commas) + generate(node.rp),
    layout_qualifier_id: (node)=>generate(node.identifier) + generate(node.operator) + generate(node.expression),
    switch_case: (node)=>generate(node.case) + generate(node.test) + generate(node.colon) + generate(node.statements),
    default_case: (node)=>generate(node.default) + generate(node.colon) + generate(node.statements),
    declaration: (node)=>generate(node.identifier) + generate(node.quantifier) + generate(node.operator) + generate(node.initializer),
    declarator_list: (node)=>generate(node.specified_type) + generateWithEveryOther(node.declarations, node.commas),
    type_specifier: (node)=>generate(node.specifier) + generate(node.quantifier),
    array_specifiers: (node)=>generate(node.specifiers),
    array_specifier: (node)=>generate(node.lb) + generate(node.expression) + generate(node.rb),
    identifier: (node)=>node.identifier + generate(node.whitespace),
    function_header: (node)=>generate(node.returnType) + generate(node.name) + generate(node.lp),
    function_prototype: (node)=>generate(node.header.returnType) + generate(node.header.name) + generate(node.header.lp) + (node.parameters ? generateWithEveryOther(node.parameters, node.commas) : '') + generate(node.rp),
    parameter_declaration: (node)=>generate(node.qualifier) + generate(node.declaration),
    compound_statement: (node)=>generate(node.lb) + generate(node.statements) + generate(node.rb),
    function: (node)=>generate(node['prototype']) + generate(node.body),
    function_call: (node)=>generate(node.identifier) + generate(node.lp) + generate(node.args) + generate(node.rp),
    parameter_declarator: (node)=>generate(node.specifier) + generate(node.identifier) + generate(node.quantifier),
    postfix: (node)=>generate(node.expression) + generate(node.postfix),
    quantifier: (node)=>generate(node.lb) + generate(node.expression) + generate(node.rb),
    quantified_identifier: (node)=>generate(node.identifier) + generate(node.quantifier),
    field_selection: (node)=>generate(node.dot) + generate(node.selection),
    subroutine_qualifier: (node)=>generate(node.subroutine) + generate(node.lp) + generate(node.type_names) + generate(node.commas) + generate(node.rp),
    assignment: (node)=>generate(node.left) + generate(node.operator) + generate(node.right),
    ternary: (node)=>generate(node.expression) + generate(node.question) + generate(node.left) + generate(node.colon) + generate(node.right),
    binary: (node)=>generate(node.left) + generate(node.operator) + generate(node.right),
    group: (node)=>generate(node.lp) + generate(node.expression) + generate(node.rp),
    unary: (node)=>generate(node.operator) + generate(node.expression),
    float_constant: (node)=>generate(node.token) + generate(node.whitespace),
    double_constant: (node)=>generate(node.token) + generate(node.whitespace),
    int_constant: (node)=>generate(node.token) + generate(node.whitespace),
    uint_constant: (node)=>generate(node.token) + generate(node.whitespace),
    bool_constant: (node)=>generate(node.token) + generate(node.whitespace),
    literal: (node)=>generate(node.literal) + generate(node.whitespace),
    struct: (node)=>generate(node.struct) + generate(node.typeName) + generate(node.lb) + generate(node.declarations) + generate(node.rb),
    struct_declaration: (node)=>generate(node.declaration) + generate(node.semi),
    interface_declarator: (node)=>generate(node.qualifiers) + generate(node.interface_type) + generate(node.lp) + generate(node.declarations) + generate(node.rp) + generate(node.identifier),
    struct_declarator: (node)=>generate(node.specified_type) + generateWithEveryOther(node.declarations, node.commas),
    initializer_list: (node)=>generate(node.lb) + generateWithEveryOther(node.initializers, node.commas) + generate(node.rb),
    qualifier_declarator: (node)=>generate(node.qualifiers) + generateWithEveryOther(node.declarations, node.commas)
};
const generate = makeGenerator(generators);
const generateWithEveryOther = makeEveryOtherGenerator(generate);
const OPEN_CURLY = String.fromCharCode(123);
const addTypes = (scope, ...types)=>{
    types.forEach(([identifier, type])=>{
        scope.types[identifier] = {
            references: [
                type
            ]
        };
    });
};
const addTypeReference = (scope, name, reference)=>{
    scope.types[name].references.push(reference);
};
const findTypeScope = (scope, typeName)=>{
    if (!scope) {
        return null;
    }
    if (typeName in scope.types) {
        return scope;
    }
    return findTypeScope(scope.parent, typeName);
};
const isDeclaredType = (scope, typeName)=>findTypeScope(scope, typeName) !== null;
const createBindings = (scope, ...bindings)=>{
    bindings.forEach(([identifier, binding])=>{
        const newBinding = scope.bindings[identifier] || {
            references: []
        };
        newBinding.initializer = binding;
        newBinding.references.unshift(binding);
        scope.bindings[identifier] = newBinding;
    });
};
const addBindingReference = (scope, name, reference)=>{
    const foundScope = findBindingScope(scope, name);
    if (foundScope) {
        foundScope.bindings[name].references.push(reference);
    } else {
        createBindings(scope, [
            name,
            reference
        ]);
    }
};
const findBindingScope = (scope, name)=>{
    if (!scope) {
        return null;
    }
    if (name in scope.bindings) {
        return scope;
    }
    return findBindingScope(scope.parent, name);
};
const createFunction = (scope, name, declaration)=>{
    scope.functions[name] = {
        references: [
            declaration
        ]
    };
};
const addFunctionReference = (scope, name, reference)=>{
    const global = findGlobalScope(scope);
    if (name in global.functions) {
        global.functions[name].references.push(reference);
    } else {
        createFunction(global, name, reference);
    }
};
const findGlobalScope = (scope)=>scope.parent ? findGlobalScope(scope.parent) : scope;
const isDeclaredFunction = (scope, fnName)=>fnName in findGlobalScope(scope).functions;
const partial = (typeNameOrAttrs, attrs)=>({
        partial: attrs === undefined ? typeNameOrAttrs : {
            type: typeNameOrAttrs,
            ...attrs
        }
    });
const xnil = (...args)=>args.flat().filter((e)=>e !== undefined && e !== null && e !== '' && e.length !== 0);
const ifOnly = (arr)=>arr.length > 1 ? arr : arr[0];
const collapse = (...args)=>ifOnly(xnil(args));
const leftAssociate = (...nodes)=>nodes.flat().reduce((current, [operator, expr])=>({
            type: 'binary',
            operator,
            left: current,
            right: expr
        }));
const builtIns = new Set([
    'abs',
    'acos',
    'acosh',
    'all',
    'any',
    'asin',
    'asinh',
    'atan',
    'atanh',
    'atomicAdd',
    'atomicAnd',
    'atomicCompSwap',
    'atomicCounter',
    'atomicCounterDecrement',
    'atomicCounterIncrement',
    'atomicExchange',
    'atomicMax',
    'atomicMin',
    'atomicOr',
    'atomicXor',
    'barrier',
    'bitCount',
    'bitfieldExtract',
    'bitfieldInsert',
    'bitfieldReverse',
    'ceil',
    'clamp',
    'cos',
    'cosh',
    'cross',
    'degrees',
    'determinant',
    'dFdx',
    'dFdxCoarse',
    'dFdxFine',
    'dFdy',
    'dFdyCoarse',
    'dFdyFine',
    'distance',
    'dot',
    'EmitStreamVertex',
    'EmitVertex',
    'EndPrimitive',
    'EndStreamPrimitive',
    'equal',
    'exp',
    'exp2',
    'faceforward',
    'findLSB',
    'findMSB',
    'floatBitsToInt',
    'floatBitsToUint',
    'floor',
    'fma',
    'fract',
    'frexp',
    'fwidth',
    'fwidthCoarse',
    'fwidthFine',
    'greaterThan',
    'greaterThanEqual',
    'groupMemoryBarrier',
    'imageAtomicAdd',
    'imageAtomicAnd',
    'imageAtomicCompSwap',
    'imageAtomicExchange',
    'imageAtomicMax',
    'imageAtomicMin',
    'imageAtomicOr',
    'imageAtomicXor',
    'imageLoad',
    'imageSamples',
    'imageSize',
    'imageStore',
    'imulExtended',
    'intBitsToFloat',
    'interpolateAtCentroid',
    'interpolateAtOffset',
    'interpolateAtSample',
    'inverse',
    'inversesqrt',
    'isinf',
    'isnan',
    'ldexp',
    'length',
    'lessThan',
    'lessThanEqual',
    'log',
    'log2',
    'matrixCompMult',
    'max',
    'memoryBarrier',
    'memoryBarrierAtomicCounter',
    'memoryBarrierBuffer',
    'memoryBarrierImage',
    'memoryBarrierShared',
    'min',
    'mix',
    'mod',
    'modf',
    'noise',
    'noise1',
    'noise2',
    'noise3',
    'noise4',
    'normalize',
    'not',
    'notEqual',
    'outerProduct',
    'packDouble2x32',
    'packHalf2x16',
    'packSnorm2x16',
    'packSnorm4x8',
    'packUnorm',
    'packUnorm2x16',
    'packUnorm4x8',
    'pow',
    'radians',
    'reflect',
    'refract',
    'round',
    'roundEven',
    'sign',
    'sin',
    'sinh',
    'smoothstep',
    'sqrt',
    'step',
    'tan',
    'tanh',
    'texelFetch',
    'texelFetchOffset',
    'texture',
    'textureGather',
    'textureGatherOffset',
    'textureGatherOffsets',
    'textureGrad',
    'textureGradOffset',
    'textureLod',
    'textureLodOffset',
    'textureOffset',
    'textureProj',
    'textureProjGrad',
    'textureProjGradOffset',
    'textureProjLod',
    'textureProjLodOffset',
    'textureProjOffset',
    'textureQueryLevels',
    'textureQueryLod',
    'textureSamples',
    'textureSize',
    'transpose',
    'trunc',
    'uaddCarry',
    'uintBitsToFloat',
    'umulExtended',
    'unpackDouble2x32',
    'unpackHalf2x16',
    'unpackSnorm2x16',
    'unpackSnorm4x8',
    'unpackUnorm',
    'unpackUnorm2x16',
    'unpackUnorm4x8',
    'usubBorrow',
    'texture2D',
    'textureCube'
]);
function peg$subclass(child, parent) {
    function C() {
        this.constructor = child;
    }
    C.prototype = parent.prototype;
    child.prototype = new C();
}
function peg$SyntaxError(message, expected, found, location) {
    var self = Error.call(this, message);
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(self, peg$SyntaxError.prototype);
    }
    self.expected = expected;
    self.found = found;
    self.location = location;
    self.name = "SyntaxError";
    return self;
}
peg$subclass(peg$SyntaxError, Error);
function peg$padEnd(str, targetLength, padString) {
    padString = padString || " ";
    if (str.length > targetLength) {
        return str;
    }
    targetLength -= str.length;
    padString += padString.repeat(targetLength);
    return str + padString.slice(0, targetLength);
}
peg$SyntaxError.prototype.format = function(sources) {
    var str = "Error: " + this.message;
    if (this.location) {
        var src = null;
        var k;
        for(k = 0; k < sources.length; k++){
            if (sources[k].source === this.location.source) {
                src = sources[k].text.split(/\r\n|\n|\r/g);
                break;
            }
        }
        var s = this.location.start;
        var offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
        var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
        if (src) {
            var e = this.location.end;
            var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
            var line = src[s.line - 1];
            var last = s.line === e.line ? e.column : line.length + 1;
            var hatLen = last - s.column || 1;
            str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + peg$padEnd("", s.column - 1, ' ') + peg$padEnd("", hatLen, "^");
        } else {
            str += "\n at " + loc;
        }
    }
    return str;
};
peg$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
            return "\"" + literalEscape(expectation.text) + "\"";
        },
        class: function(expectation) {
            var escapedParts = expectation.parts.map(function(part) {
                return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
            });
            return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
        },
        any: function() {
            return "any character";
        },
        end: function() {
            return "end of input";
        },
        other: function(expectation) {
            return expectation.description;
        }
    };
    function hex(ch) {
        return ch.charCodeAt(0).toString(16).toUpperCase();
    }
    function literalEscape(s) {
        return s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
            return "\\x0" + hex(ch);
        }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
            return "\\x" + hex(ch);
        });
    }
    function classEscape(s) {
        return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
            return "\\x0" + hex(ch);
        }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
            return "\\x" + hex(ch);
        });
    }
    function describeExpectation(expectation) {
        return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected) {
        var descriptions = expected.map(describeExpectation);
        var i, j;
        descriptions.sort();
        if (descriptions.length > 0) {
            for(i = 1, j = 1; i < descriptions.length; i++){
                if (descriptions[i - 1] !== descriptions[i]) {
                    descriptions[j] = descriptions[i];
                    j++;
                }
            }
            descriptions.length = j;
        }
        switch(descriptions.length){
            case 1:
                return descriptions[0];
            case 2:
                return descriptions[0] + " or " + descriptions[1];
            default:
                return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
        }
    }
    function describeFound(found) {
        return found ? "\"" + literalEscape(found) + "\"" : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};
function peg$parse(input, options) {
    options = options !== undefined ? options : {};
    var peg$FAILED = {};
    var peg$source = options.grammarSource;
    var peg$startRuleFunctions = {
        start: peg$parsestart
    };
    var peg$startRuleFunction = peg$parsestart;
    var peg$c0 = "attribute";
    var peg$c1 = "varying";
    var peg$c2 = "const";
    var peg$c3 = "bool";
    var peg$c4 = "float";
    var peg$c5 = "double";
    var peg$c6 = "int";
    var peg$c7 = "uint";
    var peg$c8 = "break";
    var peg$c9 = "continue";
    var peg$c10 = "do";
    var peg$c11 = "else";
    var peg$c12 = "for";
    var peg$c13 = "if";
    var peg$c14 = "discard";
    var peg$c15 = "return";
    var peg$c16 = "switch";
    var peg$c17 = "case";
    var peg$c18 = "default";
    var peg$c19 = "subroutine";
    var peg$c20 = "bvec2";
    var peg$c21 = "bvec3";
    var peg$c22 = "bvec4";
    var peg$c23 = "ivec2";
    var peg$c24 = "ivec3";
    var peg$c25 = "ivec4";
    var peg$c26 = "uvec2";
    var peg$c27 = "uvec3";
    var peg$c28 = "uvec4";
    var peg$c29 = "vec2";
    var peg$c30 = "vec3";
    var peg$c31 = "vec4";
    var peg$c32 = "mat2";
    var peg$c33 = "mat3";
    var peg$c34 = "mat4";
    var peg$c35 = "centroid";
    var peg$c36 = "in";
    var peg$c37 = "out";
    var peg$c38 = "inout";
    var peg$c39 = "uniform";
    var peg$c40 = "patch";
    var peg$c41 = "sample";
    var peg$c42 = "buffer";
    var peg$c43 = "shared";
    var peg$c44 = "coherent";
    var peg$c45 = "volatile";
    var peg$c46 = "restrict";
    var peg$c47 = "readonly";
    var peg$c48 = "writeonly";
    var peg$c49 = "dvec2";
    var peg$c50 = "dvec3";
    var peg$c51 = "dvec4";
    var peg$c52 = "dmat2";
    var peg$c53 = "dmat3";
    var peg$c54 = "dmat4";
    var peg$c55 = "noperspective";
    var peg$c56 = "flat";
    var peg$c57 = "smooth";
    var peg$c58 = "layout";
    var peg$c59 = "mat2x2";
    var peg$c60 = "mat2x3";
    var peg$c61 = "mat2x4";
    var peg$c62 = "mat3x2";
    var peg$c63 = "mat3x3";
    var peg$c64 = "mat3x4";
    var peg$c65 = "mat4x2";
    var peg$c66 = "mat4x3";
    var peg$c67 = "mat4x4";
    var peg$c68 = "dmat2x2";
    var peg$c69 = "dmat2x3";
    var peg$c70 = "dmat2x4";
    var peg$c71 = "dmat3x2";
    var peg$c72 = "dmat3x3";
    var peg$c73 = "dmat3x4";
    var peg$c74 = "dmat4x2";
    var peg$c75 = "dmat4x3";
    var peg$c76 = "dmat4x4";
    var peg$c77 = "atomic_uint";
    var peg$c78 = "sampler1D";
    var peg$c79 = "sampler2D";
    var peg$c80 = "sampler3D";
    var peg$c81 = "samplerCube";
    var peg$c82 = "sampler1DShadow";
    var peg$c83 = "sampler2DShadow";
    var peg$c84 = "samplerCubeShadow";
    var peg$c85 = "sampler1DArray";
    var peg$c86 = "sampler2DArray";
    var peg$c87 = "sampler1DArrayShadow";
    var peg$c88 = "sampler2DArrayshadow";
    var peg$c89 = "isampler1D";
    var peg$c90 = "isampler2D";
    var peg$c91 = "isampler3D";
    var peg$c92 = "isamplerCube";
    var peg$c93 = "isampler1Darray";
    var peg$c94 = "isampler2DArray";
    var peg$c95 = "usampler1D";
    var peg$c96 = "usampler2D";
    var peg$c97 = "usampler3D";
    var peg$c98 = "usamplerCube";
    var peg$c99 = "usampler1DArray";
    var peg$c100 = "usampler2DArray";
    var peg$c101 = "sampler2DRect";
    var peg$c102 = "sampler2DRectshadow";
    var peg$c103 = "isampler2DRect";
    var peg$c104 = "usampler2DRect";
    var peg$c105 = "samplerBuffer";
    var peg$c106 = "isamplerBuffer";
    var peg$c107 = "usamplerBuffer";
    var peg$c108 = "samplerCubeArray";
    var peg$c109 = "samplerCubeArrayShadow";
    var peg$c110 = "isamplerCubeArray";
    var peg$c111 = "usamplerCubeArray";
    var peg$c112 = "sampler2DMS";
    var peg$c113 = "isampler2DMS";
    var peg$c114 = "usampler2DMS";
    var peg$c115 = "sampler2DMSArray";
    var peg$c116 = "isampler2DMSArray";
    var peg$c117 = "usampler2DMSArray";
    var peg$c118 = "image1D";
    var peg$c119 = "iimage1D";
    var peg$c120 = "uimage1D";
    var peg$c121 = "image2D";
    var peg$c122 = "iimage2D";
    var peg$c123 = "uimage2D";
    var peg$c124 = "image3D";
    var peg$c125 = "iimage3D";
    var peg$c126 = "uimage3D";
    var peg$c127 = "image2DRect";
    var peg$c128 = "iimage2DRect";
    var peg$c129 = "uimage2DRect";
    var peg$c130 = "imageCube";
    var peg$c131 = "iimageCube";
    var peg$c132 = "uimageCube";
    var peg$c133 = "imageBuffer";
    var peg$c134 = "iimageBuffer";
    var peg$c135 = "uimageBuffer";
    var peg$c136 = "image1DArray";
    var peg$c137 = "iimage1DArray";
    var peg$c138 = "uimage1DArray";
    var peg$c139 = "image2DArray";
    var peg$c140 = "iimage2DArray";
    var peg$c141 = "uimage2DArray";
    var peg$c142 = "imageCubeArray";
    var peg$c143 = "iimageCubeArray";
    var peg$c144 = "uimageCubeArray";
    var peg$c145 = "image2DMS";
    var peg$c146 = "iimage2DMS";
    var peg$c147 = "uimage2DMS";
    var peg$c148 = "image2DMArray";
    var peg$c149 = "iimage2DMSArray";
    var peg$c150 = "uimage2DMSArray";
    var peg$c151 = "struct";
    var peg$c152 = "void";
    var peg$c153 = "while";
    var peg$c154 = "invariant";
    var peg$c155 = "precise";
    var peg$c156 = "highp";
    var peg$c157 = "mediump";
    var peg$c158 = "lowp";
    var peg$c159 = "precision";
    var peg$c160 = "true";
    var peg$c161 = "false";
    var peg$c162 = "<<";
    var peg$c163 = ">>";
    var peg$c164 = "++";
    var peg$c165 = "--";
    var peg$c166 = "<=";
    var peg$c167 = ">=";
    var peg$c168 = "==";
    var peg$c169 = "!=";
    var peg$c170 = "&&";
    var peg$c171 = "||";
    var peg$c172 = "^^";
    var peg$c173 = "*=";
    var peg$c174 = "/=";
    var peg$c175 = "+=";
    var peg$c176 = "%=";
    var peg$c177 = "<<=";
    var peg$c178 = ">>=";
    var peg$c179 = "&=";
    var peg$c180 = "^=";
    var peg$c181 = "|=";
    var peg$c182 = "-=";
    var peg$c183 = "(";
    var peg$c184 = ")";
    var peg$c185 = "[";
    var peg$c186 = "]";
    var peg$c187 = "{";
    var peg$c188 = "}";
    var peg$c189 = ".";
    var peg$c190 = ",";
    var peg$c191 = ":";
    var peg$c192 = "=";
    var peg$c193 = ";";
    var peg$c194 = "!";
    var peg$c195 = "-";
    var peg$c196 = "~";
    var peg$c197 = "+";
    var peg$c198 = "*";
    var peg$c199 = "/";
    var peg$c200 = "%";
    var peg$c201 = "<";
    var peg$c202 = ">";
    var peg$c203 = "|";
    var peg$c204 = "^";
    var peg$c205 = "&";
    var peg$c206 = "?";
    var peg$c207 = "0";
    var peg$c208 = "lf";
    var peg$c209 = "LF";
    var peg$c210 = "#";
    var peg$c211 = "//";
    var peg$c212 = "/*";
    var peg$c213 = "*/";
    var peg$r0 = /^[A-Za-z_]/;
    var peg$r1 = /^[A-Za-z_0-9]/;
    var peg$r2 = /^[uU]/;
    var peg$r3 = /^[1-9]/;
    var peg$r4 = /^[0-7]/;
    var peg$r5 = /^[xX]/;
    var peg$r6 = /^[0-9a-fA-F]/;
    var peg$r7 = /^[0-9]/;
    var peg$r8 = /^[eE]/;
    var peg$r9 = /^[+\-]/;
    var peg$r10 = /^[fF]/;
    var peg$r11 = /^[^\n]/;
    var peg$r12 = /^[ \t\n\r]/;
    var peg$e0 = peg$literalExpectation("attribute", false);
    var peg$e1 = peg$literalExpectation("varying", false);
    var peg$e2 = peg$literalExpectation("const", false);
    var peg$e3 = peg$literalExpectation("bool", false);
    var peg$e4 = peg$literalExpectation("float", false);
    var peg$e5 = peg$literalExpectation("double", false);
    var peg$e6 = peg$literalExpectation("int", false);
    var peg$e7 = peg$literalExpectation("uint", false);
    var peg$e8 = peg$literalExpectation("break", false);
    var peg$e9 = peg$literalExpectation("continue", false);
    var peg$e10 = peg$literalExpectation("do", false);
    var peg$e11 = peg$literalExpectation("else", false);
    var peg$e12 = peg$literalExpectation("for", false);
    var peg$e13 = peg$literalExpectation("if", false);
    var peg$e14 = peg$literalExpectation("discard", false);
    var peg$e15 = peg$literalExpectation("return", false);
    var peg$e16 = peg$literalExpectation("switch", false);
    var peg$e17 = peg$literalExpectation("case", false);
    var peg$e18 = peg$literalExpectation("default", false);
    var peg$e19 = peg$literalExpectation("subroutine", false);
    var peg$e20 = peg$literalExpectation("bvec2", false);
    var peg$e21 = peg$literalExpectation("bvec3", false);
    var peg$e22 = peg$literalExpectation("bvec4", false);
    var peg$e23 = peg$literalExpectation("ivec2", false);
    var peg$e24 = peg$literalExpectation("ivec3", false);
    var peg$e25 = peg$literalExpectation("ivec4", false);
    var peg$e26 = peg$literalExpectation("uvec2", false);
    var peg$e27 = peg$literalExpectation("uvec3", false);
    var peg$e28 = peg$literalExpectation("uvec4", false);
    var peg$e29 = peg$literalExpectation("vec2", false);
    var peg$e30 = peg$literalExpectation("vec3", false);
    var peg$e31 = peg$literalExpectation("vec4", false);
    var peg$e32 = peg$literalExpectation("mat2", false);
    var peg$e33 = peg$literalExpectation("mat3", false);
    var peg$e34 = peg$literalExpectation("mat4", false);
    var peg$e35 = peg$literalExpectation("centroid", false);
    var peg$e36 = peg$literalExpectation("in", false);
    var peg$e37 = peg$literalExpectation("out", false);
    var peg$e38 = peg$literalExpectation("inout", false);
    var peg$e39 = peg$literalExpectation("uniform", false);
    var peg$e40 = peg$literalExpectation("patch", false);
    var peg$e41 = peg$literalExpectation("sample", false);
    var peg$e42 = peg$literalExpectation("buffer", false);
    var peg$e43 = peg$literalExpectation("shared", false);
    var peg$e44 = peg$literalExpectation("coherent", false);
    var peg$e45 = peg$literalExpectation("volatile", false);
    var peg$e46 = peg$literalExpectation("restrict", false);
    var peg$e47 = peg$literalExpectation("readonly", false);
    var peg$e48 = peg$literalExpectation("writeonly", false);
    var peg$e49 = peg$literalExpectation("dvec2", false);
    var peg$e50 = peg$literalExpectation("dvec3", false);
    var peg$e51 = peg$literalExpectation("dvec4", false);
    var peg$e52 = peg$literalExpectation("dmat2", false);
    var peg$e53 = peg$literalExpectation("dmat3", false);
    var peg$e54 = peg$literalExpectation("dmat4", false);
    var peg$e55 = peg$literalExpectation("noperspective", false);
    var peg$e56 = peg$literalExpectation("flat", false);
    var peg$e57 = peg$literalExpectation("smooth", false);
    var peg$e58 = peg$literalExpectation("layout", false);
    var peg$e59 = peg$literalExpectation("mat2x2", false);
    var peg$e60 = peg$literalExpectation("mat2x3", false);
    var peg$e61 = peg$literalExpectation("mat2x4", false);
    var peg$e62 = peg$literalExpectation("mat3x2", false);
    var peg$e63 = peg$literalExpectation("mat3x3", false);
    var peg$e64 = peg$literalExpectation("mat3x4", false);
    var peg$e65 = peg$literalExpectation("mat4x2", false);
    var peg$e66 = peg$literalExpectation("mat4x3", false);
    var peg$e67 = peg$literalExpectation("mat4x4", false);
    var peg$e68 = peg$literalExpectation("dmat2x2", false);
    var peg$e69 = peg$literalExpectation("dmat2x3", false);
    var peg$e70 = peg$literalExpectation("dmat2x4", false);
    var peg$e71 = peg$literalExpectation("dmat3x2", false);
    var peg$e72 = peg$literalExpectation("dmat3x3", false);
    var peg$e73 = peg$literalExpectation("dmat3x4", false);
    var peg$e74 = peg$literalExpectation("dmat4x2", false);
    var peg$e75 = peg$literalExpectation("dmat4x3", false);
    var peg$e76 = peg$literalExpectation("dmat4x4", false);
    var peg$e77 = peg$literalExpectation("atomic_uint", false);
    var peg$e78 = peg$literalExpectation("sampler1D", false);
    var peg$e79 = peg$literalExpectation("sampler2D", false);
    var peg$e80 = peg$literalExpectation("sampler3D", false);
    var peg$e81 = peg$literalExpectation("samplerCube", false);
    var peg$e82 = peg$literalExpectation("sampler1DShadow", false);
    var peg$e83 = peg$literalExpectation("sampler2DShadow", false);
    var peg$e84 = peg$literalExpectation("samplerCubeShadow", false);
    var peg$e85 = peg$literalExpectation("sampler1DArray", false);
    var peg$e86 = peg$literalExpectation("sampler2DArray", false);
    var peg$e87 = peg$literalExpectation("sampler1DArrayShadow", false);
    var peg$e88 = peg$literalExpectation("sampler2DArrayshadow", false);
    var peg$e89 = peg$literalExpectation("isampler1D", false);
    var peg$e90 = peg$literalExpectation("isampler2D", false);
    var peg$e91 = peg$literalExpectation("isampler3D", false);
    var peg$e92 = peg$literalExpectation("isamplerCube", false);
    var peg$e93 = peg$literalExpectation("isampler1Darray", false);
    var peg$e94 = peg$literalExpectation("isampler2DArray", false);
    var peg$e95 = peg$literalExpectation("usampler1D", false);
    var peg$e96 = peg$literalExpectation("usampler2D", false);
    var peg$e97 = peg$literalExpectation("usampler3D", false);
    var peg$e98 = peg$literalExpectation("usamplerCube", false);
    var peg$e99 = peg$literalExpectation("usampler1DArray", false);
    var peg$e100 = peg$literalExpectation("usampler2DArray", false);
    var peg$e101 = peg$literalExpectation("sampler2DRect", false);
    var peg$e102 = peg$literalExpectation("sampler2DRectshadow", false);
    var peg$e103 = peg$literalExpectation("isampler2DRect", false);
    var peg$e104 = peg$literalExpectation("usampler2DRect", false);
    var peg$e105 = peg$literalExpectation("samplerBuffer", false);
    var peg$e106 = peg$literalExpectation("isamplerBuffer", false);
    var peg$e107 = peg$literalExpectation("usamplerBuffer", false);
    var peg$e108 = peg$literalExpectation("samplerCubeArray", false);
    var peg$e109 = peg$literalExpectation("samplerCubeArrayShadow", false);
    var peg$e110 = peg$literalExpectation("isamplerCubeArray", false);
    var peg$e111 = peg$literalExpectation("usamplerCubeArray", false);
    var peg$e112 = peg$literalExpectation("sampler2DMS", false);
    var peg$e113 = peg$literalExpectation("isampler2DMS", false);
    var peg$e114 = peg$literalExpectation("usampler2DMS", false);
    var peg$e115 = peg$literalExpectation("sampler2DMSArray", false);
    var peg$e116 = peg$literalExpectation("isampler2DMSArray", false);
    var peg$e117 = peg$literalExpectation("usampler2DMSArray", false);
    var peg$e118 = peg$literalExpectation("image1D", false);
    var peg$e119 = peg$literalExpectation("iimage1D", false);
    var peg$e120 = peg$literalExpectation("uimage1D", false);
    var peg$e121 = peg$literalExpectation("image2D", false);
    var peg$e122 = peg$literalExpectation("iimage2D", false);
    var peg$e123 = peg$literalExpectation("uimage2D", false);
    var peg$e124 = peg$literalExpectation("image3D", false);
    var peg$e125 = peg$literalExpectation("iimage3D", false);
    var peg$e126 = peg$literalExpectation("uimage3D", false);
    var peg$e127 = peg$literalExpectation("image2DRect", false);
    var peg$e128 = peg$literalExpectation("iimage2DRect", false);
    var peg$e129 = peg$literalExpectation("uimage2DRect", false);
    var peg$e130 = peg$literalExpectation("imageCube", false);
    var peg$e131 = peg$literalExpectation("iimageCube", false);
    var peg$e132 = peg$literalExpectation("uimageCube", false);
    var peg$e133 = peg$literalExpectation("imageBuffer", false);
    var peg$e134 = peg$literalExpectation("iimageBuffer", false);
    var peg$e135 = peg$literalExpectation("uimageBuffer", false);
    var peg$e136 = peg$literalExpectation("image1DArray", false);
    var peg$e137 = peg$literalExpectation("iimage1DArray", false);
    var peg$e138 = peg$literalExpectation("uimage1DArray", false);
    var peg$e139 = peg$literalExpectation("image2DArray", false);
    var peg$e140 = peg$literalExpectation("iimage2DArray", false);
    var peg$e141 = peg$literalExpectation("uimage2DArray", false);
    var peg$e142 = peg$literalExpectation("imageCubeArray", false);
    var peg$e143 = peg$literalExpectation("iimageCubeArray", false);
    var peg$e144 = peg$literalExpectation("uimageCubeArray", false);
    var peg$e145 = peg$literalExpectation("image2DMS", false);
    var peg$e146 = peg$literalExpectation("iimage2DMS", false);
    var peg$e147 = peg$literalExpectation("uimage2DMS", false);
    var peg$e148 = peg$literalExpectation("image2DMArray", false);
    var peg$e149 = peg$literalExpectation("iimage2DMSArray", false);
    var peg$e150 = peg$literalExpectation("uimage2DMSArray", false);
    var peg$e151 = peg$literalExpectation("struct", false);
    var peg$e152 = peg$literalExpectation("void", false);
    var peg$e153 = peg$literalExpectation("while", false);
    var peg$e154 = peg$literalExpectation("invariant", false);
    var peg$e155 = peg$literalExpectation("precise", false);
    var peg$e156 = peg$literalExpectation("highp", false);
    var peg$e157 = peg$literalExpectation("mediump", false);
    var peg$e158 = peg$literalExpectation("lowp", false);
    var peg$e159 = peg$literalExpectation("precision", false);
    var peg$e160 = peg$literalExpectation("true", false);
    var peg$e161 = peg$literalExpectation("false", false);
    var peg$e162 = peg$otherExpectation("keyword");
    var peg$e163 = peg$literalExpectation("<<", false);
    var peg$e164 = peg$literalExpectation(">>", false);
    var peg$e165 = peg$literalExpectation("++", false);
    var peg$e166 = peg$literalExpectation("--", false);
    var peg$e167 = peg$literalExpectation("<=", false);
    var peg$e168 = peg$literalExpectation(">=", false);
    var peg$e169 = peg$literalExpectation("==", false);
    var peg$e170 = peg$literalExpectation("!=", false);
    var peg$e171 = peg$literalExpectation("&&", false);
    var peg$e172 = peg$literalExpectation("||", false);
    var peg$e173 = peg$literalExpectation("^^", false);
    var peg$e174 = peg$literalExpectation("*=", false);
    var peg$e175 = peg$literalExpectation("/=", false);
    var peg$e176 = peg$literalExpectation("+=", false);
    var peg$e177 = peg$literalExpectation("%=", false);
    var peg$e178 = peg$literalExpectation("<<=", false);
    var peg$e179 = peg$literalExpectation(">>=", false);
    var peg$e180 = peg$literalExpectation("&=", false);
    var peg$e181 = peg$literalExpectation("^=", false);
    var peg$e182 = peg$literalExpectation("|=", false);
    var peg$e183 = peg$literalExpectation("-=", false);
    var peg$e184 = peg$literalExpectation("(", false);
    var peg$e185 = peg$literalExpectation(")", false);
    var peg$e186 = peg$literalExpectation("[", false);
    var peg$e187 = peg$literalExpectation("]", false);
    var peg$e188 = peg$literalExpectation("{", false);
    var peg$e189 = peg$literalExpectation("}", false);
    var peg$e190 = peg$literalExpectation(".", false);
    var peg$e191 = peg$literalExpectation(",", false);
    var peg$e192 = peg$literalExpectation(":", false);
    var peg$e193 = peg$literalExpectation("=", false);
    var peg$e194 = peg$literalExpectation(";", false);
    var peg$e195 = peg$literalExpectation("!", false);
    var peg$e196 = peg$literalExpectation("-", false);
    var peg$e197 = peg$literalExpectation("~", false);
    var peg$e198 = peg$literalExpectation("+", false);
    var peg$e199 = peg$literalExpectation("*", false);
    var peg$e200 = peg$literalExpectation("/", false);
    var peg$e201 = peg$literalExpectation("%", false);
    var peg$e202 = peg$literalExpectation("<", false);
    var peg$e203 = peg$literalExpectation(">", false);
    var peg$e204 = peg$literalExpectation("|", false);
    var peg$e205 = peg$literalExpectation("^", false);
    var peg$e206 = peg$literalExpectation("&", false);
    var peg$e207 = peg$literalExpectation("?", false);
    var peg$e208 = peg$classExpectation([
        [
            "A",
            "Z"
        ],
        [
            "a",
            "z"
        ],
        "_"
    ], false, false);
    var peg$e209 = peg$classExpectation([
        [
            "A",
            "Z"
        ],
        [
            "a",
            "z"
        ],
        "_",
        [
            "0",
            "9"
        ]
    ], false, false);
    var peg$e210 = peg$classExpectation([
        "u",
        "U"
    ], false, false);
    var peg$e211 = peg$classExpectation([
        [
            "1",
            "9"
        ]
    ], false, false);
    var peg$e212 = peg$literalExpectation("0", false);
    var peg$e213 = peg$classExpectation([
        [
            "0",
            "7"
        ]
    ], false, false);
    var peg$e214 = peg$classExpectation([
        "x",
        "X"
    ], false, false);
    var peg$e215 = peg$classExpectation([
        [
            "0",
            "9"
        ],
        [
            "a",
            "f"
        ],
        [
            "A",
            "F"
        ]
    ], false, false);
    var peg$e216 = peg$classExpectation([
        [
            "0",
            "9"
        ]
    ], false, false);
    var peg$e217 = peg$otherExpectation("exponent");
    var peg$e218 = peg$classExpectation([
        "e",
        "E"
    ], false, false);
    var peg$e219 = peg$classExpectation([
        "+",
        "-"
    ], false, false);
    var peg$e220 = peg$classExpectation([
        "f",
        "F"
    ], false, false);
    var peg$e221 = peg$literalExpectation("lf", false);
    var peg$e222 = peg$literalExpectation("LF", false);
    var peg$e223 = peg$otherExpectation("primary expression");
    var peg$e224 = peg$otherExpectation("unary expression");
    var peg$e225 = peg$otherExpectation("equality expression");
    var peg$e226 = peg$otherExpectation("and expression");
    var peg$e227 = peg$otherExpectation("asignment");
    var peg$e228 = peg$otherExpectation("expression");
    var peg$e229 = peg$otherExpectation("precision statement");
    var peg$e230 = peg$otherExpectation("function prototype");
    var peg$e231 = peg$otherExpectation("function header");
    var peg$e232 = peg$otherExpectation("function prototype scope");
    var peg$e233 = peg$otherExpectation("function header scope");
    var peg$e234 = peg$otherExpectation("function parameters");
    var peg$e235 = peg$otherExpectation("parameter declaration");
    var peg$e236 = peg$otherExpectation("parameter declarator");
    var peg$e237 = peg$otherExpectation("single type qualifier");
    var peg$e238 = peg$otherExpectation("interpolation qualifier");
    var peg$e239 = peg$otherExpectation("storage qualifier");
    var peg$e240 = peg$otherExpectation("type specifier");
    var peg$e241 = peg$otherExpectation("array specifier");
    var peg$e242 = peg$otherExpectation("precision qualifier");
    var peg$e243 = peg$otherExpectation("struct specifier");
    var peg$e244 = peg$otherExpectation("iteration statement");
    var peg$e245 = peg$otherExpectation("jump statement");
    var peg$e246 = peg$otherExpectation("prepocessor");
    var peg$e247 = peg$literalExpectation("#", false);
    var peg$e248 = peg$classExpectation([
        "\n"
    ], true, false);
    var peg$e249 = peg$otherExpectation("whitespace");
    var peg$e250 = peg$literalExpectation("//", false);
    var peg$e251 = peg$literalExpectation("/*", false);
    var peg$e252 = peg$literalExpectation("*/", false);
    var peg$e253 = peg$anyExpectation();
    var peg$e254 = peg$classExpectation([
        " ",
        "\t",
        "\n",
        "\r"
    ], false, false);
    var peg$f0 = function(wsStart, program) {
        setScopeEnd(scope, getLocation()?.end);
        return node('program', {
            wsStart,
            program,
            scopes
        });
    };
    var peg$f1 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f2 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f3 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f4 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f5 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f6 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f7 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f8 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f9 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f10 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f11 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f12 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f13 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f14 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f15 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f16 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f17 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f18 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f19 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f20 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f21 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f22 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f23 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f24 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f25 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f26 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f27 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f28 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f29 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f30 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f31 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f32 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f33 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f34 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f35 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f36 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f37 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f38 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f39 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f40 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f41 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f42 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f43 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f44 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f45 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f46 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f47 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f48 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f49 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f50 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f51 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f52 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f53 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f54 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f55 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f56 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f57 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f58 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f59 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f60 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f61 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f62 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f63 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f64 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f65 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f66 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f67 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f68 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f69 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f70 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f71 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f72 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f73 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f74 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f75 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f76 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f77 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f78 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f79 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f80 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f81 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f82 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f83 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f84 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f85 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f86 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f87 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f88 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f89 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f90 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f91 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f92 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f93 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f94 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f95 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f96 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f97 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f98 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f99 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f100 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f101 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f102 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f103 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f104 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f105 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f106 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f107 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f108 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f109 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f110 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f111 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f112 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f113 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f114 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f115 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f116 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f117 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f118 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f119 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f120 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f121 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f122 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f123 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f124 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f125 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f126 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f127 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f128 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f129 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f130 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f131 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f132 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f133 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f134 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f135 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f136 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f137 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f138 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f139 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f140 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f141 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f142 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f143 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f144 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f145 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f146 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f147 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f148 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f149 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f150 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f151 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f152 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f153 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f154 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f155 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f156 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f157 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f158 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f159 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f160 = function(token, t) {
        return node('keyword', {
            token,
            whitespace: t
        });
    };
    var peg$f161 = function(token, _) {
        return node('float_constant', {
            token,
            whitespace: _
        });
    };
    var peg$f162 = function(token, _) {
        return node('double_constant', {
            token,
            whitespace: _
        });
    };
    var peg$f163 = function(token, _) {
        return node('int_constant', {
            token,
            whitespace: _
        });
    };
    var peg$f164 = function(token, _) {
        return node('uint_constant', {
            token,
            whitespace: _
        });
    };
    var peg$f165 = function(token, _) {
        return node('bool_constant', {
            token,
            whitespace: _
        });
    };
    var peg$f166 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f167 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f168 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f169 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f170 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f171 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f172 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f173 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f174 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f175 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f176 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f177 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f178 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f179 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f180 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f181 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f182 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f183 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f184 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f185 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f186 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f187 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f188 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f189 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f190 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f191 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f192 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f193 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f194 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f195 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f196 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f197 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f198 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f199 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f200 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f201 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f202 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f203 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f204 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f205 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f206 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f207 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f208 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f209 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f210 = function(token, _) {
        return node('literal', {
            literal: token,
            whitespace: _
        });
    };
    var peg$f211 = function(identifier, _) {
        return node('identifier', {
            identifier,
            whitespace: _
        });
    };
    var peg$f212 = function(ident) {
        const { identifier  } = ident;
        let found;
        if (found = findTypeScope(scope, identifier)) {
            addTypeReference(found, identifier, ident);
        }
        return ident;
    };
    var peg$f213 = function(lp, expression, rp) {
        return node('group', {
            lp,
            expression,
            rp
        });
    };
    var peg$f214 = function(ident) {
        const { identifier  } = ident;
        addBindingReference(scope, identifier, ident);
        return ident;
    };
    var peg$f215 = function(body) {
        return body.flat().reduceRight((postfix, expression)=>postfix ? node('postfix', {
                expression,
                postfix
            }) : expression);
    };
    var peg$f216 = function(lb, expression, rb) {
        return node('quantifier', {
            lb,
            expression,
            rb
        });
    };
    var peg$f217 = function(dot, selection) {
        return node('field_selection', {
            dot,
            selection
        });
    };
    var peg$f218 = function(function_identifier, args, rp) {
        const identifierPartial = function_identifier.partial;
        const { identifier  } = identifierPartial;
        const fnName = identifier.type === 'postfix' ? identifier.expression.identifier ? identifier.expression.identifier.specifier.identifier : identifier.expression.specifier.identifier : identifier.specifier.identifier;
        const n = node('function_call', {
            ...identifierPartial,
            args,
            rp
        });
        const isDeclared = isDeclaredFunction(scope, fnName);
        if (fnName && !isDeclaredType(scope, fnName) && (isDeclared || !builtIns.has(fnName))) {
            if (!isDeclared) {
                warn(`Warning: Function "${fnName}" has not been declared`);
            }
            addFunctionReference(scope, fnName, n);
        }
        return n;
    };
    var peg$f219 = function(v) {
        return [
            v
        ];
    };
    var peg$f220 = function(head, tail) {
        return [
            head,
            ...tail.flat()
        ];
    };
    var peg$f221 = function(head, suffix, lp) {
        return partial({
            head: [
                head,
                suffix
            ],
            lp
        });
    };
    var peg$f222 = function(head, suffix, lp) {
        return partial({
            head: [
                head,
                suffix
            ],
            lp
        });
    };
    var peg$f223 = function(identifier) {
        return partial({
            lp: identifier.partial.lp,
            identifier: [
                identifier.partial.head
            ].flat().reduceRight((postfix, expression)=>postfix ? node('postfix', {
                    expression,
                    postfix
                }) : expression)
        });
    };
    var peg$f224 = function(identifier, lp, args, rp) {
        return node('function_call', {
            identifier,
            lp,
            args,
            rp
        });
    };
    var peg$f225 = function(operator, expression) {
        return node('unary', {
            operator,
            expression
        });
    };
    var peg$f226 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f227 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f228 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f229 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f230 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f231 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f232 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f233 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f234 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f235 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f236 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f237 = function(expression, question, left, colon, right) {
        return {
            question,
            left,
            right,
            colon
        };
    };
    var peg$f238 = function(expression, suffix) {
        return suffix ? node('ternary', {
            expression,
            ...suffix
        }) : expression;
    };
    var peg$f239 = function(left, operator, right) {
        return node('assignment', {
            left,
            operator,
            right
        });
    };
    var peg$f240 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f241 = function(declaration) {
        return node('declaration_statement', {
            declaration: declaration[0],
            semi: declaration[1]
        });
    };
    var peg$f242 = function(qualifiers, head, tail) {
        return node('qualifier_declarator', {
            qualifiers,
            declarations: xnil([
                head,
                ...tail.map((t)=>t[1])
            ]),
            commas: tail.map((t)=>t[0])
        });
    };
    var peg$f243 = function(qualifiers, interface_type, lp, declarations, rp, identifier) {
        const n = node('interface_declarator', {
            qualifiers,
            interface_type,
            lp,
            declarations,
            rp,
            identifier
        });
        createBindings(scope, [
            interface_type.identifier,
            n
        ]);
        return n;
    };
    var peg$f244 = function(prefix, qualifier, specifier) {
        return node('precision', {
            prefix,
            qualifier,
            specifier
        });
    };
    var peg$f245 = function(header, params, rp) {
        const bindings = (params?.parameters || []).filter((p)=>!!p.declaration.identifier).map((p)=>[
                p.declaration.identifier.identifier,
                p
            ]);
        createBindings(scope, ...bindings);
        return node('function_prototype', {
            header,
            ...params,
            rp
        });
    };
    var peg$f246 = function(returnType, name, lp) {
        const n = node('function_header', {
            returnType,
            name,
            lp
        });
        scope = pushScope(makeScope(name.identifier, scope, lp.location));
        return n;
    };
    var peg$f247 = function(header, params, rp) {
        return node('function_prototype', {
            header,
            ...params,
            rp
        });
    };
    var peg$f248 = function(returnType, name, lp) {
        return node('function_header', {
            returnType,
            name,
            lp
        });
    };
    var peg$f249 = function(head, tail) {
        return {
            parameters: [
                head,
                ...tail.map((t)=>t[1])
            ],
            commas: tail.map((t)=>t[0])
        };
    };
    var peg$f250 = function(qualifier, declaration) {
        return node('parameter_declaration', {
            qualifier,
            declaration
        });
    };
    var peg$f251 = function(specifier, identifier, quantifier) {
        const n = node('parameter_declarator', {
            specifier,
            identifier,
            quantifier
        });
        return n;
    };
    var peg$f252 = function(head, tail) {
        const declarations = [
            head.declaration,
            ...tail.map((t)=>t[1])
        ].filter((decl)=>!!decl.identifier);
        createBindings(scope, ...declarations.map((decl)=>[
                decl.identifier.identifier,
                decl
            ]));
        return node('declarator_list', {
            specified_type: head.specified_type,
            declarations,
            commas: tail.map((t)=>t[0])
        });
    };
    var peg$f253 = function(identifier, quantifier, suffix) {
        const [operator, initializer] = suffix || [];
        return node('declaration', {
            identifier,
            quantifier,
            operator,
            initializer
        });
    };
    var peg$f254 = function(specified_type, suffix) {
        const [identifier, quantifier, suffix_tail] = suffix || [];
        const [operator, initializer] = suffix_tail || [];
        return {
            declaration: node('declaration', {
                identifier,
                quantifier,
                operator,
                initializer
            }),
            specified_type
        };
    };
    var peg$f255 = function(qualifiers, specifier) {
        return node('fully_specified_type', {
            qualifiers,
            specifier
        });
    };
    var peg$f256 = function(layout, lp, head, tail) {
        return partial({
            qualifiers: [
                head,
                ...tail.map((t)=>t[1])
            ],
            commas: tail.map((t)=>t[0])
        });
    };
    var peg$f257 = function(layout, lp, qualifiers, rp) {
        return node('layout_qualifier', {
            layout,
            lp,
            ...qualifiers.partial,
            rp
        });
    };
    var peg$f258 = function(identifier, tail) {
        const [operator, expression] = tail || [];
        return node('layout_qualifier_id', {
            identifier,
            operator,
            expression
        });
    };
    var peg$f259 = function(subroutine, lp, head, tail, rp) {
        return partial({
            lp,
            type_names: [
                head,
                ...tail.map((t)=>t[1])
            ],
            commas: tail.map((t)=>t[0]),
            rp
        });
    };
    var peg$f260 = function(subroutine, type_names) {
        return node('subroutine_qualifier', {
            subroutine,
            ...(type_names?.partial)
        });
    };
    var peg$f261 = function(specifier, quantifier) {
        return node('type_specifier', {
            specifier,
            quantifier
        });
    };
    var peg$f262 = function(lb, expression, rb) {
        return node('array_specifier', {
            lb,
            expression,
            rb
        });
    };
    var peg$f263 = function(specifiers) {
        return node('array_specifiers', {
            specifiers
        });
    };
    var peg$f264 = function(struct, typeName, lb, declarations, rb) {
        const n = node('struct', {
            lb,
            declarations,
            rb,
            struct,
            typeName
        });
        if (typeName) {
            addTypes(scope, [
                typeName.identifier,
                n
            ]);
        }
        return n;
    };
    var peg$f265 = function(declaration, semi) {
        return node('struct_declaration', {
            declaration,
            semi
        });
    };
    var peg$f266 = function(specified_type, head, tail) {
        return node('struct_declarator', {
            specified_type,
            declarations: [
                head,
                ...tail.map((t)=>t[1])
            ],
            commas: tail.map((t)=>t[0])
        });
    };
    var peg$f267 = function(identifier, quantifier) {
        return node('quantified_identifier', {
            identifier,
            quantifier
        });
    };
    var peg$f268 = function(lb, head, tail, trailing, rb) {
        return node('initializer_list', {
            lb,
            initializers: [
                head,
                ...tail.map((t)=>t[1])
            ],
            commas: xnil(tail.map((t)=>t[0]), trailing),
            rb
        });
    };
    var peg$f269 = function(sym) {
        scope = pushScope(makeScope(OPEN_CURLY, scope));
        return sym;
    };
    var peg$f270 = function(lb, statements, rb) {
        setScopeEnd(scope, rb.location?.start);
        scope = popScope(scope);
        return node('compound_statement', {
            lb,
            statements: (statements || []).flat(),
            rb
        });
    };
    var peg$f271 = function(lb, statements, rb) {
        return node('compound_statement', {
            lb,
            statements: (statements || []).flat(),
            rb
        });
    };
    var peg$f272 = function(expression, semi) {
        return node('expression_statement', {
            expression,
            semi
        });
    };
    var peg$f273 = function(ifSymbol, lp, condition, rp, tail) {
        const [body, elseBranch] = tail;
        return node('if_statement', {
            'if': ifSymbol,
            body,
            lp,
            condition,
            rp,
            ...elseBranch && {
                'else': elseBranch.flat()
            }
        });
    };
    var peg$f274 = function(switchSymbol, lp, expression, rp, lb, statements, rb) {
        return node('switch_statement', {
            switch: switchSymbol,
            lp,
            expression,
            rp,
            lb,
            cases: groupCases(statements),
            rb
        });
    };
    var peg$f275 = function(caseSymbol, test, colon) {
        return partial('case_label', {
            'case': caseSymbol,
            test,
            colon
        });
    };
    var peg$f276 = function(defaultSymbol, colon) {
        return partial('default_label', {
            default: defaultSymbol,
            colon
        });
    };
    var peg$f277 = function(sym) {
        scope = pushScope(makeScope('while', scope));
        return sym;
    };
    var peg$f278 = function(whileSymbol, lp, condition, rp, body) {
        const end = body.rb ? body.rb.location?.start : body.location?.end;
        setScopeEnd(scope, end);
        scope = popScope(scope);
        return node('while_statement', {
            while: whileSymbol,
            lp,
            condition,
            rp,
            body
        });
    };
    var peg$f279 = function(doSymbol, body, whileSymbol, lp, expression, rp, semi) {
        return node('do_statement', {
            do: doSymbol,
            body,
            while: whileSymbol,
            lp,
            expression,
            rp,
            semi
        });
    };
    var peg$f280 = function(sym) {
        scope = pushScope(makeScope('for', scope));
        return sym;
    };
    var peg$f281 = function(forSymbol, lp, init, condition, conditionSemi, operation, rp, body) {
        const end = body.rb ? body.rb.location?.start : body.location?.end;
        setScopeEnd(scope, end);
        scope = popScope(scope);
        return node('for_statement', {
            'for': forSymbol,
            body,
            lp,
            init: init.expression || init.declaration,
            initSemi: init.semi,
            condition,
            conditionSemi,
            operation,
            rp
        });
    };
    var peg$f282 = function(specified_type, identifier, operator, initializer) {
        const n = node('condition_expression', {
            specified_type,
            identifier,
            operator,
            initializer
        });
        createBindings(scope, [
            identifier.identifier,
            n
        ]);
        return n;
    };
    var peg$f283 = function(jump, semi) {
        return node('continue_statement', {
            continue: jump,
            semi
        });
    };
    var peg$f284 = function(jump, semi) {
        return node('break_statement', {
            break: jump,
            semi
        });
    };
    var peg$f285 = function(jump, expression, semi) {
        return node('return_statement', {
            return: jump,
            expression,
            semi
        });
    };
    var peg$f286 = function(jump, semi) {
        return node('discard_statement', {
            discard: jump,
            semi
        });
    };
    var peg$f287 = function(line, _) {
        return node('preprocessor', {
            line,
            _
        });
    };
    var peg$f288 = function(declaration, semi) {
        addFunctionReference(scope, declaration.header.name.identifier, declaration);
        const n = node('declaration_statement', {
            declaration,
            semi
        });
        return n;
    };
    var peg$f290 = function(prototype, body) {
        const n = node('function', {
            prototype,
            body
        });
        setScopeEnd(scope, body.rb.location?.start);
        scope = popScope(scope);
        addFunctionReference(scope, prototype.header.name.identifier, n);
        return n;
    };
    var peg$f291 = function(w, rest) {
        return collapse(w, rest);
    };
    var peg$f292 = function(a, x, cc) {
        return xnil(x, cc);
    };
    var peg$f293 = function(a, d) {
        return xnil(a, d.flat());
    };
    var peg$f294 = function(i) {
        return i;
    };
    var peg$f295 = function(_) {
        return _;
    };
    var peg$currPos = 0;
    var peg$savedPos = 0;
    var peg$posDetailsCache = [
        {
            line: 1,
            column: 1
        }
    ];
    var peg$maxFailPos = 0;
    var peg$maxFailExpected = [];
    var peg$silentFails = 0;
    var peg$resultsCache = {};
    var peg$result;
    if ("startRule" in options) {
        if (!(options.startRule in peg$startRuleFunctions)) {
            throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
        }
        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
    function text() {
        return input.substring(peg$savedPos, peg$currPos);
    }
    function location() {
        return peg$computeLocation(peg$savedPos, peg$currPos);
    }
    function peg$literalExpectation(text, ignoreCase) {
        return {
            type: "literal",
            text: text,
            ignoreCase: ignoreCase
        };
    }
    function peg$classExpectation(parts, inverted, ignoreCase) {
        return {
            type: "class",
            parts: parts,
            inverted: inverted,
            ignoreCase: ignoreCase
        };
    }
    function peg$anyExpectation() {
        return {
            type: "any"
        };
    }
    function peg$endExpectation() {
        return {
            type: "end"
        };
    }
    function peg$otherExpectation(description) {
        return {
            type: "other",
            description: description
        };
    }
    function peg$computePosDetails(pos) {
        var details = peg$posDetailsCache[pos];
        var p;
        if (details) {
            return details;
        } else {
            p = pos - 1;
            while(!peg$posDetailsCache[p]){
                p--;
            }
            details = peg$posDetailsCache[p];
            details = {
                line: details.line,
                column: details.column
            };
            while(p < pos){
                if (input.charCodeAt(p) === 10) {
                    details.line++;
                    details.column = 1;
                } else {
                    details.column++;
                }
                p++;
            }
            peg$posDetailsCache[pos] = details;
            return details;
        }
    }
    function peg$computeLocation(startPos, endPos, offset) {
        var startPosDetails = peg$computePosDetails(startPos);
        var endPosDetails = peg$computePosDetails(endPos);
        var res = {
            source: peg$source,
            start: {
                offset: startPos,
                line: startPosDetails.line,
                column: startPosDetails.column
            },
            end: {
                offset: endPos,
                line: endPosDetails.line,
                column: endPosDetails.column
            }
        };
        if (offset && peg$source && typeof peg$source.offset === "function") {
            res.start = peg$source.offset(res.start);
            res.end = peg$source.offset(res.end);
        }
        return res;
    }
    function peg$fail(expected) {
        if (peg$currPos < peg$maxFailPos) {
            return;
        }
        if (peg$currPos > peg$maxFailPos) {
            peg$maxFailPos = peg$currPos;
            peg$maxFailExpected = [];
        }
        peg$maxFailExpected.push(expected);
    }
    function peg$buildStructuredError(expected, found, location) {
        return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
    }
    function peg$parsestart() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 0;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        s2 = peg$parsetranslation_unit();
        if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f0(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseATTRIBUTE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 1;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 9) === peg$c0) {
            s1 = peg$c0;
            peg$currPos += 9;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e0);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f1(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseVARYING() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 2;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c1) {
            s1 = peg$c1;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e1);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f2(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseCONST() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 3;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c2) {
            s1 = peg$c2;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e2);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f3(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseBOOL() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 4;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c3) {
            s1 = peg$c3;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e3);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f4(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseFLOAT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 5;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c4) {
            s1 = peg$c4;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e4);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f5(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDOUBLE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 6;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c5) {
            s1 = peg$c5;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e5);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f6(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseINT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 7;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3) === peg$c6) {
            s1 = peg$c6;
            peg$currPos += 3;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e6);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f7(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUINT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 8;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c7) {
            s1 = peg$c7;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e7);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f8(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseBREAK() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 9;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c8) {
            s1 = peg$c8;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e8);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f9(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseCONTINUE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 10;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c9) {
            s1 = peg$c9;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e9);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f10(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDO() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 11;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c10) {
            s1 = peg$c10;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e10);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f11(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseELSE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 12;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c11) {
            s1 = peg$c11;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e11);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f12(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseFOR() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 13;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3) === peg$c12) {
            s1 = peg$c12;
            peg$currPos += 3;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e12);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f13(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIF() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 14;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c13) {
            s1 = peg$c13;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e13);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f14(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDISCARD() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 15;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c14) {
            s1 = peg$c14;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e14);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f15(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseRETURN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 16;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c15) {
            s1 = peg$c15;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e15);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f16(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSWITCH() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 17;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c16) {
            s1 = peg$c16;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e16);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f17(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseCASE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 18;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c17) {
            s1 = peg$c17;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e17);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f18(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDEFAULT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 19;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c18) {
            s1 = peg$c18;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e18);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f19(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSUBROUTINE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 20;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c19) {
            s1 = peg$c19;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e19);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f20(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseBVEC2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 21;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c20) {
            s1 = peg$c20;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e20);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f21(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseBVEC3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 22;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c21) {
            s1 = peg$c21;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e21);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f22(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseBVEC4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 23;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c22) {
            s1 = peg$c22;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e22);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f23(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIVEC2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 24;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c23) {
            s1 = peg$c23;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e23);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f24(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIVEC3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 25;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c24) {
            s1 = peg$c24;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e24);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f25(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIVEC4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 26;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c25) {
            s1 = peg$c25;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e25);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f26(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUVEC2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 27;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c26) {
            s1 = peg$c26;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e26);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f27(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUVEC3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 28;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c27) {
            s1 = peg$c27;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e27);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f28(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUVEC4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 29;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c28) {
            s1 = peg$c28;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e28);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f29(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseVEC2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 30;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c29) {
            s1 = peg$c29;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e29);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f30(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseVEC3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 31;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c30) {
            s1 = peg$c30;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e30);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f31(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseVEC4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 32;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c31) {
            s1 = peg$c31;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e31);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f32(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 33;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c32) {
            s1 = peg$c32;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e32);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f33(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 34;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c33) {
            s1 = peg$c33;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e33);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f34(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 35;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c34) {
            s1 = peg$c34;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e34);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f35(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseCENTROID() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 36;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c35) {
            s1 = peg$c35;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e35);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f36(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 37;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c36) {
            s1 = peg$c36;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e36);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f37(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseOUT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 38;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3) === peg$c37) {
            s1 = peg$c37;
            peg$currPos += 3;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e37);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f38(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseINOUT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 39;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c38) {
            s1 = peg$c38;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e38);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f39(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUNIFORM() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 40;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c39) {
            s1 = peg$c39;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e39);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f40(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsePATCH() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 41;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c40) {
            s1 = peg$c40;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e40);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f41(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 42;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c41) {
            s1 = peg$c41;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e41);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f42(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseBUFFER() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 43;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c42) {
            s1 = peg$c42;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e42);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f43(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSHARED() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 44;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c43) {
            s1 = peg$c43;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e43);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f44(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseCOHERENT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 45;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c44) {
            s1 = peg$c44;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e44);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f45(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseVOLATILE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 46;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c45) {
            s1 = peg$c45;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e45);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f46(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseRESTRICT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 47;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c46) {
            s1 = peg$c46;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e46);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f47(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseREADONLY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 48;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c47) {
            s1 = peg$c47;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e47);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f48(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseWRITEONLY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 49;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 9) === peg$c48) {
            s1 = peg$c48;
            peg$currPos += 9;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e48);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f49(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDVEC2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 50;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c49) {
            s1 = peg$c49;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e49);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f50(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDVEC3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 51;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c50) {
            s1 = peg$c50;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e50);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f51(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDVEC4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 52;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c51) {
            s1 = peg$c51;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e51);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f52(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 53;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c52) {
            s1 = peg$c52;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e52);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f53(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 54;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c53) {
            s1 = peg$c53;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e53);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f54(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 55;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c54) {
            s1 = peg$c54;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e54);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f55(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseNOPERSPECTIVE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 56;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 13) === peg$c55) {
            s1 = peg$c55;
            peg$currPos += 13;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e55);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f56(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseFLAT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 57;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c56) {
            s1 = peg$c56;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e56);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f57(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSMOOTH() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 58;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c57) {
            s1 = peg$c57;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e57);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f58(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseLAYOUT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 59;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c58) {
            s1 = peg$c58;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e58);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f59(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT2X2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 60;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c59) {
            s1 = peg$c59;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e59);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f60(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT2X3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 61;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c60) {
            s1 = peg$c60;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e60);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f61(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT2X4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 62;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c61) {
            s1 = peg$c61;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e61);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f62(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT3X2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 63;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c62) {
            s1 = peg$c62;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e62);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f63(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT3X3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 64;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c63) {
            s1 = peg$c63;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e63);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f64(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT3X4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 65;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c64) {
            s1 = peg$c64;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e64);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f65(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT4X2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 66;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c65) {
            s1 = peg$c65;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e65);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f66(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT4X3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 67;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c66) {
            s1 = peg$c66;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e66);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f67(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMAT4X4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 68;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c67) {
            s1 = peg$c67;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e67);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f68(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT2X2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 69;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c68) {
            s1 = peg$c68;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e68);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f69(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT2X3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 70;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c69) {
            s1 = peg$c69;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e69);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f70(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT2X4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 71;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c70) {
            s1 = peg$c70;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e70);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f71(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT3X2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 72;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c71) {
            s1 = peg$c71;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e71);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f72(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT3X3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 73;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c72) {
            s1 = peg$c72;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e72);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f73(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT3X4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 74;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c73) {
            s1 = peg$c73;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e73);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f74(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT4X2() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 75;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c74) {
            s1 = peg$c74;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e74);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f75(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT4X3() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 76;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c75) {
            s1 = peg$c75;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e75);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f76(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDMAT4X4() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 77;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c76) {
            s1 = peg$c76;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e76);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f77(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseATOMIC_UINT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 78;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 11) === peg$c77) {
            s1 = peg$c77;
            peg$currPos += 11;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e77);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f78(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER1D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 79;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 9) === peg$c78) {
            s1 = peg$c78;
            peg$currPos += 9;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e78);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f79(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER2D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 80;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 9) === peg$c79) {
            s1 = peg$c79;
            peg$currPos += 9;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e79);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f80(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER3D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 81;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 9) === peg$c80) {
            s1 = peg$c80;
            peg$currPos += 9;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e80);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f81(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLERCUBE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 82;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 11) === peg$c81) {
            s1 = peg$c81;
            peg$currPos += 11;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e81);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f82(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER1DSHADOW() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 83;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 15) === peg$c82) {
            s1 = peg$c82;
            peg$currPos += 15;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e82);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f83(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER2DSHADOW() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 84;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 15) === peg$c83) {
            s1 = peg$c83;
            peg$currPos += 15;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e83);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f84(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLERCUBESHADOW() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 85;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 17) === peg$c84) {
            s1 = peg$c84;
            peg$currPos += 17;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e84);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f85(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER1DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 86;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 14) === peg$c85) {
            s1 = peg$c85;
            peg$currPos += 14;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e85);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f86(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER2DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 87;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 14) === peg$c86) {
            s1 = peg$c86;
            peg$currPos += 14;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e86);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f87(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER1DARRAYSHADOW() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 88;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 20) === peg$c87) {
            s1 = peg$c87;
            peg$currPos += 20;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e87);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f88(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER2DARRAYSHADOW() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 89;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 20) === peg$c88) {
            s1 = peg$c88;
            peg$currPos += 20;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e88);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f89(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLER1D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 90;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c89) {
            s1 = peg$c89;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e89);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f90(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLER2D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 91;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c90) {
            s1 = peg$c90;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e90);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f91(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLER3D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 92;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c91) {
            s1 = peg$c91;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e91);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f92(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLERCUBE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 93;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 12) === peg$c92) {
            s1 = peg$c92;
            peg$currPos += 12;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e92);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f93(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLER1DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 94;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 15) === peg$c93) {
            s1 = peg$c93;
            peg$currPos += 15;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e93);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f94(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLER2DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 95;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 15) === peg$c94) {
            s1 = peg$c94;
            peg$currPos += 15;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e94);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f95(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLER1D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 96;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c95) {
            s1 = peg$c95;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e95);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f96(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLER2D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 97;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c96) {
            s1 = peg$c96;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e96);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f97(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLER3D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 98;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c97) {
            s1 = peg$c97;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e97);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f98(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLERCUBE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 99;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 12) === peg$c98) {
            s1 = peg$c98;
            peg$currPos += 12;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e98);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f99(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLER1DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 100;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 15) === peg$c99) {
            s1 = peg$c99;
            peg$currPos += 15;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e99);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f100(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLER2DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 101;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 15) === peg$c100) {
            s1 = peg$c100;
            peg$currPos += 15;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e100);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f101(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER2DRECT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 102;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 13) === peg$c101) {
            s1 = peg$c101;
            peg$currPos += 13;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e101);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f102(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER2DRECTSHADOW() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 103;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 19) === peg$c102) {
            s1 = peg$c102;
            peg$currPos += 19;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e102);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f103(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLER2DRECT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 104;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 14) === peg$c103) {
            s1 = peg$c103;
            peg$currPos += 14;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e103);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f104(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLER2DRECT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 105;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 14) === peg$c104) {
            s1 = peg$c104;
            peg$currPos += 14;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e104);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f105(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLERBUFFER() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 106;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 13) === peg$c105) {
            s1 = peg$c105;
            peg$currPos += 13;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e105);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f106(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLERBUFFER() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 107;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 14) === peg$c106) {
            s1 = peg$c106;
            peg$currPos += 14;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e106);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f107(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLERBUFFER() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 108;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 14) === peg$c107) {
            s1 = peg$c107;
            peg$currPos += 14;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e107);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f108(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLERCUBEARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 109;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 16) === peg$c108) {
            s1 = peg$c108;
            peg$currPos += 16;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e108);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f109(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLERCUBEARRAYSHADOW() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 110;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 22) === peg$c109) {
            s1 = peg$c109;
            peg$currPos += 22;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e109);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f110(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLERCUBEARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 111;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 17) === peg$c110) {
            s1 = peg$c110;
            peg$currPos += 17;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e110);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f111(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLERCUBEARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 112;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 17) === peg$c111) {
            s1 = peg$c111;
            peg$currPos += 17;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e111);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f112(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER2DMS() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 113;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 11) === peg$c112) {
            s1 = peg$c112;
            peg$currPos += 11;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e112);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f113(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLER2DMS() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 114;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 12) === peg$c113) {
            s1 = peg$c113;
            peg$currPos += 12;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e113);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f114(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLER2DMS() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 115;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 12) === peg$c114) {
            s1 = peg$c114;
            peg$currPos += 12;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e114);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f115(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSAMPLER2DMSARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 116;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 16) === peg$c115) {
            s1 = peg$c115;
            peg$currPos += 16;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e115);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f116(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseISAMPLER2DMSARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 117;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 17) === peg$c116) {
            s1 = peg$c116;
            peg$currPos += 17;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e116);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f117(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUSAMPLER2DMSARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 118;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 17) === peg$c117) {
            s1 = peg$c117;
            peg$currPos += 17;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e117);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f118(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGE1D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 119;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c118) {
            s1 = peg$c118;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e118);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f119(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGE1D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 120;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c119) {
            s1 = peg$c119;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e119);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f120(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGE1D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 121;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c120) {
            s1 = peg$c120;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e120);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f121(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGE2D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 122;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c121) {
            s1 = peg$c121;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e121);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f122(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGE2D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 123;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c122) {
            s1 = peg$c122;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e122);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f123(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGE2D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 124;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c123) {
            s1 = peg$c123;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e123);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f124(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGE3D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 125;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c124) {
            s1 = peg$c124;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e124);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f125(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGE3D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 126;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c125) {
            s1 = peg$c125;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e125);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f126(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGE3D() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 127;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c126) {
            s1 = peg$c126;
            peg$currPos += 8;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e126);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f127(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGE2DRECT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 128;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 11) === peg$c127) {
            s1 = peg$c127;
            peg$currPos += 11;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e127);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f128(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGE2DRECT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 129;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 12) === peg$c128) {
            s1 = peg$c128;
            peg$currPos += 12;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e128);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f129(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGE2DRECT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 130;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 12) === peg$c129) {
            s1 = peg$c129;
            peg$currPos += 12;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e129);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f130(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGECUBE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 131;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 9) === peg$c130) {
            s1 = peg$c130;
            peg$currPos += 9;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e130);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f131(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGECUBE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 132;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c131) {
            s1 = peg$c131;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e131);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f132(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGECUBE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 133;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c132) {
            s1 = peg$c132;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e132);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f133(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGEBUFFER() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 134;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 11) === peg$c133) {
            s1 = peg$c133;
            peg$currPos += 11;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e133);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f134(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGEBUFFER() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 135;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 12) === peg$c134) {
            s1 = peg$c134;
            peg$currPos += 12;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e134);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f135(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGEBUFFER() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 136;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 12) === peg$c135) {
            s1 = peg$c135;
            peg$currPos += 12;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e135);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f136(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGE1DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 137;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 12) === peg$c136) {
            s1 = peg$c136;
            peg$currPos += 12;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e136);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f137(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGE1DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 138;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 13) === peg$c137) {
            s1 = peg$c137;
            peg$currPos += 13;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e137);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f138(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGE1DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 139;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 13) === peg$c138) {
            s1 = peg$c138;
            peg$currPos += 13;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e138);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f139(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGE2DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 140;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 12) === peg$c139) {
            s1 = peg$c139;
            peg$currPos += 12;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e139);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f140(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGE2DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 141;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 13) === peg$c140) {
            s1 = peg$c140;
            peg$currPos += 13;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e140);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f141(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGE2DARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 142;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 13) === peg$c141) {
            s1 = peg$c141;
            peg$currPos += 13;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e141);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f142(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGECUBEARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 143;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 14) === peg$c142) {
            s1 = peg$c142;
            peg$currPos += 14;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e142);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f143(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGECUBEARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 144;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 15) === peg$c143) {
            s1 = peg$c143;
            peg$currPos += 15;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e143);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f144(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGECUBEARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 145;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 15) === peg$c144) {
            s1 = peg$c144;
            peg$currPos += 15;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e144);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f145(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGE2DMS() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 146;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 9) === peg$c145) {
            s1 = peg$c145;
            peg$currPos += 9;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e145);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f146(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGE2DMS() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 147;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c146) {
            s1 = peg$c146;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e146);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f147(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGE2DMS() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 148;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 10) === peg$c147) {
            s1 = peg$c147;
            peg$currPos += 10;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e147);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f148(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIMAGE2DMSARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 149;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 13) === peg$c148) {
            s1 = peg$c148;
            peg$currPos += 13;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e148);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f149(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIIMAGE2DMSARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 150;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 15) === peg$c149) {
            s1 = peg$c149;
            peg$currPos += 15;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e149);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f150(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUIMAGE2DMSARRAY() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 151;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 15) === peg$c150) {
            s1 = peg$c150;
            peg$currPos += 15;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e150);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f151(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSTRUCT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 152;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 6) === peg$c151) {
            s1 = peg$c151;
            peg$currPos += 6;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e151);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f152(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseVOID() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 153;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c152) {
            s1 = peg$c152;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e152);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f153(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseWHILE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 154;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c153) {
            s1 = peg$c153;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e153);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f154(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseINVARIANT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 155;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 9) === peg$c154) {
            s1 = peg$c154;
            peg$currPos += 9;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e154);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f155(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsePRECISE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 156;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c155) {
            s1 = peg$c155;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e155);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f156(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseHIGH_PRECISION() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 157;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c156) {
            s1 = peg$c156;
            peg$currPos += 5;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e156);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f157(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMEDIUM_PRECISION() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 158;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7) === peg$c157) {
            s1 = peg$c157;
            peg$currPos += 7;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e157);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f158(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseLOW_PRECISION() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 159;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c158) {
            s1 = peg$c158;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e158);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f159(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsePRECISION() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 160;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 9) === peg$c159) {
            s1 = peg$c159;
            peg$currPos += 9;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e159);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseterminal();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f160(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseFLOATCONSTANT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 161;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsefloating_constant();
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f161(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDOUBLECONSTANT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 162;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsefloating_constant();
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f162(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseINTCONSTANT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 163;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseinteger_constant();
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f163(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseUINTCONSTANT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 164;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseinteger_constant();
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f164(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseBOOLCONSTANT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 165;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c160) {
            s1 = peg$c160;
            peg$currPos += 4;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e160);
            }
        }
        if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 5) === peg$c161) {
                s1 = peg$c161;
                peg$currPos += 5;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e161);
                }
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f165(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsekeyword() {
        var s0;
        var key = peg$currPos * 309 + 166;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parseATTRIBUTE();
        if (s0 === peg$FAILED) {
            s0 = peg$parseVARYING();
            if (s0 === peg$FAILED) {
                s0 = peg$parseCONST();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseBOOL();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseFLOAT();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parseDOUBLE();
                            if (s0 === peg$FAILED) {
                                s0 = peg$parseINT();
                                if (s0 === peg$FAILED) {
                                    s0 = peg$parseUINT();
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$parseBREAK();
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$parseCONTINUE();
                                            if (s0 === peg$FAILED) {
                                                s0 = peg$parseDO();
                                                if (s0 === peg$FAILED) {
                                                    s0 = peg$parseELSE();
                                                    if (s0 === peg$FAILED) {
                                                        s0 = peg$parseFOR();
                                                        if (s0 === peg$FAILED) {
                                                            s0 = peg$parseIF();
                                                            if (s0 === peg$FAILED) {
                                                                s0 = peg$parseDISCARD();
                                                                if (s0 === peg$FAILED) {
                                                                    s0 = peg$parseRETURN();
                                                                    if (s0 === peg$FAILED) {
                                                                        s0 = peg$parseSWITCH();
                                                                        if (s0 === peg$FAILED) {
                                                                            s0 = peg$parseCASE();
                                                                            if (s0 === peg$FAILED) {
                                                                                s0 = peg$parseDEFAULT();
                                                                                if (s0 === peg$FAILED) {
                                                                                    s0 = peg$parseSUBROUTINE();
                                                                                    if (s0 === peg$FAILED) {
                                                                                        s0 = peg$parseBVEC2();
                                                                                        if (s0 === peg$FAILED) {
                                                                                            s0 = peg$parseBVEC3();
                                                                                            if (s0 === peg$FAILED) {
                                                                                                s0 = peg$parseBVEC4();
                                                                                                if (s0 === peg$FAILED) {
                                                                                                    s0 = peg$parseIVEC2();
                                                                                                    if (s0 === peg$FAILED) {
                                                                                                        s0 = peg$parseIVEC3();
                                                                                                        if (s0 === peg$FAILED) {
                                                                                                            s0 = peg$parseIVEC4();
                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                s0 = peg$parseUVEC2();
                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                    s0 = peg$parseUVEC3();
                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                        s0 = peg$parseUVEC4();
                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                            s0 = peg$parseVEC2();
                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                s0 = peg$parseVEC3();
                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                    s0 = peg$parseVEC4();
                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                        s0 = peg$parseMAT2();
                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                            s0 = peg$parseMAT3();
                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                s0 = peg$parseMAT4();
                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                    s0 = peg$parseCENTROID();
                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                        s0 = peg$parseIN();
                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                            s0 = peg$parseOUT();
                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                s0 = peg$parseINOUT();
                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                    s0 = peg$parseUNIFORM();
                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                        s0 = peg$parsePATCH();
                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                            s0 = peg$parseSAMPLE();
                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                s0 = peg$parseBUFFER();
                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                    s0 = peg$parseSHARED();
                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                        s0 = peg$parseCOHERENT();
                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                            s0 = peg$parseVOLATILE();
                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                s0 = peg$parseRESTRICT();
                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                    s0 = peg$parseREADONLY();
                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                        s0 = peg$parseWRITEONLY();
                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                            s0 = peg$parseDVEC2();
                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                s0 = peg$parseDVEC3();
                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                    s0 = peg$parseDVEC4();
                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                        s0 = peg$parseDMAT2();
                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                            s0 = peg$parseDMAT3();
                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                s0 = peg$parseDMAT4();
                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                    s0 = peg$parseNOPERSPECTIVE();
                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                        s0 = peg$parseFLAT();
                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                            s0 = peg$parseSMOOTH();
                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                s0 = peg$parseLAYOUT();
                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                    s0 = peg$parseMAT2X2();
                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                        s0 = peg$parseMAT2X3();
                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                            s0 = peg$parseMAT2X4();
                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                s0 = peg$parseMAT3X2();
                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                    s0 = peg$parseMAT3X3();
                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                        s0 = peg$parseMAT3X4();
                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                            s0 = peg$parseMAT4X2();
                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                s0 = peg$parseMAT4X3();
                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                    s0 = peg$parseMAT4X4();
                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                        s0 = peg$parseDMAT2X2();
                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                            s0 = peg$parseDMAT2X3();
                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                s0 = peg$parseDMAT2X4();
                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                    s0 = peg$parseDMAT3X2();
                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                        s0 = peg$parseDMAT3X3();
                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                            s0 = peg$parseDMAT3X4();
                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                s0 = peg$parseDMAT4X2();
                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                    s0 = peg$parseDMAT4X3();
                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                        s0 = peg$parseDMAT4X4();
                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                            s0 = peg$parseATOMIC_UINT();
                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                s0 = peg$parseSAMPLER1D();
                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseSAMPLER2D();
                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseSAMPLER3D();
                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseSAMPLERCUBE();
                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseSAMPLER1DSHADOW();
                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseSAMPLER2DSHADOW();
                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseSAMPLERCUBESHADOW();
                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseSAMPLER1DARRAY();
                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseSAMPLER2DARRAY();
                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseSAMPLER1DARRAYSHADOW();
                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseSAMPLER2DARRAYSHADOW();
                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseISAMPLER1D();
                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseISAMPLER2D();
                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseISAMPLER3D();
                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseISAMPLERCUBE();
                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseISAMPLER1DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseISAMPLER2DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUSAMPLER1D();
                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseUSAMPLER2D();
                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseUSAMPLER3D();
                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseUSAMPLERCUBE();
                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUSAMPLER1DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseUSAMPLER2DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseSAMPLER2DRECT();
                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseSAMPLER2DRECTSHADOW();
                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseISAMPLER2DRECT();
                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseUSAMPLER2DRECT();
                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseSAMPLERBUFFER();
                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseISAMPLERBUFFER();
                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUSAMPLERBUFFER();
                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseSAMPLERCUBEARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseSAMPLERCUBEARRAYSHADOW();
                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseISAMPLERCUBEARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUSAMPLERCUBEARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseSAMPLER2DMS();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseISAMPLER2DMS();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseUSAMPLER2DMS();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseSAMPLER2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseISAMPLER2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseUSAMPLER2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIMAGE1D();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseIIMAGE1D();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseUIMAGE1D();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIMAGE2D();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIIMAGE2D();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUIMAGE2D();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseIMAGE3D();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIIMAGE3D();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseUIMAGE3D();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseIMAGE2DRECT();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseIIMAGE2DRECT();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseUIMAGE2DRECT();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIMAGECUBE();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseIIMAGECUBE();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseUIMAGECUBE();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIMAGEBUFFER();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIIMAGEBUFFER();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUIMAGEBUFFER();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseIMAGE1DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIIMAGE1DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseUIMAGE1DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseIMAGE2DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseIIMAGE2DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseUIMAGE2DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIMAGECUBEARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseIIMAGECUBEARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseUIMAGECUBEARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIMAGE2DMS();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIIMAGE2DMS();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUIMAGE2DMS();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseIMAGE2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIIMAGE2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseUIMAGE2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseSTRUCT();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseVOID();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseWHILE();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseINVARIANT();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parsePRECISE();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseHIGH_PRECISION();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseMEDIUM_PRECISION();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseLOW_PRECISION();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parsePRECISION();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                }
                                                                                                                                                                                                            }
                                                                                                                                                                                                        }
                                                                                                                                                                                                    }
                                                                                                                                                                                                }
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        }
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e162);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseLEFT_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 167;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c162) {
            s1 = peg$c162;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e163);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f166(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseRIGHT_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 168;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c163) {
            s1 = peg$c163;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e164);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f167(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseINC_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 169;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c164) {
            s1 = peg$c164;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e165);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f168(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDEC_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 170;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c165) {
            s1 = peg$c165;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e166);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f169(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseLE_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 171;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c166) {
            s1 = peg$c166;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e167);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f170(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseGE_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 172;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c167) {
            s1 = peg$c167;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e168);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f171(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseEQ_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 173;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c168) {
            s1 = peg$c168;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e169);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f172(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseNE_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 174;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c169) {
            s1 = peg$c169;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e170);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f173(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseAND_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 175;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c170) {
            s1 = peg$c170;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e171);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f174(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseOR_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 176;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c171) {
            s1 = peg$c171;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e172);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f175(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseXOR_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 177;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c172) {
            s1 = peg$c172;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e173);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f176(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMUL_ASSIGN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 178;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c173) {
            s1 = peg$c173;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e174);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f177(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDIV_ASSIGN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 179;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c174) {
            s1 = peg$c174;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e175);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f178(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseADD_ASSIGN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 180;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c175) {
            s1 = peg$c175;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e176);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f179(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseMOD_ASSIGN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 181;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c176) {
            s1 = peg$c176;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e177);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f180(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseLEFT_ASSIGN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 182;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3) === peg$c177) {
            s1 = peg$c177;
            peg$currPos += 3;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e178);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f181(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseRIGHT_ASSIGN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 183;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3) === peg$c178) {
            s1 = peg$c178;
            peg$currPos += 3;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e179);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f182(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseAND_ASSIGN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 184;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c179) {
            s1 = peg$c179;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e180);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f183(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseXOR_ASSIGN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 185;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c180) {
            s1 = peg$c180;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e181);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f184(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseOR_ASSIGN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 186;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c181) {
            s1 = peg$c181;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e182);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f185(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSUB_ASSIGN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 187;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c182) {
            s1 = peg$c182;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e183);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f186(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseLEFT_PAREN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 188;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 40) {
            s1 = peg$c183;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e184);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f187(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseRIGHT_PAREN() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 189;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 41) {
            s1 = peg$c184;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e185);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f188(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseLEFT_BRACKET() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 190;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 91) {
            s1 = peg$c185;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e186);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f189(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseRIGHT_BRACKET() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 191;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 93) {
            s1 = peg$c186;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e187);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f190(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseLEFT_BRACE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 192;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c187;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e188);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f191(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseRIGHT_BRACE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 193;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 125) {
            s1 = peg$c188;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e189);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f192(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDOT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 194;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
            s1 = peg$c189;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e190);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f193(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseCOMMA() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 195;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
            s1 = peg$c190;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e191);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f194(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseCOLON() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 196;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 58) {
            s1 = peg$c191;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e192);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f195(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseEQUAL() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 197;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 61) {
            s1 = peg$c192;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e193);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f196(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSEMICOLON() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 198;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 59) {
            s1 = peg$c193;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e194);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f197(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseBANG() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 199;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 33) {
            s1 = peg$c194;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e195);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f198(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseDASH() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 200;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
            s1 = peg$c195;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e196);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f199(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseTILDE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 201;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 126) {
            s1 = peg$c196;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e197);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f200(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsePLUS() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 202;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 43) {
            s1 = peg$c197;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e198);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f201(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSTAR() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 203;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 42) {
            s1 = peg$c198;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e199);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f202(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseSLASH() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 204;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 47) {
            s1 = peg$c199;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e200);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f203(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsePERCENT() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 205;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 37) {
            s1 = peg$c200;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e201);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f204(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseLEFT_ANGLE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 206;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 60) {
            s1 = peg$c201;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e202);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f205(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseRIGHT_ANGLE() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 207;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 62) {
            s1 = peg$c202;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e203);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f206(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseVERTICAL_BAR() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 208;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 124) {
            s1 = peg$c203;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e204);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f207(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseCARET() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 209;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 94) {
            s1 = peg$c204;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e205);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f208(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseAMPERSAND() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 210;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 38) {
            s1 = peg$c205;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e206);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f209(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseQUESTION() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 211;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 63) {
            s1 = peg$c206;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e207);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f210(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseIDENTIFIER() {
        var s0, s1, s2, s3, s4, s5, s6;
        var key = peg$currPos * 309 + 212;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$parsekeyword();
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$currPos;
            if (peg$r0.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e208);
                }
            }
            if (s4 !== peg$FAILED) {
                s5 = [];
                if (peg$r1.test(input.charAt(peg$currPos))) {
                    s6 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e209);
                    }
                }
                while(s6 !== peg$FAILED){
                    s5.push(s6);
                    if (peg$r1.test(input.charAt(peg$currPos))) {
                        s6 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s6 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e209);
                        }
                    }
                }
                s4 = [
                    s4,
                    s5
                ];
                s3 = s4;
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
                s2 = input.substring(s2, peg$currPos);
            } else {
                s2 = s3;
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                peg$savedPos = s0;
                s0 = peg$f211(s2, s3);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseTYPE_NAME() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 213;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$parsekeyword();
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIDENTIFIER();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f212(s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinteger_constant() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 214;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parsehexadecimal_constant();
        if (s2 !== peg$FAILED) {
            s3 = peg$parseinteger_suffix();
            if (s3 === peg$FAILED) {
                s3 = null;
            }
            s2 = [
                s2,
                s3
            ];
            s1 = s2;
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
        } else {
            s0 = s1;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parsedecimal_constant();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseinteger_suffix();
                if (s3 === peg$FAILED) {
                    s3 = null;
                }
                s2 = [
                    s2,
                    s3
                ];
                s1 = s2;
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s0 = input.substring(s0, peg$currPos);
            } else {
                s0 = s1;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$currPos;
                s2 = peg$parseoctal_constant();
                if (s2 !== peg$FAILED) {
                    s3 = peg$parseinteger_suffix();
                    if (s3 === peg$FAILED) {
                        s3 = null;
                    }
                    s2 = [
                        s2,
                        s3
                    ];
                    s1 = s2;
                } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
                if (s1 !== peg$FAILED) {
                    s0 = input.substring(s0, peg$currPos);
                } else {
                    s0 = s1;
                }
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinteger_suffix() {
        var s0;
        var key = peg$currPos * 309 + 215;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        if (peg$r2.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e210);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsedecimal_constant() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 216;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        if (peg$r3.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e211);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parsedigit();
            while(s4 !== peg$FAILED){
                s3.push(s4);
                s4 = peg$parsedigit();
            }
            s2 = [
                s2,
                s3
            ];
            s1 = s2;
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
        } else {
            s0 = s1;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseoctal_constant() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 217;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 48) {
            s1 = peg$c207;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e212);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            if (peg$r4.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e213);
                }
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                if (peg$r4.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e213);
                    }
                }
            }
            s1 = [
                s1,
                s2
            ];
            s0 = s1;
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsehexadecimal_constant() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 218;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 48) {
            s1 = peg$c207;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e212);
            }
        }
        if (s1 !== peg$FAILED) {
            if (peg$r5.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e214);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = [];
                if (peg$r6.test(input.charAt(peg$currPos))) {
                    s4 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e215);
                    }
                }
                while(s4 !== peg$FAILED){
                    s3.push(s4);
                    if (peg$r6.test(input.charAt(peg$currPos))) {
                        s4 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e215);
                        }
                    }
                }
                s1 = [
                    s1,
                    s2,
                    s3
                ];
                s0 = s1;
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsedigit() {
        var s0;
        var key = peg$currPos * 309 + 219;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        if (peg$r7.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e216);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefloating_constant() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 220;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parsefractional_constant();
        if (s2 !== peg$FAILED) {
            s3 = peg$parseexponent_part();
            if (s3 === peg$FAILED) {
                s3 = null;
            }
            s4 = peg$parsefloating_suffix();
            if (s4 === peg$FAILED) {
                s4 = null;
            }
            s2 = [
                s2,
                s3,
                s4
            ];
            s1 = s2;
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
        } else {
            s0 = s1;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parsedigit_sequence();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseexponent_part();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parsefloating_suffix();
                    if (s4 === peg$FAILED) {
                        s4 = null;
                    }
                    s2 = [
                        s2,
                        s3,
                        s4
                    ];
                    s1 = s2;
                } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s0 = input.substring(s0, peg$currPos);
            } else {
                s0 = s1;
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefractional_constant() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 221;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parsedigit_sequence();
        if (s2 === peg$FAILED) {
            s2 = null;
        }
        if (input.charCodeAt(peg$currPos) === 46) {
            s3 = peg$c189;
            peg$currPos++;
        } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e190);
            }
        }
        if (s3 !== peg$FAILED) {
            s4 = peg$parsedigit_sequence();
            if (s4 === peg$FAILED) {
                s4 = null;
            }
            s2 = [
                s2,
                s3,
                s4
            ];
            s1 = s2;
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
        } else {
            s0 = s1;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseexponent_part() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 222;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$currPos;
        if (peg$r8.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e218);
            }
        }
        if (s2 !== peg$FAILED) {
            if (peg$r9.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e219);
                }
            }
            if (s3 === peg$FAILED) {
                s3 = null;
            }
            s4 = peg$parsedigit_sequence();
            if (s4 !== peg$FAILED) {
                s2 = [
                    s2,
                    s3,
                    s4
                ];
                s1 = s2;
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
        } else {
            s0 = s1;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e217);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsedigit_sequence() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 223;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsedigit();
        if (s2 !== peg$FAILED) {
            while(s2 !== peg$FAILED){
                s1.push(s2);
                s2 = peg$parsedigit();
            }
        } else {
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
        } else {
            s0 = s1;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefloating_suffix() {
        var s0;
        var key = peg$currPos * 309 + 224;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        if (peg$r10.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e220);
            }
        }
        if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c208) {
                s0 = peg$c208;
                peg$currPos += 2;
            } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e221);
                }
            }
            if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c209) {
                    s0 = peg$c209;
                    peg$currPos += 2;
                } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e222);
                    }
                }
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseprimary_expression() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 225;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parseFLOATCONSTANT();
        if (s0 === peg$FAILED) {
            s0 = peg$parseINTCONSTANT();
            if (s0 === peg$FAILED) {
                s0 = peg$parseUINTCONSTANT();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseBOOLCONSTANT();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseDOUBLECONSTANT();
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parseLEFT_PAREN();
                            if (s1 !== peg$FAILED) {
                                s2 = peg$parseexpression();
                                if (s2 !== peg$FAILED) {
                                    s3 = peg$parseRIGHT_PAREN();
                                    if (s3 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s0 = peg$f213(s1, s2, s3);
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                s1 = peg$parseIDENTIFIER();
                                if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$f214(s1);
                                }
                                s0 = s1;
                            }
                        }
                    }
                }
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e223);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsepostfix_expression() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 226;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parsefunction_call();
        if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parsepostfix_expression_suffix();
            while(s4 !== peg$FAILED){
                s3.push(s4);
                s4 = peg$parsepostfix_expression_suffix();
            }
            s2 = [
                s2,
                s3
            ];
            s1 = s2;
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 === peg$FAILED) {
            s1 = peg$currPos;
            s2 = peg$parseprimary_expression();
            if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parsepostfix_expression_suffix();
                while(s4 !== peg$FAILED){
                    s3.push(s4);
                    s4 = peg$parsepostfix_expression_suffix();
                }
                s2 = [
                    s2,
                    s3
                ];
                s1 = s2;
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
        }
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f215(s1);
        }
        s0 = s1;
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsepostfix_expression_suffix() {
        var s0;
        var key = peg$currPos * 309 + 227;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parseinteger_index();
        if (s0 === peg$FAILED) {
            s0 = peg$parsefield_selection();
            if (s0 === peg$FAILED) {
                s0 = peg$parseINC_OP();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseDEC_OP();
                }
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinteger_index() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 228;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseLEFT_BRACKET();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseexpression();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseRIGHT_BRACKET();
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f216(s1, s2, s3);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefield_selection() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 229;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseDOT();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIDENTIFIER();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f217(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_call() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 230;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsefunction_identifier();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsefunction_arguments();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            s3 = peg$parseRIGHT_PAREN();
            if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f218(s1, s2, s3);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_arguments() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 231;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseVOID();
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f219(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseassignment_expression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parseCOMMA();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseassignment_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while(s3 !== peg$FAILED){
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parseCOMMA();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parseassignment_expression();
                        if (s5 !== peg$FAILED) {
                            s4 = [
                                s4,
                                s5
                            ];
                            s3 = s4;
                        } else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f220(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_identifier() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 232;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parsechained_function_call();
        if (s2 !== peg$FAILED) {
            s3 = peg$parsefunction_suffix();
            if (s3 !== peg$FAILED) {
                s4 = peg$parseLEFT_PAREN();
                if (s4 !== peg$FAILED) {
                    peg$savedPos = s1;
                    s1 = peg$f221(s2, s3, s4);
                } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 === peg$FAILED) {
            s1 = peg$currPos;
            s2 = peg$parsetype_specifier();
            if (s2 !== peg$FAILED) {
                s3 = peg$parsefunction_suffix();
                if (s3 === peg$FAILED) {
                    s3 = null;
                }
                s4 = peg$parseLEFT_PAREN();
                if (s4 !== peg$FAILED) {
                    peg$savedPos = s1;
                    s1 = peg$f222(s2, s3, s4);
                } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
        }
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f223(s1);
        }
        s0 = s1;
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_suffix() {
        var s0;
        var key = peg$currPos * 309 + 233;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parseinteger_index();
        if (s0 === peg$FAILED) {
            s0 = peg$parsefield_selection();
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsechained_function_call() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 234;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsetype_specifier();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseLEFT_PAREN();
            if (s2 !== peg$FAILED) {
                s3 = peg$parsefunction_arguments();
                if (s3 === peg$FAILED) {
                    s3 = null;
                }
                s4 = peg$parseRIGHT_PAREN();
                if (s4 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f224(s1, s2, s3, s4);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseunary_expression() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 235;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parsepostfix_expression();
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseINC_OP();
            if (s1 === peg$FAILED) {
                s1 = peg$parseDEC_OP();
                if (s1 === peg$FAILED) {
                    s1 = peg$parsePLUS();
                    if (s1 === peg$FAILED) {
                        s1 = peg$parseDASH();
                        if (s1 === peg$FAILED) {
                            s1 = peg$parseBANG();
                            if (s1 === peg$FAILED) {
                                s1 = peg$parseTILDE();
                            }
                        }
                    }
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseunary_expression();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f225(s1, s2);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e224);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsemultiplicative_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 236;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseunary_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseSTAR();
            if (s4 === peg$FAILED) {
                s4 = peg$parseSLASH();
                if (s4 === peg$FAILED) {
                    s4 = peg$parsePERCENT();
                }
            }
            if (s4 !== peg$FAILED) {
                s5 = peg$parseunary_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseSTAR();
                if (s4 === peg$FAILED) {
                    s4 = peg$parseSLASH();
                    if (s4 === peg$FAILED) {
                        s4 = peg$parsePERCENT();
                    }
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseunary_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f226(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseadditive_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 237;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsemultiplicative_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parsePLUS();
            if (s4 === peg$FAILED) {
                s4 = peg$parseDASH();
            }
            if (s4 !== peg$FAILED) {
                s5 = peg$parsemultiplicative_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parsePLUS();
                if (s4 === peg$FAILED) {
                    s4 = peg$parseDASH();
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parsemultiplicative_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f227(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseshift_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 238;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseadditive_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseRIGHT_OP();
            if (s4 === peg$FAILED) {
                s4 = peg$parseLEFT_OP();
            }
            if (s4 !== peg$FAILED) {
                s5 = peg$parseadditive_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseRIGHT_OP();
                if (s4 === peg$FAILED) {
                    s4 = peg$parseLEFT_OP();
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseadditive_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f228(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parserelational_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 239;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseshift_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseLE_OP();
            if (s4 === peg$FAILED) {
                s4 = peg$parseGE_OP();
                if (s4 === peg$FAILED) {
                    s4 = peg$parseLEFT_ANGLE();
                    if (s4 === peg$FAILED) {
                        s4 = peg$parseRIGHT_ANGLE();
                    }
                }
            }
            if (s4 !== peg$FAILED) {
                s5 = peg$parseshift_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseLE_OP();
                if (s4 === peg$FAILED) {
                    s4 = peg$parseGE_OP();
                    if (s4 === peg$FAILED) {
                        s4 = peg$parseLEFT_ANGLE();
                        if (s4 === peg$FAILED) {
                            s4 = peg$parseRIGHT_ANGLE();
                        }
                    }
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseshift_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f229(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseequality_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 240;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parserelational_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseEQ_OP();
            if (s4 === peg$FAILED) {
                s4 = peg$parseNE_OP();
            }
            if (s4 !== peg$FAILED) {
                s5 = peg$parserelational_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseEQ_OP();
                if (s4 === peg$FAILED) {
                    s4 = peg$parseNE_OP();
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parserelational_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f230(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e225);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseand_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 241;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseequality_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseAMPERSAND();
            if (s4 !== peg$FAILED) {
                s5 = peg$parseequality_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseAMPERSAND();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseequality_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f231(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e226);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseexclusive_or_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 242;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseand_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseCARET();
            if (s4 !== peg$FAILED) {
                s5 = peg$parseand_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseCARET();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseand_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f232(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinclusive_or_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 243;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseexclusive_or_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseVERTICAL_BAR();
            if (s4 !== peg$FAILED) {
                s5 = peg$parseexclusive_or_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseVERTICAL_BAR();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseexclusive_or_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f233(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parselogical_and_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 244;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseinclusive_or_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseAND_OP();
            if (s4 !== peg$FAILED) {
                s5 = peg$parseinclusive_or_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseAND_OP();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseinclusive_or_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f234(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parselogical_xor_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 245;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parselogical_and_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseXOR_OP();
            if (s4 !== peg$FAILED) {
                s5 = peg$parselogical_and_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseXOR_OP();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parselogical_and_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f235(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parselogical_or_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 246;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parselogical_xor_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseOR_OP();
            if (s4 !== peg$FAILED) {
                s5 = peg$parselogical_xor_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseOR_OP();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parselogical_xor_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f236(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseternary_expression() {
        var s0, s1, s2, s3, s4, s5, s6;
        var key = peg$currPos * 309 + 247;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parselogical_or_expression();
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$parseQUESTION();
            if (s3 !== peg$FAILED) {
                s4 = peg$parseexpression();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseCOLON();
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parseassignment_expression();
                        if (s6 !== peg$FAILED) {
                            peg$savedPos = s2;
                            s2 = peg$f237(s1, s3, s4, s5, s6);
                        } else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
            } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            peg$savedPos = s0;
            s0 = peg$f238(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseassignment_expression() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 248;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseunary_expression();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseassignment_operator();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseassignment_expression();
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f239(s1, s2, s3);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$parseternary_expression();
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseassignment_operator() {
        var s0;
        var key = peg$currPos * 309 + 249;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parseEQUAL();
        if (s0 === peg$FAILED) {
            s0 = peg$parseMUL_ASSIGN();
            if (s0 === peg$FAILED) {
                s0 = peg$parseDIV_ASSIGN();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseMOD_ASSIGN();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseADD_ASSIGN();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parseSUB_ASSIGN();
                            if (s0 === peg$FAILED) {
                                s0 = peg$parseLEFT_ASSIGN();
                                if (s0 === peg$FAILED) {
                                    s0 = peg$parseRIGHT_ASSIGN();
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$parseAND_ASSIGN();
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$parseXOR_ASSIGN();
                                            if (s0 === peg$FAILED) {
                                                s0 = peg$parseOR_ASSIGN();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e227);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseexpression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 250;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseassignment_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseCOMMA();
            if (s4 !== peg$FAILED) {
                s5 = peg$parseassignment_expression();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseCOMMA();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseassignment_expression();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f240(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e228);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsedeclaration_statement() {
        var s0, s1;
        var key = peg$currPos * 309 + 251;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsedeclaration();
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f241(s1);
        }
        s0 = s1;
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsedeclaration() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 252;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsefunction_prototype_no_new_scope();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseSEMICOLON();
            if (s2 !== peg$FAILED) {
                s1 = [
                    s1,
                    s2
                ];
                s0 = s1;
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseprecision_declarator();
            if (s1 !== peg$FAILED) {
                s2 = peg$parseSEMICOLON();
                if (s2 !== peg$FAILED) {
                    s1 = [
                        s1,
                        s2
                    ];
                    s0 = s1;
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseinterface_declarator();
                if (s1 !== peg$FAILED) {
                    s2 = peg$parseSEMICOLON();
                    if (s2 !== peg$FAILED) {
                        s1 = [
                            s1,
                            s2
                        ];
                        s0 = s1;
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parsequalifier_declarator();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parseSEMICOLON();
                        if (s2 !== peg$FAILED) {
                            s1 = [
                                s1,
                                s2
                            ];
                            s0 = s1;
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parseinit_declarator_list();
                        if (s1 !== peg$FAILED) {
                            s2 = peg$parseSEMICOLON();
                            if (s2 !== peg$FAILED) {
                                s1 = [
                                    s1,
                                    s2
                                ];
                                s0 = s1;
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                }
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsequalifier_declarator() {
        var s0, s1, s2, s3, s4, s5, s6;
        var key = peg$currPos * 309 + 253;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsetype_qualifiers();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIDENTIFIER();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            s3 = [];
            s4 = peg$currPos;
            s5 = peg$parseCOMMA();
            if (s5 !== peg$FAILED) {
                s6 = peg$parseIDENTIFIER();
                if (s6 !== peg$FAILED) {
                    s5 = [
                        s5,
                        s6
                    ];
                    s4 = s5;
                } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
            } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
            }
            while(s4 !== peg$FAILED){
                s3.push(s4);
                s4 = peg$currPos;
                s5 = peg$parseCOMMA();
                if (s5 !== peg$FAILED) {
                    s6 = peg$parseIDENTIFIER();
                    if (s6 !== peg$FAILED) {
                        s5 = [
                            s5,
                            s6
                        ];
                        s4 = s5;
                    } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f242(s1, s2, s3);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinterface_declarator() {
        var s0, s1, s2, s3, s4, s5, s6;
        var key = peg$currPos * 309 + 254;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsetype_qualifiers();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIDENTIFIER();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseLEFT_BRACE();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parsestruct_declaration_list();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parseRIGHT_BRACE();
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parsequantified_identifier();
                            if (s6 === peg$FAILED) {
                                s6 = null;
                            }
                            peg$savedPos = s0;
                            s0 = peg$f243(s1, s2, s3, s4, s5, s6);
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseprecision_declarator() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 255;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parsePRECISION();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseprecision_qualifier();
            if (s2 !== peg$FAILED) {
                s3 = peg$parsetype_specifier();
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f244(s1, s2, s3);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e229);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_prototype_new_scope() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 256;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parsefunction_header_new_scope();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsefunction_parameters();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            s3 = peg$parseRIGHT_PAREN();
            if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f245(s1, s2, s3);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e230);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_header_new_scope() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 257;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parsefully_specified_type();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIDENTIFIER();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseLEFT_PAREN();
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f246(s1, s2, s3);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e231);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_prototype_no_new_scope() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 258;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parsefunction_header_no_new_scope();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsefunction_parameters();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            s3 = peg$parseRIGHT_PAREN();
            if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f247(s1, s2, s3);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e232);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_header_no_new_scope() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 259;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parsefully_specified_type();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIDENTIFIER();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseLEFT_PAREN();
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f248(s1, s2, s3);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e233);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_parameters() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 260;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseparameter_declaration();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseCOMMA();
            if (s4 !== peg$FAILED) {
                s5 = peg$parseparameter_declaration();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseCOMMA();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseparameter_declaration();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f249(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e234);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseparameter_declaration() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 261;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseparameter_qualifier();
        while(s2 !== peg$FAILED){
            s1.push(s2);
            s2 = peg$parseparameter_qualifier();
        }
        s2 = peg$parseparameter_declarator();
        if (s2 === peg$FAILED) {
            s2 = peg$parsetype_specifier();
        }
        if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f250(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e235);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseparameter_declarator() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 262;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parsetype_specifier();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIDENTIFIER();
            if (s2 !== peg$FAILED) {
                s3 = peg$parsearray_specifier();
                if (s3 === peg$FAILED) {
                    s3 = null;
                }
                peg$savedPos = s0;
                s0 = peg$f251(s1, s2, s3);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e236);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseparameter_qualifier() {
        var s0;
        var key = peg$currPos * 309 + 263;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parseCONST();
        if (s0 === peg$FAILED) {
            s0 = peg$parseIN();
            if (s0 === peg$FAILED) {
                s0 = peg$parseOUT();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseINOUT();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parsememory_qualifier();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parseprecision_qualifier();
                        }
                    }
                }
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsememory_qualifier() {
        var s0;
        var key = peg$currPos * 309 + 264;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parseCOHERENT();
        if (s0 === peg$FAILED) {
            s0 = peg$parseVOLATILE();
            if (s0 === peg$FAILED) {
                s0 = peg$parseRESTRICT();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseREADONLY();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseWRITEONLY();
                    }
                }
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinit_declarator_list() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 265;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseinitial_declaration();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseCOMMA();
            if (s4 !== peg$FAILED) {
                s5 = peg$parsesubsequent_declaration();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            while(s3 !== peg$FAILED){
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parseCOMMA();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parsesubsequent_declaration();
                    if (s5 !== peg$FAILED) {
                        s4 = [
                            s4,
                            s5
                        ];
                        s3 = s4;
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            peg$savedPos = s0;
            s0 = peg$f252(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsesubsequent_declaration() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 266;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseIDENTIFIER();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsearray_specifier();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            s3 = peg$currPos;
            s4 = peg$parseEQUAL();
            if (s4 !== peg$FAILED) {
                s5 = peg$parseinitializer();
                if (s5 !== peg$FAILED) {
                    s4 = [
                        s4,
                        s5
                    ];
                    s3 = s4;
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
            if (s3 === peg$FAILED) {
                s3 = null;
            }
            peg$savedPos = s0;
            s0 = peg$f253(s1, s2, s3);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinitial_declaration() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        var key = peg$currPos * 309 + 267;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsefully_specified_type();
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$parseIDENTIFIER();
            if (s3 !== peg$FAILED) {
                s4 = peg$parsearray_specifier();
                if (s4 === peg$FAILED) {
                    s4 = null;
                }
                s5 = peg$currPos;
                s6 = peg$parseEQUAL();
                if (s6 !== peg$FAILED) {
                    s7 = peg$parseinitializer();
                    if (s7 !== peg$FAILED) {
                        s6 = [
                            s6,
                            s7
                        ];
                        s5 = s6;
                    } else {
                        peg$currPos = s5;
                        s5 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                }
                if (s5 === peg$FAILED) {
                    s5 = null;
                }
                s3 = [
                    s3,
                    s4,
                    s5
                ];
                s2 = s3;
            } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            peg$savedPos = s0;
            s0 = peg$f254(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefully_specified_type() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 268;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsetype_qualifiers();
        if (s1 === peg$FAILED) {
            s1 = null;
        }
        s2 = peg$parsetype_specifier();
        if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f255(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parselayout_qualifier() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8;
        var key = peg$currPos * 309 + 269;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseLAYOUT();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseLEFT_PAREN();
            if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                s4 = peg$parselayout_qualifier_id();
                if (s4 !== peg$FAILED) {
                    s5 = [];
                    s6 = peg$currPos;
                    s7 = peg$parseCOMMA();
                    if (s7 !== peg$FAILED) {
                        s8 = peg$parselayout_qualifier_id();
                        if (s8 !== peg$FAILED) {
                            s7 = [
                                s7,
                                s8
                            ];
                            s6 = s7;
                        } else {
                            peg$currPos = s6;
                            s6 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                    }
                    while(s6 !== peg$FAILED){
                        s5.push(s6);
                        s6 = peg$currPos;
                        s7 = peg$parseCOMMA();
                        if (s7 !== peg$FAILED) {
                            s8 = peg$parselayout_qualifier_id();
                            if (s8 !== peg$FAILED) {
                                s7 = [
                                    s7,
                                    s8
                                ];
                                s6 = s7;
                            } else {
                                peg$currPos = s6;
                                s6 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s6;
                            s6 = peg$FAILED;
                        }
                    }
                    peg$savedPos = s3;
                    s3 = peg$f256(s1, s2, s4, s5);
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseRIGHT_PAREN();
                    if (s4 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f257(s1, s2, s3, s4);
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parselayout_qualifier_id() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 270;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseIDENTIFIER();
        if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$parseEQUAL();
            if (s3 !== peg$FAILED) {
                s4 = peg$parseternary_expression();
                if (s4 !== peg$FAILED) {
                    s3 = [
                        s3,
                        s4
                    ];
                    s2 = s3;
                } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
            } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            peg$savedPos = s0;
            s0 = peg$f258(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$parseSHARED();
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsetype_qualifiers() {
        var s0, s1;
        var key = peg$currPos * 309 + 271;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = [];
        s1 = peg$parsesingle_type_qualifier();
        if (s1 !== peg$FAILED) {
            while(s1 !== peg$FAILED){
                s0.push(s1);
                s1 = peg$parsesingle_type_qualifier();
            }
        } else {
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsesingle_type_qualifier() {
        var s0;
        var key = peg$currPos * 309 + 272;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parsestorage_qualifier();
        if (s0 === peg$FAILED) {
            s0 = peg$parselayout_qualifier();
            if (s0 === peg$FAILED) {
                s0 = peg$parseprecision_qualifier();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseinterpolation_qualifier();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseINVARIANT();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parsePRECISE();
                        }
                    }
                }
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e237);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinterpolation_qualifier() {
        var s0;
        var key = peg$currPos * 309 + 273;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parseSMOOTH();
        if (s0 === peg$FAILED) {
            s0 = peg$parseFLAT();
            if (s0 === peg$FAILED) {
                s0 = peg$parseNOPERSPECTIVE();
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e238);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsestorage_qualifier() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8;
        var key = peg$currPos * 309 + 274;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parseCONST();
        if (s0 === peg$FAILED) {
            s0 = peg$parseINOUT();
            if (s0 === peg$FAILED) {
                s0 = peg$parseIN();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseOUT();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseCENTROID();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parsePATCH();
                            if (s0 === peg$FAILED) {
                                s0 = peg$parseSAMPLE();
                                if (s0 === peg$FAILED) {
                                    s0 = peg$parseUNIFORM();
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$parseBUFFER();
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$parseSHARED();
                                            if (s0 === peg$FAILED) {
                                                s0 = peg$parseCOHERENT();
                                                if (s0 === peg$FAILED) {
                                                    s0 = peg$parseVOLATILE();
                                                    if (s0 === peg$FAILED) {
                                                        s0 = peg$parseRESTRICT();
                                                        if (s0 === peg$FAILED) {
                                                            s0 = peg$parseREADONLY();
                                                            if (s0 === peg$FAILED) {
                                                                s0 = peg$parseWRITEONLY();
                                                                if (s0 === peg$FAILED) {
                                                                    s0 = peg$parseVARYING();
                                                                    if (s0 === peg$FAILED) {
                                                                        s0 = peg$parseATTRIBUTE();
                                                                        if (s0 === peg$FAILED) {
                                                                            s0 = peg$currPos;
                                                                            s1 = peg$parseSUBROUTINE();
                                                                            if (s1 !== peg$FAILED) {
                                                                                s2 = peg$currPos;
                                                                                s3 = peg$parseLEFT_PAREN();
                                                                                if (s3 !== peg$FAILED) {
                                                                                    s4 = peg$parseTYPE_NAME();
                                                                                    if (s4 !== peg$FAILED) {
                                                                                        s5 = [];
                                                                                        s6 = peg$currPos;
                                                                                        s7 = peg$parseCOMMA();
                                                                                        if (s7 !== peg$FAILED) {
                                                                                            s8 = peg$parseTYPE_NAME();
                                                                                            if (s8 !== peg$FAILED) {
                                                                                                s7 = [
                                                                                                    s7,
                                                                                                    s8
                                                                                                ];
                                                                                                s6 = s7;
                                                                                            } else {
                                                                                                peg$currPos = s6;
                                                                                                s6 = peg$FAILED;
                                                                                            }
                                                                                        } else {
                                                                                            peg$currPos = s6;
                                                                                            s6 = peg$FAILED;
                                                                                        }
                                                                                        while(s6 !== peg$FAILED){
                                                                                            s5.push(s6);
                                                                                            s6 = peg$currPos;
                                                                                            s7 = peg$parseCOMMA();
                                                                                            if (s7 !== peg$FAILED) {
                                                                                                s8 = peg$parseTYPE_NAME();
                                                                                                if (s8 !== peg$FAILED) {
                                                                                                    s7 = [
                                                                                                        s7,
                                                                                                        s8
                                                                                                    ];
                                                                                                    s6 = s7;
                                                                                                } else {
                                                                                                    peg$currPos = s6;
                                                                                                    s6 = peg$FAILED;
                                                                                                }
                                                                                            } else {
                                                                                                peg$currPos = s6;
                                                                                                s6 = peg$FAILED;
                                                                                            }
                                                                                        }
                                                                                        s6 = peg$parseRIGHT_PAREN();
                                                                                        if (s6 !== peg$FAILED) {
                                                                                            peg$savedPos = s2;
                                                                                            s2 = peg$f259(s1, s3, s4, s5, s6);
                                                                                        } else {
                                                                                            peg$currPos = s2;
                                                                                            s2 = peg$FAILED;
                                                                                        }
                                                                                    } else {
                                                                                        peg$currPos = s2;
                                                                                        s2 = peg$FAILED;
                                                                                    }
                                                                                } else {
                                                                                    peg$currPos = s2;
                                                                                    s2 = peg$FAILED;
                                                                                }
                                                                                if (s2 === peg$FAILED) {
                                                                                    s2 = null;
                                                                                }
                                                                                peg$savedPos = s0;
                                                                                s0 = peg$f260(s1, s2);
                                                                            } else {
                                                                                peg$currPos = s0;
                                                                                s0 = peg$FAILED;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e239);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsetype_specifier() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 275;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parsetype_specifier_nonarray();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsearray_specifier();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            peg$savedPos = s0;
            s0 = peg$f261(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e240);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsetype_specifier_nonarray() {
        var s0;
        var key = peg$currPos * 309 + 276;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parseVOID();
        if (s0 === peg$FAILED) {
            s0 = peg$parseFLOAT();
            if (s0 === peg$FAILED) {
                s0 = peg$parseDOUBLE();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseINT();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseUINT();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parseBOOL();
                            if (s0 === peg$FAILED) {
                                s0 = peg$parseVEC2();
                                if (s0 === peg$FAILED) {
                                    s0 = peg$parseVEC3();
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$parseVEC4();
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$parseDVEC2();
                                            if (s0 === peg$FAILED) {
                                                s0 = peg$parseDVEC3();
                                                if (s0 === peg$FAILED) {
                                                    s0 = peg$parseDVEC4();
                                                    if (s0 === peg$FAILED) {
                                                        s0 = peg$parseBVEC2();
                                                        if (s0 === peg$FAILED) {
                                                            s0 = peg$parseBVEC3();
                                                            if (s0 === peg$FAILED) {
                                                                s0 = peg$parseBVEC4();
                                                                if (s0 === peg$FAILED) {
                                                                    s0 = peg$parseIVEC2();
                                                                    if (s0 === peg$FAILED) {
                                                                        s0 = peg$parseIVEC3();
                                                                        if (s0 === peg$FAILED) {
                                                                            s0 = peg$parseIVEC4();
                                                                            if (s0 === peg$FAILED) {
                                                                                s0 = peg$parseUVEC2();
                                                                                if (s0 === peg$FAILED) {
                                                                                    s0 = peg$parseUVEC3();
                                                                                    if (s0 === peg$FAILED) {
                                                                                        s0 = peg$parseUVEC4();
                                                                                        if (s0 === peg$FAILED) {
                                                                                            s0 = peg$parseMAT2();
                                                                                            if (s0 === peg$FAILED) {
                                                                                                s0 = peg$parseMAT3();
                                                                                                if (s0 === peg$FAILED) {
                                                                                                    s0 = peg$parseMAT4();
                                                                                                    if (s0 === peg$FAILED) {
                                                                                                        s0 = peg$parseMAT2X2();
                                                                                                        if (s0 === peg$FAILED) {
                                                                                                            s0 = peg$parseMAT2X3();
                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                s0 = peg$parseMAT2X4();
                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                    s0 = peg$parseMAT3X2();
                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                        s0 = peg$parseMAT3X3();
                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                            s0 = peg$parseMAT3X4();
                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                s0 = peg$parseMAT4X2();
                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                    s0 = peg$parseMAT4X3();
                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                        s0 = peg$parseMAT4X4();
                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                            s0 = peg$parseDMAT2();
                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                s0 = peg$parseDMAT3();
                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                    s0 = peg$parseDMAT4();
                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                        s0 = peg$parseDMAT2X2();
                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                            s0 = peg$parseDMAT2X3();
                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                s0 = peg$parseDMAT2X4();
                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                    s0 = peg$parseDMAT3X2();
                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                        s0 = peg$parseDMAT3X3();
                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                            s0 = peg$parseDMAT3X4();
                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                s0 = peg$parseDMAT4X2();
                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                    s0 = peg$parseDMAT4X3();
                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                        s0 = peg$parseDMAT4X4();
                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                            s0 = peg$parseATOMIC_UINT();
                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                s0 = peg$parseSAMPLER1D();
                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                    s0 = peg$parseSAMPLER2D();
                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                        s0 = peg$parseSAMPLER3D();
                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                            s0 = peg$parseSAMPLERCUBE();
                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                s0 = peg$parseSAMPLER1DSHADOW();
                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                    s0 = peg$parseSAMPLER2DSHADOW();
                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                        s0 = peg$parseSAMPLERCUBESHADOW();
                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                            s0 = peg$parseSAMPLER1DARRAY();
                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                s0 = peg$parseSAMPLER2DARRAY();
                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                    s0 = peg$parseSAMPLER1DARRAYSHADOW();
                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                        s0 = peg$parseSAMPLER2DARRAYSHADOW();
                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                            s0 = peg$parseSAMPLERCUBEARRAY();
                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                s0 = peg$parseSAMPLERCUBEARRAYSHADOW();
                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                    s0 = peg$parseISAMPLER1D();
                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                        s0 = peg$parseISAMPLER2D();
                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                            s0 = peg$parseISAMPLER3D();
                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                s0 = peg$parseISAMPLERCUBE();
                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                    s0 = peg$parseISAMPLER1DARRAY();
                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                        s0 = peg$parseISAMPLER2DARRAY();
                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                            s0 = peg$parseISAMPLERCUBEARRAY();
                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                s0 = peg$parseUSAMPLER1D();
                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                    s0 = peg$parseUSAMPLER2D();
                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                        s0 = peg$parseUSAMPLER3D();
                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                            s0 = peg$parseUSAMPLERCUBE();
                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                s0 = peg$parseUSAMPLER1DARRAY();
                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                    s0 = peg$parseUSAMPLER2DARRAY();
                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                        s0 = peg$parseUSAMPLERCUBEARRAY();
                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                            s0 = peg$parseSAMPLER2DRECT();
                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                s0 = peg$parseSAMPLER2DRECTSHADOW();
                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                    s0 = peg$parseISAMPLER2DRECT();
                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                        s0 = peg$parseUSAMPLER2DRECT();
                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                            s0 = peg$parseSAMPLERBUFFER();
                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                s0 = peg$parseISAMPLERBUFFER();
                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUSAMPLERBUFFER();
                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseSAMPLER2DMS();
                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseISAMPLER2DMS();
                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseUSAMPLER2DMS();
                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseSAMPLER2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseISAMPLER2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseUSAMPLER2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIMAGE1D();
                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseIIMAGE1D();
                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseUIMAGE1D();
                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIMAGE2D();
                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIIMAGE2D();
                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUIMAGE2D();
                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseIMAGE3D();
                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIIMAGE3D();
                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseUIMAGE3D();
                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseIMAGE2DRECT();
                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseIIMAGE2DRECT();
                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseUIMAGE2DRECT();
                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIMAGECUBE();
                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseIIMAGECUBE();
                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseUIMAGECUBE();
                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIMAGEBUFFER();
                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIIMAGEBUFFER();
                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUIMAGEBUFFER();
                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseIMAGE1DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIIMAGE1DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseUIMAGE1DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseIMAGE2DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseIIMAGE2DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseUIMAGE2DARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIMAGECUBEARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseIIMAGECUBEARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseUIMAGECUBEARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIMAGE2DMS();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseIIMAGE2DMS();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parseUIMAGE2DMS();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseIMAGE2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            s0 = peg$parseIIMAGE2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                s0 = peg$parseUIMAGE2DMSARRAY();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    s0 = peg$parsestruct_specifier();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        s0 = peg$parseTYPE_NAME();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                }
                                                                                                                                                                                                            }
                                                                                                                                                                                                        }
                                                                                                                                                                                                    }
                                                                                                                                                                                                }
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        }
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e240);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsearray_specifier() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 277;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$currPos;
        s3 = peg$parseLEFT_BRACKET();
        if (s3 !== peg$FAILED) {
            s4 = peg$parseternary_expression();
            if (s4 === peg$FAILED) {
                s4 = null;
            }
            s5 = peg$parseRIGHT_BRACKET();
            if (s5 !== peg$FAILED) {
                peg$savedPos = s2;
                s2 = peg$f262(s3, s4, s5);
            } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
            }
        } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
            while(s2 !== peg$FAILED){
                s1.push(s2);
                s2 = peg$currPos;
                s3 = peg$parseLEFT_BRACKET();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseternary_expression();
                    if (s4 === peg$FAILED) {
                        s4 = null;
                    }
                    s5 = peg$parseRIGHT_BRACKET();
                    if (s5 !== peg$FAILED) {
                        peg$savedPos = s2;
                        s2 = peg$f262(s3, s4, s5);
                    } else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
            }
        } else {
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f263(s1);
        }
        s0 = s1;
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e241);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseprecision_qualifier() {
        var s0;
        var key = peg$currPos * 309 + 278;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parseHIGH_PRECISION();
        if (s0 === peg$FAILED) {
            s0 = peg$parseMEDIUM_PRECISION();
            if (s0 === peg$FAILED) {
                s0 = peg$parseLOW_PRECISION();
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e242);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsestruct_specifier() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 279;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseSTRUCT();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIDENTIFIER();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            s3 = peg$parseLEFT_BRACE();
            if (s3 !== peg$FAILED) {
                s4 = peg$parsestruct_declaration_list();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseRIGHT_BRACE();
                    if (s5 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f264(s1, s2, s3, s4, s5);
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e243);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsestruct_declaration_list() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 280;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = [];
        s1 = peg$currPos;
        s2 = peg$parsestruct_declaration();
        if (s2 !== peg$FAILED) {
            s3 = peg$parseSEMICOLON();
            if (s3 !== peg$FAILED) {
                peg$savedPos = s1;
                s1 = peg$f265(s2, s3);
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            while(s1 !== peg$FAILED){
                s0.push(s1);
                s1 = peg$currPos;
                s2 = peg$parsestruct_declaration();
                if (s2 !== peg$FAILED) {
                    s3 = peg$parseSEMICOLON();
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s1;
                        s1 = peg$f265(s2, s3);
                    } else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
            }
        } else {
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsestruct_declaration() {
        var s0, s1, s2, s3, s4, s5, s6;
        var key = peg$currPos * 309 + 281;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsefully_specified_type();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsequantified_identifier();
            if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$currPos;
                s5 = peg$parseCOMMA();
                if (s5 !== peg$FAILED) {
                    s6 = peg$parsequantified_identifier();
                    if (s6 !== peg$FAILED) {
                        s5 = [
                            s5,
                            s6
                        ];
                        s4 = s5;
                    } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
                while(s4 !== peg$FAILED){
                    s3.push(s4);
                    s4 = peg$currPos;
                    s5 = peg$parseCOMMA();
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parsequantified_identifier();
                        if (s6 !== peg$FAILED) {
                            s5 = [
                                s5,
                                s6
                            ];
                            s4 = s5;
                        } else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f266(s1, s2, s3);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsequantified_identifier() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 282;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseIDENTIFIER();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsearray_specifier();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            peg$savedPos = s0;
            s0 = peg$f267(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinitializer() {
        var s0, s1, s2, s3, s4, s5, s6;
        var key = peg$currPos * 309 + 283;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parseassignment_expression();
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseLEFT_BRACE();
            if (s1 !== peg$FAILED) {
                s2 = peg$parseinitializer();
                if (s2 !== peg$FAILED) {
                    s3 = [];
                    s4 = peg$currPos;
                    s5 = peg$parseCOMMA();
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parseinitializer();
                        if (s6 !== peg$FAILED) {
                            s5 = [
                                s5,
                                s6
                            ];
                            s4 = s5;
                        } else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                    while(s4 !== peg$FAILED){
                        s3.push(s4);
                        s4 = peg$currPos;
                        s5 = peg$parseCOMMA();
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parseinitializer();
                            if (s6 !== peg$FAILED) {
                                s5 = [
                                    s5,
                                    s6
                                ];
                                s4 = s5;
                            } else {
                                peg$currPos = s4;
                                s4 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                        }
                    }
                    s4 = peg$parseCOMMA();
                    if (s4 === peg$FAILED) {
                        s4 = null;
                    }
                    s5 = peg$parseRIGHT_BRACE();
                    if (s5 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f268(s1, s2, s3, s4, s5);
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsestatement() {
        var s0;
        var key = peg$currPos * 309 + 284;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parsecompound_statement();
        if (s0 === peg$FAILED) {
            s0 = peg$parsesimple_statement();
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsesimple_statement() {
        var s0;
        var key = peg$currPos * 309 + 285;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parsejump_statement();
        if (s0 === peg$FAILED) {
            s0 = peg$parsedeclaration_statement();
            if (s0 === peg$FAILED) {
                s0 = peg$parseexpression_statement();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseif_statement();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseswitch_statement();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parsecase_label();
                            if (s0 === peg$FAILED) {
                                s0 = peg$parseiteration_statement();
                            }
                        }
                    }
                }
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsecompound_statement() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 286;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parseLEFT_BRACE();
        if (s2 !== peg$FAILED) {
            peg$savedPos = s1;
            s2 = peg$f269(s2);
        }
        s1 = s2;
        if (s1 !== peg$FAILED) {
            s2 = peg$parsestatement_list();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            s3 = peg$parseRIGHT_BRACE();
            if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f270(s1, s2, s3);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsecompound_statement_no_new_scope() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 287;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseLEFT_BRACE();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsestatement_list();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            s3 = peg$parseRIGHT_BRACE();
            if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f271(s1, s2, s3);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsestatement_no_new_scope() {
        var s0;
        var key = peg$currPos * 309 + 288;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parsecompound_statement_no_new_scope();
        if (s0 === peg$FAILED) {
            s0 = peg$parsesimple_statement();
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsestatement_list() {
        var s0, s1;
        var key = peg$currPos * 309 + 289;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = [];
        s1 = peg$parsestatement();
        if (s1 === peg$FAILED) {
            s1 = peg$parsepreprocessor();
        }
        if (s1 !== peg$FAILED) {
            while(s1 !== peg$FAILED){
                s0.push(s1);
                s1 = peg$parsestatement();
                if (s1 === peg$FAILED) {
                    s1 = peg$parsepreprocessor();
                }
            }
        } else {
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseexpression_statement() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 290;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseexpression();
        if (s1 === peg$FAILED) {
            s1 = null;
        }
        s2 = peg$parseSEMICOLON();
        if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f272(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseif_statement() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
        var key = peg$currPos * 309 + 291;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseIF();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseLEFT_PAREN();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseexpression();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseRIGHT_PAREN();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$currPos;
                        s6 = peg$parsestatement();
                        if (s6 !== peg$FAILED) {
                            s7 = peg$currPos;
                            s8 = peg$parseELSE();
                            if (s8 !== peg$FAILED) {
                                s9 = peg$parsestatement();
                                if (s9 !== peg$FAILED) {
                                    s8 = [
                                        s8,
                                        s9
                                    ];
                                    s7 = s8;
                                } else {
                                    peg$currPos = s7;
                                    s7 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s7;
                                s7 = peg$FAILED;
                            }
                            if (s7 === peg$FAILED) {
                                s7 = null;
                            }
                            s6 = [
                                s6,
                                s7
                            ];
                            s5 = s6;
                        } else {
                            peg$currPos = s5;
                            s5 = peg$FAILED;
                        }
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f273(s1, s2, s3, s4, s5);
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseswitch_statement() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        var key = peg$currPos * 309 + 292;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseSWITCH();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseLEFT_PAREN();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseexpression();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseRIGHT_PAREN();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parseLEFT_BRACE();
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parsestatement_list();
                            if (s6 !== peg$FAILED) {
                                s7 = peg$parseRIGHT_BRACE();
                                if (s7 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f274(s1, s2, s3, s4, s5, s6, s7);
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsecase_label() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 293;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseCASE();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseexpression();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseCOLON();
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f275(s1, s2, s3);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseDEFAULT();
            if (s1 !== peg$FAILED) {
                s2 = peg$parseCOLON();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f276(s1, s2);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseiteration_statement() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8;
        var key = peg$currPos * 309 + 294;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parseWHILE();
        if (s2 !== peg$FAILED) {
            peg$savedPos = s1;
            s2 = peg$f277(s2);
        }
        s1 = s2;
        if (s1 !== peg$FAILED) {
            s2 = peg$parseLEFT_PAREN();
            if (s2 !== peg$FAILED) {
                s3 = peg$parsecondition();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseRIGHT_PAREN();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsestatement_no_new_scope();
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f278(s1, s2, s3, s4, s5);
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseDO();
            if (s1 !== peg$FAILED) {
                s2 = peg$parsestatement();
                if (s2 !== peg$FAILED) {
                    s3 = peg$parseWHILE();
                    if (s3 !== peg$FAILED) {
                        s4 = peg$parseLEFT_PAREN();
                        if (s4 !== peg$FAILED) {
                            s5 = peg$parseexpression();
                            if (s5 !== peg$FAILED) {
                                s6 = peg$parseRIGHT_PAREN();
                                if (s6 !== peg$FAILED) {
                                    s7 = peg$parseSEMICOLON();
                                    if (s7 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s0 = peg$f279(s1, s2, s3, s4, s5, s6, s7);
                                    } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$currPos;
                s2 = peg$parseFOR();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s1;
                    s2 = peg$f280(s2);
                }
                s1 = s2;
                if (s1 !== peg$FAILED) {
                    s2 = peg$parseLEFT_PAREN();
                    if (s2 !== peg$FAILED) {
                        s3 = peg$parseexpression_statement();
                        if (s3 === peg$FAILED) {
                            s3 = peg$parsedeclaration_statement();
                        }
                        if (s3 === peg$FAILED) {
                            s3 = null;
                        }
                        s4 = peg$parsecondition();
                        if (s4 === peg$FAILED) {
                            s4 = null;
                        }
                        s5 = peg$parseSEMICOLON();
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parseexpression();
                            if (s6 === peg$FAILED) {
                                s6 = null;
                            }
                            s7 = peg$parseRIGHT_PAREN();
                            if (s7 !== peg$FAILED) {
                                s8 = peg$parsestatement_no_new_scope();
                                if (s8 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f281(s1, s2, s3, s4, s5, s6, s7, s8);
                                } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e244);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsecondition() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 295;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsefully_specified_type();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIDENTIFIER();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseEQUAL();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseinitializer();
                    if (s4 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f282(s1, s2, s3, s4);
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$parseexpression();
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsejump_statement() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 309 + 296;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseCONTINUE();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseSEMICOLON();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f283(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseBREAK();
            if (s1 !== peg$FAILED) {
                s2 = peg$parseSEMICOLON();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f284(s1, s2);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseRETURN();
                if (s1 !== peg$FAILED) {
                    s2 = peg$parseexpression();
                    if (s2 === peg$FAILED) {
                        s2 = null;
                    }
                    s3 = peg$parseSEMICOLON();
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f285(s1, s2, s3);
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parseDISCARD();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parseSEMICOLON();
                        if (s2 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f286(s1, s2);
                        } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e245);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsepreprocessor() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 297;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 35) {
            s3 = peg$c210;
            peg$currPos++;
        } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e247);
            }
        }
        if (s3 !== peg$FAILED) {
            s4 = [];
            if (peg$r11.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e248);
                }
            }
            while(s5 !== peg$FAILED){
                s4.push(s5);
                if (peg$r11.test(input.charAt(peg$currPos))) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e248);
                    }
                }
            }
            s3 = [
                s3,
                s4
            ];
            s2 = s3;
        } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
            s1 = input.substring(s1, peg$currPos);
        } else {
            s1 = s2;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f287(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e246);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsetranslation_unit() {
        var s0, s1;
        var key = peg$currPos * 309 + 298;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = [];
        s1 = peg$parseexternal_declaration();
        if (s1 === peg$FAILED) {
            s1 = peg$parsepreprocessor();
        }
        if (s1 !== peg$FAILED) {
            while(s1 !== peg$FAILED){
                s0.push(s1);
                s1 = peg$parseexternal_declaration();
                if (s1 === peg$FAILED) {
                    s1 = peg$parsepreprocessor();
                }
            }
        } else {
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_prototype_statement() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 299;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsefunction_prototype_no_new_scope();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseSEMICOLON();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f288(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseexternal_declaration() {
        var s0;
        var key = peg$currPos * 309 + 301;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parsefunction_prototype_statement();
        if (s0 === peg$FAILED) {
            s0 = peg$parsefunction_definition();
            if (s0 === peg$FAILED) {
                s0 = peg$parsedeclaration_statement();
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsefunction_definition() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 302;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsefunction_prototype_new_scope();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsecompound_statement_no_new_scope();
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f290(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parse_() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 303;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parsewhitespace();
        if (s1 === peg$FAILED) {
            s1 = null;
        }
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parsecomment();
        if (s4 !== peg$FAILED) {
            s5 = peg$parsewhitespace();
            if (s5 === peg$FAILED) {
                s5 = null;
            }
            s4 = [
                s4,
                s5
            ];
            s3 = s4;
        } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
        }
        while(s3 !== peg$FAILED){
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parsecomment();
            if (s4 !== peg$FAILED) {
                s5 = peg$parsewhitespace();
                if (s5 === peg$FAILED) {
                    s5 = null;
                }
                s4 = [
                    s4,
                    s5
                ];
                s3 = s4;
            } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
            }
        }
        peg$savedPos = s0;
        s0 = peg$f291(s1, s2);
        peg$silentFails--;
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
            peg$fail(peg$e249);
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsecomment() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 309 + 304;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parsesingle_comment();
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsemultiline_comment();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parsewhitespace();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parsecomment();
                    if (s5 !== peg$FAILED) {
                        peg$savedPos = s3;
                        s3 = peg$f292(s1, s4, s5);
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while(s3 !== peg$FAILED){
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parsewhitespace();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsecomment();
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s3;
                            s3 = peg$f292(s1, s4, s5);
                        } else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f293(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsesingle_comment() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 309 + 305;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c211) {
            s2 = peg$c211;
            peg$currPos += 2;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e250);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = [];
            if (peg$r11.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e248);
                }
            }
            while(s4 !== peg$FAILED){
                s3.push(s4);
                if (peg$r11.test(input.charAt(peg$currPos))) {
                    s4 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e248);
                    }
                }
            }
            s2 = [
                s2,
                s3
            ];
            s1 = s2;
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
        } else {
            s0 = s1;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsemultiline_comment() {
        var s0, s1, s2, s3, s4, s5, s6;
        var key = peg$currPos * 309 + 306;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c212) {
            s2 = peg$c212;
            peg$currPos += 2;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e251);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$currPos;
            s5 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c213) {
                s6 = peg$c213;
                peg$currPos += 2;
            } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e252);
                }
            }
            peg$silentFails--;
            if (s6 === peg$FAILED) {
                s5 = undefined;
            } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
                if (input.length > peg$currPos) {
                    s6 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e253);
                    }
                }
                if (s6 !== peg$FAILED) {
                    peg$savedPos = s4;
                    s4 = peg$f294(s6);
                } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
            } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
            }
            while(s4 !== peg$FAILED){
                s3.push(s4);
                s4 = peg$currPos;
                s5 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c213) {
                    s6 = peg$c213;
                    peg$currPos += 2;
                } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e252);
                    }
                }
                peg$silentFails--;
                if (s6 === peg$FAILED) {
                    s5 = undefined;
                } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                }
                if (s5 !== peg$FAILED) {
                    if (input.length > peg$currPos) {
                        s6 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s6 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e253);
                        }
                    }
                    if (s6 !== peg$FAILED) {
                        peg$savedPos = s4;
                        s4 = peg$f294(s6);
                    } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
            }
            if (input.substr(peg$currPos, 2) === peg$c213) {
                s4 = peg$c213;
                peg$currPos += 2;
            } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e252);
                }
            }
            if (s4 !== peg$FAILED) {
                s2 = [
                    s2,
                    s3,
                    s4
                ];
                s1 = s2;
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
        } else {
            s0 = s1;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsewhitespace() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 307;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = [];
        if (peg$r12.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e254);
            }
        }
        if (s2 !== peg$FAILED) {
            while(s2 !== peg$FAILED){
                s1.push(s2);
                if (peg$r12.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e254);
                    }
                }
            }
        } else {
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
        } else {
            s0 = s1;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseterminal() {
        var s0, s1, s2;
        var key = peg$currPos * 309 + 308;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        if (peg$r1.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e209);
            }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
            s1 = undefined;
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            peg$savedPos = s0;
            s0 = peg$f295(s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    const getLocation = (loc)=>{
        if (!options.includeLocation) {
            return;
        }
        const { start , end  } = loc || location();
        return {
            start,
            end
        };
    };
    const node = (type, attrs)=>{
        const n = {
            type,
            ...attrs
        };
        if (options.includeLocation) {
            n.location = getLocation();
        }
        return n;
    };
    const makeScope = (name, parent, startLocation)=>{
        let newLocation = getLocation(startLocation);
        return {
            name,
            parent,
            ...newLocation ? {
                location: newLocation
            } : false,
            bindings: {},
            types: {},
            functions: {}
        };
    };
    const warn = (...args)=>!options.quiet && console.warn(...args);
    let scope = makeScope('global');
    let scopes = [
        scope
    ];
    const pushScope = (scope)=>{
        scopes.push(scope);
        return scope;
    };
    const popScope = (scope)=>{
        if (!scope.parent) {
            throw new Error('popped bad scope', scope, 'at', text());
        }
        return scope.parent;
    };
    const setScopeEnd = (scope, end)=>{
        if (options.includeLocation) {
            if (!scope.location) {
                console.error('no end location at', text());
            }
            scope.location.end = end;
        }
    };
    const groupCases = (statements)=>statements.reduce((cases, stmt)=>{
            const partial = stmt.partial || {};
            if (partial.type === 'case_label') {
                return [
                    ...cases,
                    node('switch_case', {
                        statements: [],
                        case: partial.case,
                        test: partial.test,
                        colon: partial.colon
                    })
                ];
            } else if (partial.type === 'default_label') {
                return [
                    ...cases,
                    node('default_case', {
                        statements: [],
                        default: partial.default,
                        colon: partial.colon
                    })
                ];
            } else if (!cases.length) {
                throw new Error('A switch statement body must start with a case or default label');
            } else {
                const tail = cases.slice(-1)[0];
                return [
                    ...cases.slice(0, -1),
                    {
                        ...tail,
                        statements: [
                            ...tail.statements,
                            stmt
                        ]
                    }
                ];
            }
        }, []);
    peg$result = peg$startRuleFunction();
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
        return peg$result;
    } else {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
            peg$fail(peg$endExpectation());
        }
        throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
    }
}
const mod = {
    SyntaxError: peg$SyntaxError,
    parse: peg$parse
};
const __default = {
    generate,
    parser: mod
};
export { __default as default };

