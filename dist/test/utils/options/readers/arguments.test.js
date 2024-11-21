"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const utils_1 = require("../../../../lib/utils");
const readers_1 = require("../../../../lib/utils/options/readers");
const options_1 = require("../../../../lib/utils/options");
describe('Options - ArgumentsReader', () => {
    const options = new utils_1.Options(new utils_1.Logger());
    options.addDefaultDeclarations();
    options.addDeclaration({
        name: 'numOption',
        short: 'no',
        help: '',
        type: options_1.ParameterType.Number
    });
    options.addDeclaration({
        name: 'bool',
        help: '',
        type: options_1.ParameterType.Boolean
    });
    options.addDeclaration({
        name: 'map',
        help: '',
        type: options_1.ParameterType.Map,
        map: {
            item: { a: true },
            other: 'blah'
        },
        defaultValue: 'blah'
    });
    options.addDeclaration({
        name: 'mixed',
        help: '',
        type: options_1.ParameterType.Mixed
    });
    function test(name, args, cb) {
        it(name, () => {
            const reader = new readers_1.ArgumentsReader(1, args);
            options.reset();
            options.addReader(reader);
            options.read(new utils_1.Logger());
            cb();
            options.removeReaderByName(reader.name);
        });
    }
    test('Puts arguments with no flag into inputFiles', ['foo', 'bar'], () => {
        assert_1.deepStrictEqual(options.getValue('inputFiles'), ['foo', 'bar']);
    });
    test('Works with string options', ['--out', 'outDir'], () => {
        assert_1.deepStrictEqual(options.getValue('out'), 'outDir');
    });
    test('Works with number options', ['-no', '123'], () => {
        assert_1.deepStrictEqual(options.getValue('numOption'), 123);
    });
    test('Works with boolean options', ['--bool'], () => {
        assert_1.deepStrictEqual(options.getValue('bool'), true);
    });
    test('Allows setting boolean options with a value', ['--bool', 'TrUE'], () => {
        assert_1.deepStrictEqual(options.getValue('bool'), true);
        assert_1.deepStrictEqual(options.getValue('inputFiles'), []);
    });
    test('Allows setting boolean options to false with a value', ['--bool', 'FALse'], () => {
        assert_1.deepStrictEqual(options.getValue('bool'), false);
        assert_1.deepStrictEqual(options.getValue('inputFiles'), []);
    });
    test('Bool options do not improperly consume arguments', ['--bool', 'foo'], () => {
        assert_1.deepStrictEqual(options.getValue('bool'), true);
        assert_1.deepStrictEqual(options.getValue('inputFiles'), ['foo']);
    });
    test('Works with map options', ['--map', 'item'], () => {
        assert_1.deepStrictEqual(options.getValue('map'), { a: true });
    });
    test('Works with mixed options', ['--mixed', 'word'], () => {
        assert_1.deepStrictEqual(options.getValue('mixed'), 'word');
    });
    test('Works with array options', ['--exclude', 'a'], () => {
        assert_1.deepStrictEqual(options.getValue('exclude'), ['a']);
    });
    test('Splits array options (backward compatibility)', ['--exclude', 'a,b'], () => {
        assert_1.deepStrictEqual(options.getValue('exclude'), ['a', 'b']);
    });
    test('Works with array options passed multiple times', ['--exclude', 'a', '--exclude', 'b'], () => {
        assert_1.deepStrictEqual(options.getValue('exclude'), ['a', 'b']);
    });
    it('Errors if given an unknown option', () => {
        let check = false;
        class TestLogger extends utils_1.Logger {
            error(msg) {
                assert_1.deepStrictEqual(msg, 'Unknown option: --badOption');
                check = true;
            }
        }
        const reader = new readers_1.ArgumentsReader(1, ['--badOption']);
        options.reset();
        options.addReader(reader);
        options.read(new TestLogger());
        options.removeReaderByName(reader.name);
        assert_1.deepStrictEqual(check, true, 'Reader did not report an error.');
    });
});
//# sourceMappingURL=arguments.test.js.map