"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptionsHelp = void 0;
const ts = require("typescript");
const declaration_1 = require("./declaration");
function hasHint(parameter) {
    var _a;
    return ((_a = parameter.type) !== null && _a !== void 0 ? _a : declaration_1.ParameterType.String) === declaration_1.ParameterType.String && typeof parameter['hint'] !== 'undefined';
}
function getParameterHelp(options, scope) {
    const parameters = options.getDeclarationsByScope(scope);
    parameters.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    const names = [];
    const helps = [];
    let margin = 0;
    for (const parameter of parameters) {
        if (!parameter.help) {
            continue;
        }
        let name = ' ';
        if (parameter.short) {
            name += '-' + parameter.short;
            if (hasHint(parameter)) {
                name += ' ' + declaration_1.ParameterHint[parameter.hint].toUpperCase();
            }
            name += ', ';
        }
        name += '--' + parameter.name;
        if (hasHint(parameter)) {
            name += ' ' + declaration_1.ParameterHint[parameter.hint].toUpperCase();
        }
        names.push(name);
        helps.push(parameter.help);
        margin = Math.max(name.length, margin);
    }
    return { names, helps, margin };
}
function getOptionsHelp(options) {
    const typeDoc = getParameterHelp(options, declaration_1.ParameterScope.TypeDoc);
    const output = [];
    output.push('Usage:');
    output.push(' typedoc --mode modules --out path/to/documentation path/to/sourcefiles');
    output.push('', 'TypeDoc options:');
    pushHelp(typeDoc);
    output.push('', 'TypeScript options:');
    output.push('  See https://www.typescriptlang.org/docs/handbook/compiler-options.html');
    output.push('');
    return output.join(ts.sys.newLine);
    function pushHelp(columns) {
        for (let i = 0; i < columns.names.length; i++) {
            const usage = columns.names[i];
            const description = columns.helps[i];
            output.push(usage + padding(typeDoc.margin - usage.length + 2) + description);
        }
    }
    function padding(length) {
        return Array(length + 1).join(' ');
    }
}
exports.getOptionsHelp = getOptionsHelp;
//# sourceMappingURL=help.js.map