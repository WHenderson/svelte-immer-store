"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPathProxy = exports.symPath = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/ban-types */
exports.symPath = Symbol('details');
function createPathProxy(path = []) {
    return new Proxy({}, {
        get(target, p, receiver) {
            if (p === exports.symPath)
                return path;
            // Note: p is never left as a string by the Proxy, so we have to assume that a string which looks like a number /is/ a number.
            const prop = (typeof p === 'string' && /^(0|[1-9][0-9]*)$/.test(p))
                ? parseInt(p, 10)
                : p;
            return createPathProxy([...path, prop]);
        }
    });
}
exports.createPathProxy = createPathProxy;
//# sourceMappingURL=path.js.map