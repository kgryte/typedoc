"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMinimatch = void 0;
const Path = require("path");
const minimatch_1 = require("minimatch");
const unix = Path.sep === '/';
function normalize(pattern) {
    if (pattern.startsWith('!') || pattern.startsWith('#')) {
        return pattern[0] + normalize(pattern.substr(1));
    }
    if (unix) {
        pattern = pattern.replace(/[\\]/g, '/').replace(/^\w:/, '');
    }
    if (pattern.substr(0, 2) !== '**') {
        pattern = Path.resolve(pattern);
    }
    if (!unix) {
        pattern = pattern.replace(/[\\]/g, '/');
    }
    return pattern;
}
function createMinimatch(patterns) {
    return patterns.map(pattern => new minimatch_1.Minimatch(normalize(pattern), { dot: true }));
}
exports.createMinimatch = createMinimatch;
//# sourceMappingURL=paths.js.map