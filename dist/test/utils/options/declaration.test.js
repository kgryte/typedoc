"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const declaration_1 = require("../../../lib/utils/options/declaration");
const assert_1 = require("assert");
const utils_1 = require("../../../lib/utils");
describe('Options - Default convert function', () => {
    const optionWithType = (type) => ({
        type,
        defaultValue: null,
        name: 'test',
        help: ''
    });
    it('Converts to numbers', () => {
        assert_1.deepStrictEqual(declaration_1.convert('123', optionWithType(declaration_1.ParameterType.Number)), utils_1.Result.Ok(123));
        assert_1.deepStrictEqual(declaration_1.convert('a', optionWithType(declaration_1.ParameterType.Number)), utils_1.Result.Ok(0));
        assert_1.deepStrictEqual(declaration_1.convert(NaN, optionWithType(declaration_1.ParameterType.Number)), utils_1.Result.Ok(0));
    });
    it('Converts to strings', () => {
        assert_1.deepStrictEqual(declaration_1.convert('123', optionWithType(declaration_1.ParameterType.String)), utils_1.Result.Ok('123'));
        assert_1.deepStrictEqual(declaration_1.convert(123, optionWithType(declaration_1.ParameterType.String)), utils_1.Result.Ok('123'));
        assert_1.deepStrictEqual(declaration_1.convert(['1', '2'], optionWithType(declaration_1.ParameterType.String)), utils_1.Result.Ok('1,2'));
        assert_1.deepStrictEqual(declaration_1.convert(null, optionWithType(declaration_1.ParameterType.String)), utils_1.Result.Ok(''));
        assert_1.deepStrictEqual(declaration_1.convert(void 0, optionWithType(declaration_1.ParameterType.String)), utils_1.Result.Ok(''));
    });
    it('Converts to booleans', () => {
        assert_1.deepStrictEqual(declaration_1.convert('a', optionWithType(declaration_1.ParameterType.Boolean)), utils_1.Result.Ok(true));
        assert_1.deepStrictEqual(declaration_1.convert([1], optionWithType(declaration_1.ParameterType.Boolean)), utils_1.Result.Ok(true));
        assert_1.deepStrictEqual(declaration_1.convert(false, optionWithType(declaration_1.ParameterType.Boolean)), utils_1.Result.Ok(false));
    });
    it('Converts to arrays', () => {
        assert_1.deepStrictEqual(declaration_1.convert('12,3', optionWithType(declaration_1.ParameterType.Array)), utils_1.Result.Ok(['12', '3']));
        assert_1.deepStrictEqual(declaration_1.convert(['12,3'], optionWithType(declaration_1.ParameterType.Array)), utils_1.Result.Ok(['12,3']));
        assert_1.deepStrictEqual(declaration_1.convert(true, optionWithType(declaration_1.ParameterType.Array)), utils_1.Result.Ok([]));
    });
    it('Converts to mapped types', () => {
        const declaration = {
            name: '',
            help: '',
            type: declaration_1.ParameterType.Map,
            map: {
                a: 1,
                b: 2
            },
            defaultValue: 1
        };
        assert_1.deepStrictEqual(declaration_1.convert('a', declaration), utils_1.Result.Ok(1));
        assert_1.deepStrictEqual(declaration_1.convert('b', declaration), utils_1.Result.Ok(2));
        assert_1.deepStrictEqual(declaration_1.convert(2, declaration), utils_1.Result.Ok(2));
    });
    it('Converts to mapped types with a map', () => {
        const declaration = {
            name: '',
            help: '',
            type: declaration_1.ParameterType.Map,
            map: new Map([
                ['a', 1],
                ['b', 2]
            ]),
            defaultValue: 1
        };
        assert_1.deepStrictEqual(declaration_1.convert('a', declaration), utils_1.Result.Ok(1));
        assert_1.deepStrictEqual(declaration_1.convert('b', declaration), utils_1.Result.Ok(2));
        assert_1.deepStrictEqual(declaration_1.convert(2, declaration), utils_1.Result.Ok(2));
    });
    it('Uses the mapError if provided for errors', () => {
        const declaration = {
            name: '',
            help: '',
            type: declaration_1.ParameterType.Map,
            map: {},
            defaultValue: 1,
            mapError: 'Test error'
        };
        assert_1.deepStrictEqual(declaration_1.convert('a', declaration), utils_1.Result.Err(declaration.mapError));
    });
    it('Generates a nice error if no mapError is provided', () => {
        const declaration = {
            name: 'test',
            help: '',
            type: declaration_1.ParameterType.Map,
            map: new Map([['a', 1], ['b', 2]]),
            defaultValue: 1
        };
        assert_1.deepStrictEqual(declaration_1.convert('c', declaration), utils_1.Result.Err('test must be one of a, b'));
    });
    it('Correctly handles enum types in the map error', () => {
        let Enum;
        (function (Enum) {
            Enum[Enum["a"] = 0] = "a";
            Enum[Enum["b"] = 1] = "b";
        })(Enum || (Enum = {}));
        const declaration = {
            name: 'test',
            help: '',
            type: declaration_1.ParameterType.Map,
            map: Enum,
            defaultValue: Enum.a
        };
        assert_1.deepStrictEqual(declaration_1.convert('c', declaration), utils_1.Result.Err('test must be one of a, b'));
    });
    it('Passes through mixed', () => {
        const data = Symbol();
        assert_1.deepStrictEqual(declaration_1.convert(data, optionWithType(declaration_1.ParameterType.Mixed)), utils_1.Result.Ok(data));
    });
});
//# sourceMappingURL=declaration.test.js.map