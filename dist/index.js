"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = exports.immerStore = void 0;
var immer_store_1 = require("./immer-store");
Object.defineProperty(exports, "immerStore", { enumerable: true, get: function () { return immer_store_1.immerStore; } });
var history_1 = require("./history");
Object.defineProperty(exports, "History", { enumerable: true, get: function () { return history_1.History; } });
require("./workaround");
//# sourceMappingURL=index.js.map