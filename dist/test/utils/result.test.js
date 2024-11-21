"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const utils_1 = require("../../lib/utils");
describe('Result', () => {
    const okResult = utils_1.Result.Ok('ok');
    const errResult = utils_1.Result.Err('error');
    const returnOne = () => 1;
    it('Unwraps Ok', () => {
        assert_1.equal(okResult.unwrap(), 'ok');
    });
    it('Throws if unwrapping Err as Ok', () => {
        assert_1.throws(() => errResult.unwrap());
    });
    it('Unwraps Err', () => {
        assert_1.equal(errResult.unwrapErr(), 'error');
    });
    it('Throws if unwrapping Ok as Err', () => {
        assert_1.throws(() => okResult.unwrapErr());
    });
    it('Matches Ok', () => {
        okResult.match({
            ok: data => assert_1.equal(data, 'ok'),
            err: assert_1.fail
        });
    });
    it('Matches Err', () => {
        errResult.match({
            ok: assert_1.fail,
            err: data => assert_1.equal(data, 'error')
        });
    });
    it('Maps Ok', () => {
        assert_1.equal(okResult.map(returnOne).unwrap(), 1);
    });
    it('Maps Ok when Err', () => {
        assert_1.equal(errResult.map(returnOne).unwrapErr(), 'error');
    });
    it('Maps Err', () => {
        assert_1.equal(errResult.mapErr(returnOne).unwrapErr(), 1);
    });
    it('Maps Err when Ok', () => {
        assert_1.equal(okResult.mapErr(returnOne).unwrap(), 'ok');
    });
    it('Has a nice display string', () => {
        assert_1.equal(okResult.toString(), '[Ok ok]');
        assert_1.equal(errResult.toString(), '[Err error]');
    });
});
//# sourceMappingURL=result.test.js.map