import {
  BehaviorSubject,
  combineLatest,
  merge,
  NEVER,
  Observable,
  timer,
} from "rxjs";
import {
  distinctUntilChanged,
  ignoreElements,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { CellStates, ICoordinates, Life } from "../types";

export class Game {
  private static getNextCellState({
    coordinates: { x, y },
    state,
  }: {
    coordinates: ICoordinates;
    state: Life["state"];
  }): CellStates {
    const prevCellState = state[x][y];

    const aliveCellsAroundCount = [
      (state[x - 1] || [])[y - 1],
      (state[x] || [])[y - 1],
      (state[x + 1] || [])[y - 1],
      (state[x - 1] || [])[y],
      (state[x + 1] || [])[y],
      (state[x - 1] || [])[y + 1],
      (state[x] || [])[y + 1],
      (state[x + 1] || [])[y + 1],
    ].reduce((acc, cell) => acc + (cell || 0), 0);

    switch (true) {
      case prevCellState === CellStates.Dead && aliveCellsAroundCount === 3:
        return CellStates.Alive;

      case prevCellState === CellStates.Dead && aliveCellsAroundCount !== 3:
        return CellStates.Dead;

      case aliveCellsAroundCount === 2:
      case aliveCellsAroundCount === 3:
        return CellStates.Alive;

      default:
        return CellStates.Dead;
    }
  }

  public readonly life$: Observable<Life>;
  private readonly commands$ = new BehaviorSubject<Partial<Life>>({});

  constructor({ initialState }: Readonly<{ initialState: Life }>) {
    const life$: Observable<Life> = this.commands$.pipe(
      startWith(initialState),
      scan<Partial<Life>, Life>((life, command) => ({ ...life, ...command })),
      shareReplay(1),
    );

    const isRunning$ = life$.pipe(
      map(state => state.isRunning),
      distinctUntilChanged(),
    );

    const interval$ = life$.pipe(
      map(state => state.interval),
      distinctUntilChanged(),
    );

    const updates$ = combineLatest(isRunning$, interval$).pipe(
      switchMap(([isRunning, interval]) =>
        isRunning ? timer(0, interval) : NEVER,
      ),
      withLatestFrom(life$, (_, state) => state),
      tap(prevLife => {
        this.commands$.next({
          state: prevLife.state.map((line, x) =>
            line.map(({}, y) =>
              Game.getNextCellState({
                coordinates: { x, y },
                state: prevLife.state,
              }),
            ),
          ),
        });
      }),
    );

    this.life$ = merge(updates$.pipe(ignoreElements()), life$);
  }

  public setInterval(interval: Life["interval"]) {
    this.commands$.next({ interval });
  }

  public setState(state: Life["state"]) {
    this.commands$.next({ state });
  }

  public run() {
    this.commands$.next({ isRunning: true });
  }

  public stop() {
    this.commands$.next({ isRunning: false });
  }
}
