"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../lib/utils");
const assert_1 = require("assert");
describe('Options', () => {
    const logger = new utils_1.Logger();
    const options = new utils_1.Options(logger);
    options.addDefaultDeclarations();
    it('Errors on duplicate declarations', () => {
        logger.resetErrors();
        options.addDeclaration({
            name: 'help',
            help: '',
            type: utils_1.ParameterType.Boolean
        });
        assert_1.deepStrictEqual(logger.hasErrors(), true);
    });
    it('Does not error if the same declaration is registered twice', () => {
        logger.resetErrors();
        const declaration = { name: 'test-declaration', help: '' };
        options.addDeclaration(declaration);
        options.addDeclaration(declaration);
        assert_1.deepStrictEqual(logger.hasErrors(), false);
        options.removeDeclarationByName(declaration.name);
    });
    it('Supports removing a declaration by name', () => {
        options.addDeclaration({ name: 'not-an-option', help: '' });
        options.removeDeclarationByName('not-an-option');
        assert_1.deepStrictEqual(options.getDeclaration('not-an-option'), undefined);
    });
    it('Also removes the declaration under its short name', () => {
        options.addDeclaration({ name: 'not-an-option', help: '', short: '#' });
        options.removeDeclarationByName('not-an-option');
        assert_1.deepStrictEqual(options.getDeclaration('#'), undefined);
    });
    it('Ignores removal of non-existent declarations', () => {
        options.removeDeclarationByName('not-an-option');
        assert_1.deepStrictEqual(options.getDeclaration('not-an-option'), undefined);
    });
    it('Throws on attempt to get an undeclared option', () => {
        assert_1.throws(() => options.getValue('does-not-exist'));
    });
    it('Does not allow fetching compiler options through getValue', () => {
        assert_1.throws(() => options.getValue('target'));
    });
    it('Errors if converting a set value errors', () => {
        assert_1.throws(() => options.setValue('mode', 'nonsense').unwrap());
    });
    it('Supports directly getting values', () => {
        assert_1.deepStrictEqual(options.getRawValues().toc, []);
    });
    it('Supports getting by scope', () => {
        assert_1.deepStrictEqual(options.getDeclarationsByScope(utils_1.ParameterScope.TypeDoc).length !== 0, true);
    });
});
//# sourceMappingURL=options.test.js.map