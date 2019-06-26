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
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import {
  SPEED_LEVEL_DEFAULT_PERCENT,
  SPEED_LEVEL_MAX_PERCENT,
  SPEED_LEVEL_MIN_PERCENT,
} from "../constants";
import { CellStates, Coordinates, Life, SpeedInterval } from "../types";

const SPEED_INTERVAL_MULTIPLIER = 10;

export class Game {
  public get isRunning$() {
    return this.isRunningSubject$.pipe(distinctUntilChanged());
  }

  public get speedLevel$() {
    return this.intervalSubject$.pipe(
      distinctUntilChanged(),
      map(
        interval =>
          SPEED_LEVEL_MAX_PERCENT - interval / SPEED_INTERVAL_MULTIPLIER,
      ),
    );
  }

  public static getRandomLife({
    columnsCount,
    rowsCount,
  }: Readonly<{
    columnsCount: number;
    rowsCount: number;
  }>): Life {
    return Array.from({ length: rowsCount }, () =>
      Array.from({ length: columnsCount }, () =>
        Math.random() > 0.75 ? CellStates.Alive : CellStates.Dead,
      ),
    );
  }

  private static getNextCellState(
    { x, y }: Coordinates,
    life: Life,
  ): CellStates {
    const prevCellState = life[x][y];

    const aliveCellsAroundCount = [
      (life[x - 1] || [])[y - 1],
      (life[x] || [])[y - 1],
      (life[x + 1] || [])[y - 1],
      (life[x - 1] || [])[y],
      (life[x + 1] || [])[y],
      (life[x - 1] || [])[y + 1],
      (life[x] || [])[y + 1],
      (life[x + 1] || [])[y + 1],
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

  private static normalizeInterval(percent: number): SpeedInterval {
    return Math.abs(
      ((percent > SPEED_LEVEL_MIN_PERCENT
        ? Math.min(percent, SPEED_LEVEL_MAX_PERCENT)
        : SPEED_LEVEL_MIN_PERCENT) -
        SPEED_LEVEL_MAX_PERCENT) *
        SPEED_INTERVAL_MULTIPLIER,
    ) as SpeedInterval;
  }

  public readonly life$: Observable<Life>;

  private readonly isRunningSubject$ = new BehaviorSubject(false);

  private readonly intervalSubject$ = new BehaviorSubject(
    Game.normalizeInterval(SPEED_LEVEL_DEFAULT_PERCENT),
  );

  private readonly lifeSubject$ = new BehaviorSubject<Life>([[]]);

  constructor() {
    const updates$ = combineLatest([
      this.isRunning$,
      this.intervalSubject$,
    ]).pipe(
      switchMap(([isRunning, interval]) =>
        isRunning ? timer(0, interval) : NEVER,
      ),
      withLatestFrom(this.lifeSubject$, (_, state) => state),
      tap(prevLife => {
        this.lifeSubject$.next(
          prevLife.map((line, x) =>
            line.map(({}, y) => Game.getNextCellState({ x, y }, prevLife)),
          ),
        );
      }),
    );

    this.life$ = merge(updates$.pipe(ignoreElements()), this.lifeSubject$).pipe(
      shareReplay(1),
    );
  }

  public resetLife() {
    const life = this.lifeSubject$.getValue();

    this.lifeSubject$.next(life.map(row => row.map(() => CellStates.Dead)));
  }

  public setSpeed(percent: number) {
    this.intervalSubject$.next(Game.normalizeInterval(percent));
  }

  public setLife(life: Life) {
    this.lifeSubject$.next(life);
  }

  public play() {
    this.isRunningSubject$.next(true);
  }

  public pause() {
    this.isRunningSubject$.next(false);
  }

  public toggleCell({ x, y }: Coordinates) {
    const life = this.lifeSubject$.getValue();

    this.lifeSubject$.next([
      ...life.slice(0, y),
      life[y] && [
        ...life[y].slice(0, x),
        life[y][x] === CellStates.Dead ? CellStates.Alive : CellStates.Dead,
        ...life[y].slice(x + 1),
      ],
      ...life.slice(y + 1),
    ]);
  }
}
