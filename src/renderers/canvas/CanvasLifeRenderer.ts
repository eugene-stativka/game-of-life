import { animationFrameScheduler, Observable } from "rxjs";
import { first, map, observeOn, pairwise } from "rxjs/operators";
import { CELL_SIZE } from "../../constants";
import { assertNever } from "../../helpers";
import { CellStates, Life } from "../../types";
import { ILifeRenderer } from "../types";

export class CanvasLifeRenderer implements ILifeRenderer {
  private readonly unsubscribeFns = new Set<() => void>();

  public dispose() {
    this.unsubscribeFns.forEach(fn => fn());
    this.unsubscribeFns.clear();
  }

  public render({
    life$,
    target,
  }: Readonly<{
    life$: Observable<Life>;
    target: HTMLElement;
  }>) {
    let context: CanvasRenderingContext2D;

    const lifeStateShared$ = life$.pipe(observeOn(animationFrameScheduler));

    lifeStateShared$
      .pipe(
        first(),
        map(life => ({
          height: life.state[0].length * CELL_SIZE,
          width: life.state.length * CELL_SIZE,
        })),
      )
      .subscribe(({ height, width }) => {
        context = initCanvas({ height, target, width });
        renderGrid({ context, height, width });
      });

    const subscription = lifeStateShared$
      .pipe(pairwise())
      .subscribe(([prevLife, nextLife]) => {
        context.fillStyle = "#09af00";
        nextLife.state.forEach((line, x) => {
          line.forEach((item, y) => {
            if (prevLife.state[x][y] === item) {
              return;
            }

            const args: Parameters<typeof context.fillRect> = [
              x * CELL_SIZE + 0.5,
              y * CELL_SIZE + 0.5,
              CELL_SIZE - 1,
              CELL_SIZE - 1,
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

    this.unsubscribeFns.add(subscription.unsubscribe);
  }
}

function renderGrid({
  context,
  height,
  width,
}: {
  context: CanvasRenderingContext2D;
  height: number;
  width: number;
}): void {
  context.strokeStyle = "#3e3e3e";

  for (let i = 0; i <= width; i += CELL_SIZE) {
    context.moveTo(i, 0);
    context.lineTo(i, height);
  }

  for (let i = 0; i <= height; i += CELL_SIZE) {
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
