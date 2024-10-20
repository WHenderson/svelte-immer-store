"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrackerProxy = exports.symTrackerDetails = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/ban-types */
exports.symTrackerDetails = Symbol('details');
function createTrackerProxy(value, parent, property) {
    const details = { value, parent, property };
    return new Proxy({}, {
        get(target, p, receiver) {
            if (p === exports.symTrackerDetails)
                return details;
            const result = (() => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    return Reflect.get(value, p, receiver);
                }
                catch (ex) {
                    return;
                }
            })();
            // Note: p is never left as a string by the Proxy, so we have to assume that a string which looks like a number /is/ a number.
            const prop = (typeof p === 'string' && Array.isArray(value) && /^(0|[1-9][0-9]*)$/.test(p))
                ? parseInt(p, 10)
                : p;
            return createTrackerProxy(result, (value && typeof value === 'object' ? value : undefined), prop);
        },
        ownKeys() {
            if (value && typeof value === 'object')
                return Reflect.ownKeys(value);
            return [];
        },
        getOwnPropertyDescriptor(target, p) {
            if (value && typeof value === 'object')
                return Reflect.getOwnPropertyDescriptor(value, p);
            return;
        }
    });
}
exports.createTrackerProxy = createTrackerProxy;
//# sourceMappingURL=tracker.js.map