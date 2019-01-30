import { css } from "emotion";
import { animationFrameScheduler, interval } from "rxjs";
import { scan } from "rxjs/operators";
import { render } from "./canvas";
import { CellStates, Life } from "./types";

window.document.body.classList.add(css`
  color: gray;
`);

const width = 10;
const height = 10;

const life: Life = Array.from({ length: width }, () =>
  Array.from({ length: height }, () =>
    Math.random() > 0.75 ? CellStates.Alive : CellStates.Dead,
  ),
);

render({
  life$: interval(1000, animationFrameScheduler).pipe(
    scan<number, Life>(
      (prevLife, _, i) =>
        i === 0
          ? prevLife
          : prevLife.map((line, x) =>
              line.map((item, y) => {
                const liveCellsAroundCount = [
                  (prevLife[x - 1] || [])[y - 1],
                  (prevLife[x] || [])[y - 1],
                  (prevLife[x + 1] || [])[y - 1],
                  (prevLife[x - 1] || [])[y],
                  (prevLife[x + 1] || [])[y],
                  (prevLife[x - 1] || [])[y + 1],
                  (prevLife[x] || [])[y + 1],
                  (prevLife[x + 1] || [])[y + 1],
                ].reduce((acc, cell) => acc + (cell || 0), 0);

                switch (true) {
                  case item === CellStates.Dead && liveCellsAroundCount === 3:
                    return CellStates.Alive;

                  case item === CellStates.Dead && liveCellsAroundCount !== 3:
                    return CellStates.Dead;

                  case liveCellsAroundCount === 2:
                  case liveCellsAroundCount === 3:
                    return CellStates.Alive;

                  default:
                    return CellStates.Dead;
                }
              }),
            ),
      life,
    ),
  ),
  target: window.document.getElementById("root") || window.document.body,
});
