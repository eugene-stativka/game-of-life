import { css } from "emotion";
import { animationFrameScheduler, interval } from "rxjs";
import { map, pairwise, startWith, tap } from "rxjs/operators";
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
    startWith(life),
    pairwise(),
    map(([prevLife]) =>
      !Array.isArray(prevLife)
        ? life
        : (prevLife as Life).map((line, x) => {
            return line.map((item, y) => {
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

              if (item === CellStates.Dead) {
                return liveCellsAroundCount === 3
                  ? CellStates.Alive
                  : CellStates.Dead;
              }

              if (liveCellsAroundCount === 2 || liveCellsAroundCount === 3) {
                return CellStates.Alive;
              }

              return CellStates.Dead;
            });
          }),
    ),
    // tslint:disable-next-line
    tap(v => console.log(v)),
  ),
  target: window.document.getElementById("root") || window.document.body,
});
