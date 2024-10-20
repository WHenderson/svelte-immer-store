"use strict";
var _a, _b, _c;
var _d, _e;
// Hack to get immer.js working
// https://github.com/immerjs/immer/issues/557
// https://github.com/immerjs/immer/issues/557
if (typeof window === 'object') {
    (_c = (_e = ((_b = (_d = ((_a = window.process) !== null && _a !== void 0 ? _a : (window.process = {}))).env) !== null && _b !== void 0 ? _b : (_d.env = {}))).NODE_ENV) !== null && _c !== void 0 ? _c : (_e.NODE_ENV = "production");
}
//# sourceMappingURL=workaround.js.map