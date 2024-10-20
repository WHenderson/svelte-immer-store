import { Readable } from "svelte/store";
import { Action } from "./action";
export interface Change {
    undo?: Action;
    redo?: Action;
}
export declare type EnqueueChange = (change: Change) => void;
export interface IHistory {
    undo(): void;
    redo(): void;
}
export declare class History implements IHistory {
    private readonly _state$;
    readonly index$: Readable<number>;
    readonly count$: Readable<number>;
    readonly canUndo$: Readable<boolean>;
    readonly canRedo$: Readable<boolean>;
    readonly enqueue: (change: Change) => void;
    constructor();
    private _enqueue;
    undo(): void;
    redo(): void;
    get index(): number;
    get count(): number;
    get canUndo(): boolean;
    get canRedo(): boolean;
}
//# sourceMappingURL=history.d.ts.map