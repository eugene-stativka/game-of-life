import { Observable, Subscription } from "rxjs";
import { first, map, pairwise, share } from "rxjs/operators";
import { assertNever } from "../helpers/assertNever";
import { CellStates, LifeState } from "../types";
import { ILifeRenderer } from "./types";

export class CanvasLifeRenderer implements ILifeRenderer {
  public render({
    cellSize,
    lifeState$,
    target,
  }: Readonly<{
    cellSize: number;
    lifeState$: Observable<LifeState>;
    target: HTMLElement;
  }>): Subscription {
    let context: CanvasRenderingContext2D;

    const lifeStateShared$ = lifeState$.pipe(share());

    lifeStateShared$
      .pipe(
        first(),
        map(lifeState => ({
          height: lifeState[0].length * cellSize,
          width: lifeState.length * cellSize,
        })),
      )
      .subscribe(({ height, width }) => {
        context = initCanvas({ height, target, width });
        renderGrid({ cellSize, context, height, width });
      });

    return lifeStateShared$
      .pipe(pairwise())
      .subscribe(([prevState, nextState]) => {
        context.fillStyle = "#09af00";
        nextState.forEach((line, x) => {
          line.forEach((item, y) => {
            if (prevState[x][y] === item) {
              return;
            }

            const args: Parameters<typeof context.fillRect> = [
              x * cellSize + 0.5,
              y * cellSize + 0.5,
              cellSize - 1,
              cellSize - 1,
            ];

            switch (item) {
              case CellStates.Alive:
                context.fillRect(...args);
                break;
              case CellStates.Dead:
                context.clearRect(...args);
                break;
              default:
                assertNever(item);
                break;
            }
          });
        });
      });
  }
}

function renderGrid({
  cellSize,
  context,
  height,
  width,
}: {
  cellSize: number;
  context: CanvasRenderingContext2D;
  height: number;
  width: number;
}): void {
  context.strokeStyle = "#3e3e3e";

  for (let i = 0; i <= width; i += cellSize) {
    context.moveTo(i, 0);
    context.lineTo(i, height);
  }

  for (let i = 0; i <= height; i += cellSize) {
    context.moveTo(0, i);
    context.lineTo(width, i);
  }

  context.stroke();
}

function initCanvas({
  height,
  target,
  width,
}: {
  height: number;
  target: HTMLElement;
  width: number;
}): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Not able to get canvas context");
  }

  scaleCanvas({ context, canvas, width, height });
  target.appendChild(canvas);
  return context;
}

function scaleCanvas({
  canvas,
  context,
  height,
  width,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
}) {
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  context.scale(devicePixelRatio, devicePixelRatio);
}
