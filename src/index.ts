import { css } from "emotion";
import { animationFrameScheduler, interval, Observable } from "rxjs";
import { scan } from "rxjs/operators";
import { render } from "./canvas";
import { CellStates, ICoordinates, LifeState } from "./types";

window.document.body.classList.add(css`
  color: gray;
`);

const width = 40;
const height = 20;

const initialLifeState: LifeState = Array.from({ length: width }, () =>
  Array.from({ length: height }, () =>
    Math.random() > 0.75 ? CellStates.Alive : CellStates.Dead,
  ),
);

render({
  lifeState$: getLifeState$(),
  target: window.document.getElementById("root") || window.document.body,
});

function getLifeState$(): Observable<LifeState> {
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
      initialLifeState,
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
