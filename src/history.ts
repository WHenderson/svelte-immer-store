import {derived, get, Readable, writable, Writable} from "svelte/store";
import {Action} from "./action";

export interface Change {
    undo?: Action;
    redo?: Action;
}

export type EnqueueChange = (change: Change) => void;

export interface IHistory {
    undo(): void;
    redo(): void;
}

interface HistoryState {
    list: Change[];
    index: number;
}

export class History implements IHistory {
    private readonly _state$: Writable<HistoryState>;
    public readonly index$: Readable<number>;
    public readonly count$: Readable<number>;
    public readonly canUndo$: Readable<boolean>;
    public readonly canRedo$: Readable<boolean>;

    constructor() {
        this._state$ = writable({
            index: 0,
            list: []
        });

        this.index$ = derived(this._state$, state => state.index);
        this.count$ = derived(this._state$, state => state.list.length);
        this.canUndo$ = derived(
            this._state$,
                state =>
                    state.index !== 0
        );
        this.canRedo$ = derived(this._state$, state => state.index !== state.list.length);
    }

    enqueue(change: Change): void {
        this._state$.update(h => {
            if (!change.undo) {
                return {
                    list: [],
                    index: 0
                }
            }

            return {
                list: [...h.list.slice(0, h.index), change],
                index: h.index + 1
            }
        });
    }

    undo(): void {
        let action : Action | undefined;

        this._state$.update(
            state => {
                if (state.index === 0)
                    return state;

                action = state.list[state.index - 1]?.undo;

                if (!state.list[state.index - 1]?.redo) {
                    return {
                        list: state.list.slice(0, state.index - 1),
                        index: state.index - 1
                    }
                }

                return {
                    list: state.list,
                    index: state.index - 1
                }
            }
        );

        if (action)
            action();
    }

    redo(): void {
        let action : Action | undefined;

        this._state$.update(
            state => {
                if (state.index === state.list.length)
                    return state;

                action = state.list[state.index]?.redo;

                return {
                    list: state.list,
                    index: state.index + 1
                }
            }
        );

        if (action)
            action();
    }

    get index(): number { return get(this.index$); }
    get count(): number { return get(this.count$); }
    get canUndo(): boolean { return get(this.canUndo$); }
    get canRedo(): boolean { return get(this.canRedo$); }
}
