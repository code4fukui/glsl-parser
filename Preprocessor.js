// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const isNode = (node)=>!!node?.type;
const isTraversable = (node)=>isNode(node) || Array.isArray(node);
const makePath = (node, parent, parentPath, key, index)=>({
        node,
        parent,
        parentPath,
        key,
        index,
        skip: function() {
            this.skipped = true;
        },
        remove: function() {
            this.removed = true;
        },
        replaceWith: function(replacer) {
            this.replaced = replacer;
        },
        findParent: function(test) {
            return !parentPath ? parentPath : test(parentPath) ? parentPath : parentPath.findParent(test);
        }
    });
const visit = (ast, visitors)=>{
    const visitNode = (node, parent, parentPath, key, index)=>{
        const visitor = visitors[node.type];
        const path = makePath(node, parent, parentPath, key, index);
        const parentNode = parent;
        if (visitor?.enter) {
            visitor.enter(path);
            if (path.removed) {
                if (!key || !parent) {
                    throw new Error(`Asked to remove ${node} but no parent key was present in ${parent}`);
                }
                if (typeof index === 'number') {
                    parentNode[key].splice(index, 1);
                } else {
                    parentNode[key] = null;
                }
                return path;
            }
            if (path.replaced) {
                if (!key || !parent) {
                    throw new Error(`Asked to remove ${node} but no parent key was present in ${parent}`);
                }
                if (typeof index === 'number') {
                    parentNode[key].splice(index, 1, path.replaced);
                } else {
                    parentNode[key] = path.replaced;
                }
            }
            if (path.skipped) {
                return path;
            }
        }
        Object.entries(node).filter(([_, nodeValue])=>isTraversable(nodeValue)).forEach(([nodeKey, nodeValue])=>{
            if (Array.isArray(nodeValue)) {
                for(let i = 0, offset = 0; i - offset < nodeValue.length; i++){
                    const child = nodeValue[i - offset];
                    const res = visitNode(child, node, path, nodeKey, i - offset);
                    if (res?.removed) {
                        offset += 1;
                    }
                }
            } else {
                visitNode(nodeValue, node, path, nodeKey);
            }
        });
        visitor?.exit?.(path);
    };
    visitNode(ast);
};
const makeGenerator = (generators)=>{
    const gen = (ast)=>typeof ast === 'string' ? ast : ast === null || ast === undefined ? '' : Array.isArray(ast) ? ast.map(gen).join('') : ast.type in generators ? generators[ast.type](ast) : `NO GENERATOR FOR ${ast.type}` + ast;
    return gen;
};
const generators = {
    program: (node)=>generate(node.program) + generate(node.wsEnd),
    segment: (node)=>generate(node.blocks),
    text: (node)=>generate(node.text),
    literal: (node)=>generate(node.wsStart) + generate(node.literal) + generate(node.wsEnd),
    identifier: (node)=>generate(node.identifier) + generate(node.wsEnd),
    binary: (node)=>generate(node.left) + generate(node.operator) + generate(node.right),
    group: (node)=>generate(node.lp) + generate(node.expression) + generate(node.rp),
    unary: (node)=>generate(node.operator) + generate(node.expression),
    unary_defined: (node)=>generate(node.operator) + generate(node.lp) + generate(node.identifier) + generate(node.rp),
    int_constant: (node)=>generate(node.token) + generate(node.wsEnd),
    elseif: (node)=>generate(node.token) + generate(node.expression) + generate(node.wsEnd) + generate(node.body),
    if: (node)=>generate(node.token) + generate(node.expression) + generate(node.wsEnd) + generate(node.body),
    ifdef: (node)=>generate(node.token) + generate(node.identifier) + generate(node.wsEnd),
    ifndef: (node)=>generate(node.token) + generate(node.identifier) + generate(node.wsEnd),
    else: (node)=>generate(node.token) + generate(node.body) + generate(node.wsEnd),
    error: (node)=>generate(node.error) + generate(node.message) + generate(node.wsEnd),
    undef: (node)=>generate(node.undef) + generate(node.identifier) + generate(node.wsEnd),
    define: (node)=>generate(node.wsStart) + generate(node.define) + generate(node.identifier) + generate(node.body) + generate(node.wsEnd),
    define_arguments: (node)=>generate(node.wsStart) + generate(node.define) + generate(node.identifier) + generate(node.lp) + generate(node.args) + generate(node.rp) + generate(node.body) + generate(node.wsEnd),
    conditional: (node)=>generate(node.wsStart) + generate(node.ifPart) + generate(node.elseIfParts) + generate(node.elsePart) + generate(node.endif) + generate(node.wsEnd),
    version: (node)=>generate(node.version) + generate(node.value) + generate(node.profile) + generate(node.wsEnd),
    pragma: (node)=>generate(node.pragma) + generate(node.body) + generate(node.wsEnd),
    line: (node)=>generate(node.line) + generate(node.value) + generate(node.wsEnd),
    extension: (node)=>generate(node.extension) + generate(node.name) + generate(node.colon) + generate(node.behavior) + generate(node.wsEnd)
};
const generate = makeGenerator(generators);
const without = (obj, ...keys)=>Object.entries(obj).reduce((acc, [key, value])=>({
            ...acc,
            ...!keys.includes(key) && {
                [key]: value
            }
        }), {});
const scanFunctionArgs = (src)=>{
    let __char;
    let parens = 0;
    let args = [];
    let arg = '';
    for(let i = 0; i < src.length; i++){
        __char = src.charAt(i);
        if (__char === '(') {
            parens++;
        }
        if (__char === ')') {
            parens--;
        }
        if (parens === -1) {
            if (arg !== '' || args.length) {
                args.push(arg);
            }
            return {
                args,
                length: i
            };
        }
        if (__char === ',' && parens === 0) {
            args.push(arg);
            arg = '';
        } else {
            arg += __char;
        }
    }
    return null;
};
const preprocessComments = (src)=>{
    let i;
    let chr;
    let la;
    let out = '';
    let line = 1;
    let in_single = 0;
    let in_multi = 0;
    for(i = 0; i < src.length; i++){
        chr = src.substr(i, 1);
        la = src.substr(i + 1, 1);
        if (chr == '/' && la == '/' && !in_single && !in_multi) {
            in_single = line;
            i++;
            continue;
        }
        if (chr == '\n' && in_single) {
            in_single = 0;
        }
        if (chr == '/' && la == '*' && !in_multi && !in_single) {
            in_multi = line;
            i++;
            continue;
        }
        if (chr == '*' && la == '/' && in_multi) {
            if (in_multi == line) {
                out += ' ';
            }
            in_multi = 0;
            i++;
            continue;
        }
        if (!in_multi && !in_single || chr == '\n') {
            out += chr;
            line++;
        }
    }
    return out;
};
const tokenPaste = (str)=>str.replace(/\s+##\s+/g, '');
const evaluate = (ast, evaluators)=>{
    const visit = (node)=>{
        const evaluator = evaluators[node.type];
        if (!evaluator) {
            throw new Error(`No evaluate() evaluator for ${node.type}`);
        }
        return evaluator(node, visit);
    };
    return visit(ast);
};
const expandFunctionMacro = (macros, macroName, macro, text)=>{
    const pattern = `\\b${macroName}\\s*\\(`;
    const startRegex = new RegExp(pattern, 'm');
    let expanded = '';
    let current = text;
    let startMatch;
    while(startMatch = startRegex.exec(current)){
        const result = scanFunctionArgs(current.substring(startMatch.index + startMatch[0].length));
        if (result === null) {
            throw new Error(`${current.match(startRegex)} unterminated macro invocation`);
        }
        const macroArgs = (macro.args || []).filter((arg)=>arg.literal !== ',');
        const { args , length: argLength  } = result;
        const matchLength = startMatch[0].length + argLength + 1;
        if (args.length > macroArgs.length) {
            throw new Error(`'${macroName}': Too many arguments for macro`);
        }
        if (args.length < macroArgs.length) {
            throw new Error(`'${macroName}': Not enough arguments for macro`);
        }
        const replacedBody = tokenPaste(macroArgs.reduce((replaced, macroArg, index)=>replaced.replace(new RegExp(`\\b${macroArg.identifier}\\b`, 'g'), args[index].trim()), macro.body));
        const expandedReplace = expandMacros(replacedBody, without(macros, macroName));
        const endOfReplace = startMatch.index + expandedReplace.length;
        const processed = current.replace(current.substr(startMatch.index, matchLength), expandedReplace);
        expanded += processed.substr(0, endOfReplace);
        current = processed.substr(endOfReplace);
    }
    return expanded + current;
};
const expandObjectMacro = (macros, macroName, macro, text)=>{
    const regex = new RegExp(`\\b${macroName}\\b`, 'g');
    let expanded = text;
    if (regex.test(text)) {
        const firstPass = tokenPaste(text.replace(new RegExp(`\\b${macroName}\\b`, 'g'), macro.body));
        expanded = expandMacros(firstPass, without(macros, macroName));
    }
    return expanded;
};
const expandMacros = (text, macros)=>Object.entries(macros).reduce((result, [macroName, macro])=>macro.args ? expandFunctionMacro(macros, macroName, macro, result) : expandObjectMacro(macros, macroName, macro, result), text);
const identity = (x)=>!!x;
const expandInExpressions = (macros, ...expressions)=>{
    expressions.filter(identity).forEach((expression)=>{
        visit(expression, {
            unary_defined: {
                enter: (path)=>{
                    path.skip();
                }
            },
            identifier: {
                enter: (path)=>{
                    path.node.identifier = expandMacros(path.node.identifier, macros);
                }
            }
        });
    });
};
const evaluateIfPart = (macros, ifPart)=>{
    if (ifPart.type === 'if') {
        return evaluteExpression(ifPart.expression, macros);
    } else if (ifPart.type === 'ifdef') {
        return ifPart.identifier.identifier in macros;
    } else if (ifPart.type === 'ifndef') {
        return !(ifPart.identifier.identifier in macros);
    }
};
const evaluteExpression = (node, macros)=>evaluate(node, {
        int_constant: (node)=>parseInt(node.token, 10),
        unary_defined: (node)=>node.identifier.identifier in macros,
        identifier: (node)=>node.identifier,
        group: (node, visit)=>visit(node.expression),
        binary: ({ left , right , operator: { literal  }  }, visit)=>{
            switch(literal){
                case '*':
                    {
                        return visit(left) * visit(right);
                    }
                case '/':
                    {
                        return visit(left) / visit(right);
                    }
                case '%':
                    {
                        return visit(left) % visit(right);
                    }
                case '+':
                    {
                        return visit(left) + visit(right);
                    }
                case '-':
                    {
                        return visit(left) - visit(right);
                    }
                case '<<':
                    {
                        return visit(left) << visit(right);
                    }
                case '>>':
                    {
                        return visit(left) >> visit(right);
                    }
                case '<':
                    {
                        return visit(left) < visit(right);
                    }
                case '>':
                    {
                        return visit(left) > visit(right);
                    }
                case '<=':
                    {
                        return visit(left) <= visit(right);
                    }
                case '>=':
                    {
                        return visit(left) >= visit(right);
                    }
                case '==':
                    {
                        return visit(left) == visit(right);
                    }
                case '!=':
                    {
                        return visit(left) != visit(right);
                    }
                case '&':
                    {
                        return visit(left) & visit(right);
                    }
                case '^':
                    {
                        return visit(left) ^ visit(right);
                    }
                case '|':
                    {
                        return visit(left) | visit(right);
                    }
                case '&&':
                    {
                        return visit(left) && visit(right);
                    }
                case '||':
                    {
                        return visit(left) || visit(right);
                    }
                default:
                    {
                        throw new Error(`Preprocessing error: Unknown binary operator ${literal}`);
                    }
            }
        },
        unary: (node, visit)=>{
            switch(node.operator.literal){
                case '+':
                    {
                        return visit(node.expression);
                    }
                case '-':
                    {
                        return -1 * visit(node.expression);
                    }
                case '!':
                    {
                        return !visit(node.expression);
                    }
                case '~':
                    {
                        return ~visit(node.expression);
                    }
                default:
                    {
                        throw new Error(`Preprocessing error: Unknown unary operator ${node.operator.literal}`);
                    }
            }
        }
    });
const shouldPreserve = (preserve = {})=>(path)=>{
        const test = preserve?.[path.node.type];
        return typeof test === 'function' ? test(path) : test;
    };
const preprocessAst = (program, options = {})=>{
    const macros = Object.entries(options.defines || {}).reduce((defines, [name, body])=>({
            ...defines,
            [name]: {
                body
            }
        }), {});
    const { preserve , ignoreMacro  } = options;
    const preserveNode = shouldPreserve(preserve);
    visit(program, {
        conditional: {
            enter: (path)=>{
                const { node  } = path;
                if (preserveNode(path)) {
                    return;
                }
                expandInExpressions(macros, node.ifPart.expression, ...node.elseIfParts.map((elif)=>elif.expression), node.elsePart?.body);
                if (evaluateIfPart(macros, node.ifPart)) {
                    path.replaceWith(node.ifPart.body);
                } else {
                    const elseBranchHit = node.elseIfParts.reduce((res, elif)=>res || evaluteExpression(elif.expression, macros) && (path.replaceWith(elif.body), true), false);
                    if (!elseBranchHit) {
                        if (node.elsePart) {
                            path.replaceWith(node.elsePart.body);
                        } else {
                            path.remove();
                        }
                    }
                }
            }
        },
        text: {
            enter: (path)=>{
                path.node.text = expandMacros(path.node.text, macros);
            }
        },
        define_arguments: {
            enter: (path)=>{
                const { identifier: { identifier  } , body , args  } = path.node;
                macros[identifier] = {
                    args,
                    body
                };
                !preserveNode(path) && path.remove();
            }
        },
        define: {
            enter: (path)=>{
                const { identifier: { identifier  } , body  } = path.node;
                macros[identifier] = {
                    body
                };
                !preserveNode(path) && path.remove();
            }
        },
        undef: {
            enter: (path)=>{
                delete macros[path.node.identifier.identifier];
                !preserveNode(path) && path.remove();
            }
        },
        error: {
            enter: (path)=>{
                if (options.stopOnError) {
                    throw new Error(path.node.message);
                }
                !preserveNode(path) && path.remove();
            }
        },
        pragma: {
            enter: (path)=>{
                !preserveNode(path) && path.remove();
            }
        },
        version: {
            enter: (path)=>{
                !preserveNode(path) && path.remove();
            }
        },
        extension: {
            enter: (path)=>{
                !preserveNode(path) && path.remove();
            }
        },
        line: {
            enter: (path)=>{
                !preserveNode(path) && path.remove();
            }
        }
    });
    return program;
};
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
    var peg$c0 = "<<";
    var peg$c1 = ">>";
    var peg$c2 = "<=";
    var peg$c3 = ">=";
    var peg$c4 = "==";
    var peg$c5 = "!=";
    var peg$c6 = "&&";
    var peg$c7 = "||";
    var peg$c8 = "(";
    var peg$c9 = ")";
    var peg$c10 = ",";
    var peg$c11 = "!";
    var peg$c12 = "-";
    var peg$c13 = "~";
    var peg$c14 = "+";
    var peg$c15 = "*";
    var peg$c16 = "/";
    var peg$c17 = "%";
    var peg$c18 = "<";
    var peg$c19 = ">";
    var peg$c20 = "|";
    var peg$c21 = "^";
    var peg$c22 = "&";
    var peg$c23 = ":";
    var peg$c24 = "#define";
    var peg$c26 = "#line";
    var peg$c27 = "#undef";
    var peg$c28 = "#error";
    var peg$c29 = "#pragma";
    var peg$c30 = "defined";
    var peg$c31 = "#if";
    var peg$c32 = "#ifdef";
    var peg$c33 = "#ifndef";
    var peg$c34 = "#elif";
    var peg$c35 = "#else";
    var peg$c36 = "#endif";
    var peg$c37 = "#version";
    var peg$c38 = "#extension";
    var peg$c39 = "0";
    var peg$c40 = "#";
    var peg$c41 = "//";
    var peg$c42 = "/*";
    var peg$c43 = "*/";
    var peg$r0 = /^[A-Za-z_]/;
    var peg$r1 = /^[A-Za-z_0-9]/;
    var peg$r2 = /^[uU]/;
    var peg$r3 = /^[1-9]/;
    var peg$r4 = /^[0-7]/;
    var peg$r5 = /^[xX]/;
    var peg$r6 = /^[0-9a-fA-F]/;
    var peg$r7 = /^[0-9]/;
    var peg$r8 = /^[\n]/;
    var peg$r9 = /^[^\n]/;
    var peg$r10 = /^[ \t]/;
    var peg$e0 = peg$literalExpectation("<<", false);
    var peg$e1 = peg$literalExpectation(">>", false);
    var peg$e2 = peg$literalExpectation("<=", false);
    var peg$e3 = peg$literalExpectation(">=", false);
    var peg$e4 = peg$literalExpectation("==", false);
    var peg$e5 = peg$literalExpectation("!=", false);
    var peg$e6 = peg$literalExpectation("&&", false);
    var peg$e7 = peg$literalExpectation("||", false);
    var peg$e8 = peg$literalExpectation("(", false);
    var peg$e9 = peg$literalExpectation(")", false);
    var peg$e10 = peg$literalExpectation(",", false);
    var peg$e11 = peg$literalExpectation("!", false);
    var peg$e12 = peg$literalExpectation("-", false);
    var peg$e13 = peg$literalExpectation("~", false);
    var peg$e14 = peg$literalExpectation("+", false);
    var peg$e15 = peg$literalExpectation("*", false);
    var peg$e16 = peg$literalExpectation("/", false);
    var peg$e17 = peg$literalExpectation("%", false);
    var peg$e18 = peg$literalExpectation("<", false);
    var peg$e19 = peg$literalExpectation(">", false);
    var peg$e20 = peg$literalExpectation("|", false);
    var peg$e21 = peg$literalExpectation("^", false);
    var peg$e22 = peg$literalExpectation("&", false);
    var peg$e23 = peg$literalExpectation(":", false);
    var peg$e24 = peg$literalExpectation("#define", false);
    peg$literalExpectation("#include", false);
    var peg$e26 = peg$literalExpectation("#line", false);
    var peg$e27 = peg$literalExpectation("#undef", false);
    var peg$e28 = peg$literalExpectation("#error", false);
    var peg$e29 = peg$literalExpectation("#pragma", false);
    var peg$e30 = peg$literalExpectation("defined", false);
    var peg$e31 = peg$literalExpectation("#if", false);
    var peg$e32 = peg$literalExpectation("#ifdef", false);
    var peg$e33 = peg$literalExpectation("#ifndef", false);
    var peg$e34 = peg$literalExpectation("#elif", false);
    var peg$e35 = peg$literalExpectation("#else", false);
    var peg$e36 = peg$literalExpectation("#endif", false);
    var peg$e37 = peg$literalExpectation("#version", false);
    var peg$e38 = peg$literalExpectation("#extension", false);
    var peg$e39 = peg$classExpectation([
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
    var peg$e40 = peg$classExpectation([
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
    var peg$e41 = peg$otherExpectation("number");
    var peg$e42 = peg$classExpectation([
        "u",
        "U"
    ], false, false);
    var peg$e43 = peg$classExpectation([
        [
            "1",
            "9"
        ]
    ], false, false);
    var peg$e44 = peg$literalExpectation("0", false);
    var peg$e45 = peg$classExpectation([
        [
            "0",
            "7"
        ]
    ], false, false);
    var peg$e46 = peg$classExpectation([
        "x",
        "X"
    ], false, false);
    var peg$e47 = peg$classExpectation([
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
    var peg$e48 = peg$classExpectation([
        [
            "0",
            "9"
        ]
    ], false, false);
    var peg$e49 = peg$otherExpectation("control line");
    var peg$e50 = peg$classExpectation([
        "\n"
    ], false, false);
    var peg$e51 = peg$otherExpectation("token string");
    var peg$e52 = peg$classExpectation([
        "\n"
    ], true, false);
    var peg$e53 = peg$otherExpectation("text");
    var peg$e54 = peg$literalExpectation("#", false);
    var peg$e55 = peg$otherExpectation("if");
    var peg$e56 = peg$otherExpectation("primary expression");
    var peg$e57 = peg$otherExpectation("unary expression");
    var peg$e58 = peg$otherExpectation("multiplicative expression");
    var peg$e59 = peg$otherExpectation("additive expression");
    var peg$e60 = peg$otherExpectation("shift expression");
    var peg$e61 = peg$otherExpectation("relational expression");
    var peg$e62 = peg$otherExpectation("equality expression");
    var peg$e63 = peg$otherExpectation("and expression");
    var peg$e64 = peg$otherExpectation("exclusive or expression");
    var peg$e65 = peg$otherExpectation("inclusive or expression");
    var peg$e66 = peg$otherExpectation("logical and expression");
    var peg$e67 = peg$otherExpectation("logical or expression");
    var peg$e68 = peg$otherExpectation("constant expression");
    var peg$e69 = peg$otherExpectation("whitespace or comment");
    var peg$e70 = peg$literalExpectation("//", false);
    var peg$e71 = peg$literalExpectation("/*", false);
    var peg$e72 = peg$literalExpectation("*/", false);
    var peg$e73 = peg$anyExpectation();
    var peg$e74 = peg$otherExpectation("whitespace");
    var peg$e75 = peg$classExpectation([
        " ",
        "\t"
    ], false, false);
    var peg$f0 = function(program, wsEnd) {
        return node('program', {
            program: program.blocks,
            wsEnd
        });
    };
    var peg$f1 = function(token, _) {
        return node('int_constant', {
            token,
            wsEnd: _
        });
    };
    var peg$f2 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f3 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f4 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f5 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f6 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f7 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f8 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f9 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f10 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f11 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f12 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f13 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f14 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f15 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f16 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f17 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f18 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f19 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f20 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f21 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f22 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f23 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f24 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f25 = function(token, _) {
        return node('literal', {
            literal: token,
            wsEnd: _
        });
    };
    var peg$f26 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f28 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f29 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f30 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f31 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f32 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f33 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f34 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f35 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f36 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f37 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f38 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f39 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f40 = function(wsStart, token, wsEnd) {
        return node('literal', {
            literal: token,
            wsStart,
            wsEnd
        });
    };
    var peg$f41 = function(identifier, _) {
        return node('identifier', {
            identifier,
            wsEnd: _
        });
    };
    var peg$f42 = function(identifier) {
        return node('identifier', {
            identifier
        });
    };
    var peg$f43 = function(text) {
        return node('text', {
            text: text.join('')
        });
    };
    var peg$f44 = function(blocks) {
        return node('segment', {
            blocks
        });
    };
    var peg$f45 = function(define, identifier, lp, head, tail) {
        return [
            head,
            ...tail.flat()
        ];
    };
    var peg$f46 = function(define, identifier, lp, args, rp, body) {
        return node('define_arguments', {
            define,
            identifier,
            lp,
            args: args || [],
            rp,
            body
        });
    };
    var peg$f47 = function(define, identifier, body) {
        return node('define', {
            define,
            identifier,
            body
        });
    };
    var peg$f48 = function(line, value) {
        return node('line', {
            line,
            value
        });
    };
    var peg$f49 = function(undef, identifier) {
        return node('undef', {
            undef,
            identifier
        });
    };
    var peg$f50 = function(error, message) {
        return node('error', {
            error,
            message
        });
    };
    var peg$f51 = function(pragma, body) {
        return node('pragma', {
            pragma,
            body
        });
    };
    var peg$f52 = function(version, value, profile) {
        return node('version', {
            version,
            value,
            profile
        });
    };
    var peg$f53 = function(extension, name, colon, behavior) {
        return node('extension', {
            extension,
            name,
            colon,
            behavior
        });
    };
    var peg$f54 = function(line, wsEnd) {
        return {
            ...line,
            wsEnd
        };
    };
    var peg$f55 = function(ifLine, wsEnd, body) {
        return {
            ...ifLine,
            body,
            wsEnd
        };
    };
    var peg$f56 = function(ifPart, token, expression, wsEnd, elseIfBody) {
        return node('elseif', {
            token,
            expression,
            wsEnd,
            body: elseIfBody
        });
    };
    var peg$f57 = function(ifPart, elseIfParts, token, wsEnd, elseBody) {
        return node('else', {
            token,
            wsEnd,
            body: elseBody
        });
    };
    var peg$f58 = function(ifPart, elseIfParts, elsePart, endif, wsEnd) {
        return node('conditional', {
            ifPart,
            elseIfParts,
            elsePart,
            endif,
            wsEnd
        });
    };
    var peg$f59 = function(token, identifier) {
        return node('ifdef', {
            token,
            identifier
        });
    };
    var peg$f60 = function(token, identifier) {
        return node('ifndef', {
            token,
            identifier
        });
    };
    var peg$f61 = function(token, expression) {
        return node('if', {
            token,
            expression
        });
    };
    var peg$f62 = function(lp, expression, rp) {
        return node('group', {
            lp,
            expression,
            rp
        });
    };
    var peg$f63 = function(operator, lp, identifier, rp) {
        return node('unary_defined', {
            operator,
            lp,
            identifier,
            rp
        });
    };
    var peg$f64 = function(operator, expression) {
        return node('unary', {
            operator,
            expression
        });
    };
    var peg$f65 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f66 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f67 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f68 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f69 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f70 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f71 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f72 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f73 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f74 = function(head, tail) {
        return leftAssociate(head, tail);
    };
    var peg$f75 = function(w, rest) {
        return collapse(w, rest);
    };
    var peg$f76 = function(a, x, cc) {
        return xnil(x, cc);
    };
    var peg$f77 = function(a, d) {
        return xnil(a, d.flat());
    };
    var peg$f78 = function(i) {
        return i;
    };
    var peg$currPos = 0;
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
        var s0;
        var key = peg$currPos * 74 + 0;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$parseprogram();
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseprogram() {
        var s0, s1, s2;
        var key = peg$currPos * 74 + 1;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parsetext_or_control_lines();
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
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
    function peg$parseINTCONSTANT() {
        var s0, s1, s2;
        var key = peg$currPos * 74 + 2;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parseinteger_constant();
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f1(s1, s2);
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
    function peg$parseLEFT_OP() {
        var s0, s1, s2;
        var key = peg$currPos * 74 + 3;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c0) {
            s1 = peg$c0;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e0);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f2(s1, s2);
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
        var key = peg$currPos * 74 + 4;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c1) {
            s1 = peg$c1;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e1);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f3(s1, s2);
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
        var key = peg$currPos * 74 + 5;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c2) {
            s1 = peg$c2;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e2);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f4(s1, s2);
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
        var key = peg$currPos * 74 + 6;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c3) {
            s1 = peg$c3;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e3);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f5(s1, s2);
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
        var key = peg$currPos * 74 + 7;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c4) {
            s1 = peg$c4;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e4);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f6(s1, s2);
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
        var key = peg$currPos * 74 + 8;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c5) {
            s1 = peg$c5;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e5);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f7(s1, s2);
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
        var key = peg$currPos * 74 + 9;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c6) {
            s1 = peg$c6;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e6);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f8(s1, s2);
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
        var key = peg$currPos * 74 + 10;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c7) {
            s1 = peg$c7;
            peg$currPos += 2;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e7);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f9(s1, s2);
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
        var key = peg$currPos * 74 + 11;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 40) {
            s1 = peg$c8;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e8);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f10(s1, s2);
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
        var key = peg$currPos * 74 + 12;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 41) {
            s1 = peg$c9;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e9);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f11(s1, s2);
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
        var key = peg$currPos * 74 + 13;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
            s1 = peg$c10;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e10);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f12(s1, s2);
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
        var key = peg$currPos * 74 + 14;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 33) {
            s1 = peg$c11;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e11);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f13(s1, s2);
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
        var key = peg$currPos * 74 + 15;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
            s1 = peg$c12;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e12);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f14(s1, s2);
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
        var key = peg$currPos * 74 + 16;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 126) {
            s1 = peg$c13;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e13);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f15(s1, s2);
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
        var key = peg$currPos * 74 + 17;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 43) {
            s1 = peg$c14;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e14);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f16(s1, s2);
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
        var key = peg$currPos * 74 + 18;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 42) {
            s1 = peg$c15;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e15);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f17(s1, s2);
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
        var key = peg$currPos * 74 + 19;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 47) {
            s1 = peg$c16;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e16);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f18(s1, s2);
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
        var key = peg$currPos * 74 + 20;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 37) {
            s1 = peg$c17;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e17);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f19(s1, s2);
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
        var key = peg$currPos * 74 + 21;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 60) {
            s1 = peg$c18;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e18);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f20(s1, s2);
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
        var key = peg$currPos * 74 + 22;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 62) {
            s1 = peg$c19;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e19);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f21(s1, s2);
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
        var key = peg$currPos * 74 + 23;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 124) {
            s1 = peg$c20;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e20);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f22(s1, s2);
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
        var key = peg$currPos * 74 + 24;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 94) {
            s1 = peg$c21;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e21);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f23(s1, s2);
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
        var key = peg$currPos * 74 + 25;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 38) {
            s1 = peg$c22;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e22);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f24(s1, s2);
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
        var key = peg$currPos * 74 + 26;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 58) {
            s1 = peg$c23;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e23);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            s0;
            s0 = peg$f25(s1, s2);
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
    function peg$parseDEFINE() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 27;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 7) === peg$c24) {
            s2 = peg$c24;
            peg$currPos += 7;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e24);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f26(s1, s2, s3);
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
    function peg$parseLINE() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 29;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 5) === peg$c26) {
            s2 = peg$c26;
            peg$currPos += 5;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e26);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f28(s1, s2, s3);
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
    function peg$parseUNDEF() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 30;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 6) === peg$c27) {
            s2 = peg$c27;
            peg$currPos += 6;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e27);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f29(s1, s2, s3);
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
    function peg$parseERROR() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 31;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 6) === peg$c28) {
            s2 = peg$c28;
            peg$currPos += 6;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e28);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f30(s1, s2, s3);
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
    function peg$parsePRAGMA() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 32;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 7) === peg$c29) {
            s2 = peg$c29;
            peg$currPos += 7;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e29);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f31(s1, s2, s3);
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
    function peg$parseDEFINED() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 33;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 7) === peg$c30) {
            s2 = peg$c30;
            peg$currPos += 7;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e30);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f32(s1, s2, s3);
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
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 34;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 3) === peg$c31) {
            s2 = peg$c31;
            peg$currPos += 3;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e31);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f33(s1, s2, s3);
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
    function peg$parseIFDEF() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 35;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 6) === peg$c32) {
            s2 = peg$c32;
            peg$currPos += 6;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e32);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f34(s1, s2, s3);
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
    function peg$parseIFNDEF() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 36;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 7) === peg$c33) {
            s2 = peg$c33;
            peg$currPos += 7;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e33);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f35(s1, s2, s3);
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
    function peg$parseELIF() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 37;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 5) === peg$c34) {
            s2 = peg$c34;
            peg$currPos += 5;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e34);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f36(s1, s2, s3);
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
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 38;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 5) === peg$c35) {
            s2 = peg$c35;
            peg$currPos += 5;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e35);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f37(s1, s2, s3);
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
    function peg$parseENDIF() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 39;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 6) === peg$c36) {
            s2 = peg$c36;
            peg$currPos += 6;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e36);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f38(s1, s2, s3);
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
    function peg$parseVERSION() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 40;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 8) === peg$c37) {
            s2 = peg$c37;
            peg$currPos += 8;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e37);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f39(s1, s2, s3);
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
    function peg$parseEXTENSION() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 41;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (input.substr(peg$currPos, 10) === peg$c38) {
            s2 = peg$c38;
            peg$currPos += 10;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e38);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            s0;
            s0 = peg$f40(s1, s2, s3);
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
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 42;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        if (peg$r0.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e39);
            }
        }
        if (s3 !== peg$FAILED) {
            s4 = [];
            if (peg$r1.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e40);
                }
            }
            while(s5 !== peg$FAILED){
                s4.push(s5);
                if (peg$r1.test(input.charAt(peg$currPos))) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e40);
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
            s0;
            s0 = peg$f41(s1, s2);
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
    function peg$parseIDENTIFIER_NO_WS() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 43;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        if (peg$r0.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e39);
            }
        }
        if (s3 !== peg$FAILED) {
            s4 = [];
            if (peg$r1.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e40);
                }
            }
            while(s5 !== peg$FAILED){
                s4.push(s5);
                if (peg$r1.test(input.charAt(peg$currPos))) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e40);
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
            s0;
            s1 = peg$f42(s1);
        }
        s0 = s1;
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinteger_constant() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 74 + 44;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
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
            if (s0 === peg$FAILED) {
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
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e41);
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
        var key = peg$currPos * 74 + 45;
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
                peg$fail(peg$e42);
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
        var key = peg$currPos * 74 + 46;
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
                peg$fail(peg$e43);
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
        var key = peg$currPos * 74 + 47;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 48) {
            s1 = peg$c39;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e44);
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
                    peg$fail(peg$e45);
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
                        peg$fail(peg$e45);
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
        var key = peg$currPos * 74 + 48;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 48) {
            s1 = peg$c39;
            peg$currPos++;
        } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e44);
            }
        }
        if (s1 !== peg$FAILED) {
            if (peg$r5.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e46);
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
                        peg$fail(peg$e47);
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
                            peg$fail(peg$e47);
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
        var key = peg$currPos * 74 + 49;
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
                peg$fail(peg$e48);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsetext_or_control_lines() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 74 + 50;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsecontrol_line();
        if (s2 === peg$FAILED) {
            s2 = peg$currPos;
            s3 = [];
            s4 = peg$parsetext();
            if (s4 !== peg$FAILED) {
                while(s4 !== peg$FAILED){
                    s3.push(s4);
                    s4 = peg$parsetext();
                }
            } else {
                s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
                s2;
                s3 = peg$f43(s3);
            }
            s2 = s3;
        }
        if (s2 !== peg$FAILED) {
            while(s2 !== peg$FAILED){
                s1.push(s2);
                s2 = peg$parsecontrol_line();
                if (s2 === peg$FAILED) {
                    s2 = peg$currPos;
                    s3 = [];
                    s4 = peg$parsetext();
                    if (s4 !== peg$FAILED) {
                        while(s4 !== peg$FAILED){
                            s3.push(s4);
                            s4 = peg$parsetext();
                        }
                    } else {
                        s3 = peg$FAILED;
                    }
                    if (s3 !== peg$FAILED) {
                        s2;
                        s3 = peg$f43(s3);
                    }
                    s2 = s3;
                }
            }
        } else {
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s0;
            s1 = peg$f44(s1);
        }
        s0 = s1;
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsecontrol_line() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
        var key = peg$currPos * 74 + 51;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parseconditional();
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parseDEFINE();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseIDENTIFIER_NO_WS();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseLEFT_PAREN();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$currPos;
                        s6 = peg$parseIDENTIFIER();
                        if (s6 !== peg$FAILED) {
                            s7 = [];
                            s8 = peg$currPos;
                            s9 = peg$parseCOMMA();
                            if (s9 !== peg$FAILED) {
                                s10 = peg$parseIDENTIFIER();
                                if (s10 !== peg$FAILED) {
                                    s9 = [
                                        s9,
                                        s10
                                    ];
                                    s8 = s9;
                                } else {
                                    peg$currPos = s8;
                                    s8 = peg$FAILED;
                                }
                            } else {
                                peg$currPos = s8;
                                s8 = peg$FAILED;
                            }
                            while(s8 !== peg$FAILED){
                                s7.push(s8);
                                s8 = peg$currPos;
                                s9 = peg$parseCOMMA();
                                if (s9 !== peg$FAILED) {
                                    s10 = peg$parseIDENTIFIER();
                                    if (s10 !== peg$FAILED) {
                                        s9 = [
                                            s9,
                                            s10
                                        ];
                                        s8 = s9;
                                    } else {
                                        peg$currPos = s8;
                                        s8 = peg$FAILED;
                                    }
                                } else {
                                    peg$currPos = s8;
                                    s8 = peg$FAILED;
                                }
                            }
                            s5;
                            s5 = peg$f45(s2, s3, s4, s6, s7);
                        } else {
                            peg$currPos = s5;
                            s5 = peg$FAILED;
                        }
                        if (s5 === peg$FAILED) {
                            s5 = null;
                        }
                        s6 = peg$parseRIGHT_PAREN();
                        if (s6 !== peg$FAILED) {
                            s7 = peg$parsetoken_string();
                            if (s7 === peg$FAILED) {
                                s7 = null;
                            }
                            s1;
                            s1 = peg$f46(s2, s3, s4, s5, s6, s7);
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
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 === peg$FAILED) {
                s1 = peg$currPos;
                s2 = peg$parseDEFINE();
                if (s2 !== peg$FAILED) {
                    s3 = peg$parseIDENTIFIER();
                    if (s3 !== peg$FAILED) {
                        s4 = peg$parsetoken_string();
                        if (s4 === peg$FAILED) {
                            s4 = null;
                        }
                        s1;
                        s1 = peg$f47(s2, s3, s4);
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
                    s2 = peg$parseLINE();
                    if (s2 !== peg$FAILED) {
                        s3 = peg$currPos;
                        s4 = [];
                        s5 = peg$parsedigit();
                        if (s5 !== peg$FAILED) {
                            while(s5 !== peg$FAILED){
                                s4.push(s5);
                                s5 = peg$parsedigit();
                            }
                        } else {
                            s4 = peg$FAILED;
                        }
                        if (s4 !== peg$FAILED) {
                            s3 = input.substring(s3, peg$currPos);
                        } else {
                            s3 = s4;
                        }
                        if (s3 !== peg$FAILED) {
                            s1;
                            s1 = peg$f48(s2, s3);
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
                        s2 = peg$parseUNDEF();
                        if (s2 !== peg$FAILED) {
                            s3 = peg$parseIDENTIFIER();
                            if (s3 !== peg$FAILED) {
                                s1;
                                s1 = peg$f49(s2, s3);
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
                            s2 = peg$parseERROR();
                            if (s2 !== peg$FAILED) {
                                s3 = peg$parsetoken_string();
                                if (s3 !== peg$FAILED) {
                                    s1;
                                    s1 = peg$f50(s2, s3);
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
                                s2 = peg$parsePRAGMA();
                                if (s2 !== peg$FAILED) {
                                    s3 = peg$parsetoken_string();
                                    if (s3 !== peg$FAILED) {
                                        s1;
                                        s1 = peg$f51(s2, s3);
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
                                    s2 = peg$parseVERSION();
                                    if (s2 !== peg$FAILED) {
                                        s3 = peg$parseinteger_constant();
                                        if (s3 !== peg$FAILED) {
                                            s4 = peg$parsetoken_string();
                                            if (s4 === peg$FAILED) {
                                                s4 = null;
                                            }
                                            s1;
                                            s1 = peg$f52(s2, s3, s4);
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
                                        s2 = peg$parseEXTENSION();
                                        if (s2 !== peg$FAILED) {
                                            s3 = peg$parseIDENTIFIER();
                                            if (s3 !== peg$FAILED) {
                                                s4 = peg$parseCOLON();
                                                if (s4 !== peg$FAILED) {
                                                    s5 = peg$parsetoken_string();
                                                    if (s5 !== peg$FAILED) {
                                                        s1;
                                                        s1 = peg$f53(s2, s3, s4, s5);
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
                                        } else {
                                            peg$currPos = s1;
                                            s1 = peg$FAILED;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (s1 !== peg$FAILED) {
                if (peg$r8.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e50);
                    }
                }
                if (s2 === peg$FAILED) {
                    s2 = null;
                }
                s0;
                s0 = peg$f54(s1, s2);
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e49);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsetoken_string() {
        var s0, s1, s2;
        var key = peg$currPos * 74 + 52;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        if (peg$r9.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e52);
            }
        }
        if (s2 !== peg$FAILED) {
            while(s2 !== peg$FAILED){
                s1.push(s2);
                if (peg$r9.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e52);
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
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e51);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsetext() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 53;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$currPos;
        s4 = peg$parsewhitespace();
        if (s4 === peg$FAILED) {
            s4 = null;
        }
        if (input.charCodeAt(peg$currPos) === 35) {
            s5 = peg$c40;
            peg$currPos++;
        } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e54);
            }
        }
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
        peg$silentFails--;
        if (s3 === peg$FAILED) {
            s2 = undefined;
        } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
            s3 = [];
            if (peg$r9.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e52);
                }
            }
            if (s4 !== peg$FAILED) {
                while(s4 !== peg$FAILED){
                    s3.push(s4);
                    if (peg$r9.test(input.charAt(peg$currPos))) {
                        s4 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e52);
                        }
                    }
                }
            } else {
                s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
                if (peg$r8.test(input.charAt(peg$currPos))) {
                    s4 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e50);
                    }
                }
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
        if (s1 === peg$FAILED) {
            if (peg$r8.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e50);
                }
            }
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
                peg$fail(peg$e53);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseconditional() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        var key = peg$currPos * 74 + 54;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parseif_line();
        if (s2 !== peg$FAILED) {
            if (peg$r8.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e50);
                }
            }
            if (s3 !== peg$FAILED) {
                s4 = peg$parsetext_or_control_lines();
                if (s4 === peg$FAILED) {
                    s4 = null;
                }
                s1;
                s1 = peg$f55(s2, s3, s4);
            } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
        } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseELIF();
            if (s4 !== peg$FAILED) {
                s5 = peg$parseconstant_expression();
                if (s5 !== peg$FAILED) {
                    if (peg$r8.test(input.charAt(peg$currPos))) {
                        s6 = input.charAt(peg$currPos);
                        peg$currPos++;
                    } else {
                        s6 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e50);
                        }
                    }
                    if (s6 !== peg$FAILED) {
                        s7 = peg$parsetext_or_control_lines();
                        if (s7 === peg$FAILED) {
                            s7 = null;
                        }
                        s3;
                        s3 = peg$f56(s1, s4, s5, s6, s7);
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
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
                s4 = peg$parseELIF();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseconstant_expression();
                    if (s5 !== peg$FAILED) {
                        if (peg$r8.test(input.charAt(peg$currPos))) {
                            s6 = input.charAt(peg$currPos);
                            peg$currPos++;
                        } else {
                            s6 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e50);
                            }
                        }
                        if (s6 !== peg$FAILED) {
                            s7 = peg$parsetext_or_control_lines();
                            if (s7 === peg$FAILED) {
                                s7 = null;
                            }
                            s3;
                            s3 = peg$f56(s1, s4, s5, s6, s7);
                        } else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
            }
            s3 = peg$currPos;
            s4 = peg$parseELSE();
            if (s4 !== peg$FAILED) {
                if (peg$r8.test(input.charAt(peg$currPos))) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e50);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parsetext_or_control_lines();
                    if (s6 === peg$FAILED) {
                        s6 = null;
                    }
                    s3;
                    s3 = peg$f57(s1, s2, s4, s5, s6);
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
            s4 = peg$parseENDIF();
            if (s4 !== peg$FAILED) {
                if (peg$r8.test(input.charAt(peg$currPos))) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e50);
                    }
                }
                if (s5 === peg$FAILED) {
                    s5 = null;
                }
                s0;
                s0 = peg$f58(s1, s2, s3, s4, s5);
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
    function peg$parseif_line() {
        var s0, s1, s2;
        var key = peg$currPos * 74 + 55;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseIFDEF();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseIDENTIFIER();
            if (s2 !== peg$FAILED) {
                s0;
                s0 = peg$f59(s1, s2);
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
            s1 = peg$parseIFNDEF();
            if (s1 !== peg$FAILED) {
                s2 = peg$parseIDENTIFIER();
                if (s2 !== peg$FAILED) {
                    s0;
                    s0 = peg$f60(s1, s2);
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
                s1 = peg$parseIF();
                if (s1 !== peg$FAILED) {
                    s2 = peg$parseconstant_expression();
                    if (s2 === peg$FAILED) {
                        s2 = null;
                    }
                    s0;
                    s0 = peg$f61(s1, s2);
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
                peg$fail(peg$e55);
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
        var key = peg$currPos * 74 + 56;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parseINTCONSTANT();
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseLEFT_PAREN();
            if (s1 !== peg$FAILED) {
                s2 = peg$parseconstant_expression();
                if (s2 !== peg$FAILED) {
                    s3 = peg$parseRIGHT_PAREN();
                    if (s3 !== peg$FAILED) {
                        s0;
                        s0 = peg$f62(s1, s2, s3);
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
                s0 = peg$parseIDENTIFIER();
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e56);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseunary_expression() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 74 + 57;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseDEFINED();
        if (s1 !== peg$FAILED) {
            s2 = peg$parseLEFT_PAREN();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseIDENTIFIER();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseRIGHT_PAREN();
                    if (s4 !== peg$FAILED) {
                        s0;
                        s0 = peg$f63(s1, s2, s3, s4);
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
            if (s1 !== peg$FAILED) {
                s2 = peg$parseunary_expression();
                if (s2 !== peg$FAILED) {
                    s0;
                    s0 = peg$f64(s1, s2);
                } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parseprimary_expression();
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e57);
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
        var key = peg$currPos * 74 + 58;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
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
            s0;
            s0 = peg$f65(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e58);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseadditive_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 59;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
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
            s0;
            s0 = peg$f66(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e59);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseshift_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 60;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
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
            s0;
            s0 = peg$f67(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e60);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parserelational_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 61;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
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
            s0;
            s0 = peg$f68(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e61);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseequality_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 62;
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
            s0;
            s0 = peg$f69(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e62);
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
        var key = peg$currPos * 74 + 63;
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
            s0;
            s0 = peg$f70(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e63);
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
        var key = peg$currPos * 74 + 64;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
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
            s0;
            s0 = peg$f71(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e64);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseinclusive_or_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 65;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
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
            s0;
            s0 = peg$f72(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e65);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parselogical_and_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 66;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
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
            s0;
            s0 = peg$f73(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e66);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parselogical_or_expression() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 67;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parselogical_and_expression();
        if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$currPos;
            s4 = peg$parseOR_OP();
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
                s4 = peg$parseOR_OP();
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
            s0;
            s0 = peg$f74(s1, s2);
        } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e67);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parseconstant_expression() {
        var s0;
        var key = peg$currPos * 74 + 68;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$parselogical_or_expression();
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e68);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parse_() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 69;
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
        s0;
        s0 = peg$f75(s1, s2);
        peg$silentFails--;
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
            peg$fail(peg$e69);
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    function peg$parsecomment() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 74 + 70;
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
                        s3;
                        s3 = peg$f76(s1, s4, s5);
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
                            s3;
                            s3 = peg$f76(s1, s4, s5);
                        } else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                s0;
                s0 = peg$f77(s1, s2);
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
        var key = peg$currPos * 74 + 71;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c41) {
            s2 = peg$c41;
            peg$currPos += 2;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e70);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = [];
            if (peg$r9.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
            } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e52);
                }
            }
            while(s4 !== peg$FAILED){
                s3.push(s4);
                if (peg$r9.test(input.charAt(peg$currPos))) {
                    s4 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e52);
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
        var key = peg$currPos * 74 + 72;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        s0 = peg$currPos;
        s1 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c42) {
            s2 = peg$c42;
            peg$currPos += 2;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e71);
            }
        }
        if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$currPos;
            s5 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c43) {
                s6 = peg$c43;
                peg$currPos += 2;
            } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e72);
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
                        peg$fail(peg$e73);
                    }
                }
                if (s6 !== peg$FAILED) {
                    s4;
                    s4 = peg$f78(s6);
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
                if (input.substr(peg$currPos, 2) === peg$c43) {
                    s6 = peg$c43;
                    peg$currPos += 2;
                } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e72);
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
                            peg$fail(peg$e73);
                        }
                    }
                    if (s6 !== peg$FAILED) {
                        s4;
                        s4 = peg$f78(s6);
                    } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
            }
            if (input.substr(peg$currPos, 2) === peg$c43) {
                s4 = peg$c43;
                peg$currPos += 2;
            } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e72);
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
        var key = peg$currPos * 74 + 73;
        var cached = peg$resultsCache[key];
        if (cached) {
            peg$currPos = cached.nextPos;
            return cached.result;
        }
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = [];
        if (peg$r10.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
        } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e75);
            }
        }
        if (s2 !== peg$FAILED) {
            while(s2 !== peg$FAILED){
                s1.push(s2);
                if (peg$r10.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e75);
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
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$e74);
            }
        }
        peg$resultsCache[key] = {
            nextPos: peg$currPos,
            result: s0
        };
        return s0;
    }
    const node = (type, attrs)=>({
            type,
            ...attrs
        });
    const xnil = (...args)=>args.flat().filter((e)=>e !== undefined && e !== null && e !== '' && e.length !== 0);
    const ifOnly = (arr)=>arr.length > 1 ? arr : arr[0];
    const collapse = (...args)=>ifOnly(xnil(args));
    const leftAssociate = (...nodes)=>nodes.flat().reduce((current, [operator, expr])=>({
                type: 'binary',
                operator: operator,
                left: current,
                right: expr
            }));
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
const preprocess = (src, options)=>generate(preprocessAst(mod.parse(options.preserveComments ? src : preprocessComments(src)), options));
export { preprocessAst as preprocessAst, preprocessComments as preprocessComments, generate as generate, preprocess as preprocess, mod as parser };
export { preprocess as default };
