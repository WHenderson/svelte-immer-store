import {History} from "../src/history";
import {get} from "svelte/store";

it('history', () => {
    const history = new History();

    expect(history.canUndo).toBeFalsy();
    expect(history.canRedo).toBeFalsy();
    expect(history.index).toEqual(0);
    expect(history.count).toEqual(0);

    // test invalid undo/redo
    history.undo();
    history.redo();

    let value = 1;

    const add = (x: number) => {
        value += x;

        history.enqueue({
            undo() {
                value -= x;
            },
            redo() {
                value += x;
            }
        });
    };

    const noRedo = (once: () => number) => {
        const old = value;
        value = once();

        history.enqueue({
            undo() {
                value = old;
            }
        });
    };

    const noUndo = (once: () => number) => {
        value = once();

        history.enqueue({
        });
    }

    const mul = (x: number) => {
        value *= x;

        if (!Number.isSafeInteger(value) || !Number.isSafeInteger(x) || value === 0 || x === 0) {
            history.enqueue({
                redo() {
                    value *= x;
                }
            });
        }

        history.enqueue({
            undo() {
                value += x;
            },
            redo() {
                value *= x;
            }
        });
    };

    add(2);

    expect(value).toEqual(1 + 2);
    expect(history.canUndo).toBeTruthy();
    expect(history.canRedo).toBeFalsy();
    expect(history.index).toEqual(1);
    expect(history.count).toEqual(1);

    add(3);

    expect(value).toEqual(1 + 2 + 3);
    expect(history.canUndo).toBeTruthy();
    expect(history.canRedo).toBeFalsy();
    expect(history.index).toEqual(2);
    expect(history.count).toEqual(2);

    history.undo();

    expect(value).toEqual(1 + 2);
    expect(history.canUndo).toBeTruthy();
    expect(history.canRedo).toBeTruthy();
    expect(history.index).toEqual(1);
    expect(history.count).toEqual(2);

    history.undo();

    expect(value).toEqual(1);
    expect(history.canUndo).toBeFalsy();
    expect(history.canRedo).toBeTruthy();
    expect(history.index).toEqual(0);
    expect(history.count).toEqual(2);

    history.redo();

    expect(value).toEqual(1 + 2);
    expect(history.canUndo).toBeTruthy();
    expect(history.canRedo).toBeTruthy();
    expect(history.index).toEqual(1);
    expect(history.count).toEqual(2);

    add(5);

    expect(value).toEqual(1 + 2 + 5);
    expect(history.canUndo).toBeTruthy();
    expect(history.canRedo).toBeFalsy();
    expect(history.index).toEqual(2);
    expect(history.count).toEqual(2);

    history.undo();

    expect(value).toEqual(1 + 2);
    expect(history.canUndo).toBeTruthy();
    expect(history.canRedo).toBeTruthy();
    expect(history.index).toEqual(1);
    expect(history.count).toEqual(2);

    noRedo(() => 7);

    expect(value).toEqual(7);
    expect(history.canUndo).toBeTruthy();
    expect(history.canRedo).toBeFalsy();
    expect(history.index).toEqual(2);
    expect(history.count).toEqual(2);

    history.undo();

    expect(value).toEqual(1 + 2);
    expect(history.canUndo).toBeTruthy();
    expect(history.canRedo).toBeFalsy();
    expect(history.index).toEqual(1);
    expect(history.count).toEqual(1);

    noUndo(() => 11);

    expect(value).toEqual(11);
    expect(history.canUndo).toBeFalsy();
    expect(history.canRedo).toBeFalsy();
    expect(history.index).toEqual(0);
    expect(history.count).toEqual(0);
});
