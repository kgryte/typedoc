"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const FS = require("fs");
const Path = require("path");
const assert_1 = require("assert");
const typescript_1 = require("typescript");
const json = require("./converter/class/specs.json");
describe('Converter', function () {
    const base = Path.join(__dirname, 'converter');
    const app = new __1.Application();
    app.bootstrap({
        mode: 'modules',
        logger: 'none',
        target: typescript_1.ScriptTarget.ES5,
        module: typescript_1.ModuleKind.CommonJS,
        experimentalDecorators: true,
        jsx: typescript_1.JsxEmit.React,
        name: 'typedoc',
        ignoreCompilerErrors: true,
        excludeExternals: true
    });
    const checks = [
        ['specs', () => { }, () => { }],
        ['specs.d',
            () => app.options.setValue('includeDeclarations', true),
            () => app.options.setValue('includeDeclarations', false)
        ],
        ['specs-without-exported',
            () => app.options.setValue('excludeNotExported', true),
            () => app.options.setValue('excludeNotExported', false)
        ],
        ['specs-with-lump-categories',
            () => app.options.setValue('categorizeByGroup', false),
            () => app.options.setValue('categorizeByGroup', true)
        ]
    ];
    FS.readdirSync(base).forEach(function (directory) {
        const path = Path.join(base, directory);
        if (!FS.lstatSync(path).isDirectory()) {
            return;
        }
        describe(directory, function () {
            for (const [file, before, after] of checks) {
                const specsFile = Path.join(path, `${file}.json`);
                if (!FS.existsSync(specsFile)) {
                    continue;
                }
                let result;
                it(`[${file}] converts fixtures`, function () {
                    before();
                    __1.resetReflectionID();
                    result = app.convert(app.expandInputFiles([path]));
                    after();
                    assert_1.ok(result instanceof __1.ProjectReflection, 'No reflection returned');
                });
                it(`[${file}] matches specs`, function () {
                    const specs = JSON.parse(FS.readFileSync(specsFile, 'utf-8'));
                    let data = JSON.stringify(app.serializer.toObject(result), null, '  ');
                    data = data.split(__1.normalizePath(base)).join('%BASE%');
                    assert_1.deepStrictEqual(JSON.parse(data), specs);
                });
            }
        });
    });
});
describe('Serializer', () => {
    it('Type checks', () => {
        const typed = json;
        assert_1.deepStrictEqual(json, typed);
    });
});
//# sourceMappingURL=converter.test.js.map