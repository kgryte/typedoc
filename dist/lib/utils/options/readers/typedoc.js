"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeDocReader = void 0;
const Path = require("path");
const FS = require("fs");
class TypeDocReader {
    constructor() {
        this.priority = 100;
        this.name = 'typedoc-json';
    }
    read(container, logger) {
        const path = container.getValue('options');
        const file = this.findTypedocFile(path);
        if (!file) {
            if (!container.isDefault('options')) {
                logger.error(`The options file could not be found with the given path ${path}`);
            }
            return;
        }
        const seen = new Set();
        this.readFile(file, container, logger, seen);
    }
    readFile(file, container, logger, seen) {
        if (seen.has(file)) {
            logger.error(`Tried to load the options file ${file} multiple times.`);
            return;
        }
        seen.add(file);
        const data = require(file);
        if (typeof data !== 'object' || !data) {
            logger.error(`The file ${file} is not an object.`);
            return;
        }
        if ('extends' in data) {
            const extended = getStringArray(data['extends']);
            for (const extendedFile of extended) {
                this.readFile(Path.resolve(Path.dirname(file), extendedFile), container, logger, seen);
            }
            delete data['extends'];
        }
        if ('src' in data && !('inputFiles' in data)) {
            data['inputFiles'] = getStringArray(data['src']);
            delete data['src'];
        }
        container.setValues(data).match({
            ok() { },
            err(errors) {
                for (const err of errors) {
                    logger.error(err.message);
                }
            }
        });
    }
    findTypedocFile(path) {
        path = Path.resolve(path);
        return [
            path,
            Path.join(path, 'typedoc.json'),
            Path.join(path, 'typedoc.js')
        ].find(path => FS.existsSync(path) && FS.statSync(path).isFile());
    }
}
exports.TypeDocReader = TypeDocReader;
function getStringArray(arg) {
    return Array.isArray(arg) ? arg.map(String) : [String(arg)];
}
//# sourceMappingURL=typedoc.js.map