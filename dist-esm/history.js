import { derived, get, writable } from "svelte/store";
export class History {
    constructor() {
        this._state$ = writable({
            index: 0,
            list: []
        });
        this.index$ = derived(this._state$, state => state.index);
        this.count$ = derived(this._state$, state => state.list.length);
        this.canUndo$ = derived(this._state$, state => state.index !== 0);
        this.canRedo$ = derived(this._state$, state => state.index !== state.list.length);
        this.enqueue = (change) => this._enqueue(change);
    }
    _enqueue(change) {
        this._state$.update(h => {
            if (!change.undo) {
                return {
                    list: [],
                    index: 0
                };
            }
            return {
                list: [...h.list.slice(0, h.index), change],
                index: h.index + 1
            };
        });
    }
    undo() {
        let action;
        this._state$.update(state => {
            var _a, _b;
            if (state.index === 0)
                return state;
            action = (_a = state.list[state.index - 1]) === null || _a === void 0 ? void 0 : _a.undo;
            if (!((_b = state.list[state.index - 1]) === null || _b === void 0 ? void 0 : _b.redo)) {
                return {
                    list: state.list.slice(0, state.index - 1),
                    index: state.index - 1
                };
            }
            return {
                list: state.list,
                index: state.index - 1
            };
        });
        if (action)
            action();
    }
    redo() {
        let action;
        this._state$.update(state => {
            var _a;
            if (state.index === state.list.length)
                return state;
            action = (_a = state.list[state.index]) === null || _a === void 0 ? void 0 : _a.redo;
            return {
                list: state.list,
                index: state.index + 1
            };
        });
        if (action)
            action();
    }
    get index() { return get(this.index$); }
    get count() { return get(this.count$); }
    get canUndo() { return get(this.canUndo$); }
    get canRedo() { return get(this.canRedo$); }
}
//# sourceMappingURL=history.js.map