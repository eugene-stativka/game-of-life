import { css } from "emotion";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { animationFrameScheduler, interval, Observable } from "rxjs";
import { scan } from "rxjs/operators";
import { App } from "./App";
import { CanvasLifeRenderer } from "./canvas";
import { ILifeRenderer } from "./canvas/types";
import { assertNever } from "./helpers/assertNever";
import { CellStates, ICoordinates, LifeState } from "./types";
import { RenderModes } from "./types/RenderModes";

const CELL_SIZE = 10;
const RENDER_MODE = RenderModes.Canvas;

main2();

function main(): void {
  const lifeRenderer = getLifeRenderer({ renderMode: RENDER_MODE });
  const target = window.document.getElementById("root") || window.document.body;
  applyStyles({ target });
  const { height, width } = target.getBoundingClientRect();
  const columnsCount = (width - (width % CELL_SIZE)) / CELL_SIZE;
  const rowsCount =
    (height - (height % CELL_SIZE) - CELL_SIZE * 10) / CELL_SIZE;
  const initialState = getInitialLifeState({ columnsCount, rowsCount });
  const lifeState$ = getLifeState$({ initialState });
  lifeRenderer.render({ cellSize: CELL_SIZE, lifeState$, target });
}

function main2(): void {
  const target = window.document.getElementById("root") || window.document.body;
  ReactDOM.render(<App />, target);
}

function getLifeRenderer({
  renderMode,
}: {
  renderMode: RenderModes;
}): ILifeRenderer {
  switch (renderMode) {
    case RenderModes.Canvas:
    case RenderModes.Table: // TODO handle Table
      return new CanvasLifeRenderer();
    default:
      return assertNever(renderMode);
  }
}

function getLifeState$({
  initialState,
}: {
  initialState: LifeState;
}): Observable<LifeState> {
  return interval(0, animationFrameScheduler).pipe(
    scan<number, LifeState>(
      (prevLife, {}, i) =>
        i === 0
          ? prevLife
          : prevLife.map((line, x) =>
              line.map(({}, y) =>
                getNextCellState({
                  coordinates: { x, y },
                  lifeState: prevLife,
                }),
              ),
            ),
      initialState,
    ),
  );
}

function getNextCellState({
  coordinates: { x, y },
  lifeState,
}: {
  coordinates: ICoordinates;
  lifeState: LifeState;
}): CellStates {
  const prevCellState = lifeState[x][y];

  const aliveCellsAroundCount = [
    (lifeState[x - 1] || [])[y - 1],
    (lifeState[x] || [])[y - 1],
    (lifeState[x + 1] || [])[y - 1],
    (lifeState[x - 1] || [])[y],
    (lifeState[x + 1] || [])[y],
    (lifeState[x - 1] || [])[y + 1],
    (lifeState[x] || [])[y + 1],
    (lifeState[x + 1] || [])[y + 1],
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

function getInitialLifeState({
  columnsCount,
  rowsCount,
}: {
  columnsCount: number;
  rowsCount: number;
}): LifeState {
  return Array.from({ length: columnsCount }, () =>
    Array.from({ length: rowsCount }, () =>
      Math.random() > 0.75 ? CellStates.Alive : CellStates.Dead,
    ),
  );
}

function applyStyles({ target }: { target: HTMLElement }): void {
  window.document.body.classList.add(css`
    display: flex;
    min-height: 100vh;
    margin: 0;
    padding-left: 10px;
    padding-right: 10px;
    background-color: #222;
  `);

  target.classList.add(css`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  `);
}