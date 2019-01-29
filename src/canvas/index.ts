import { Subscription } from "rxjs";
import { take } from "rxjs/operators";
import { CellStates } from "../types";
import { IRenderProperties } from "./types";

let subscription: Subscription;

export function render({ life$, target }: IRenderProperties): Subscription {
  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  canvas.setAttribute("width", "400px");
  canvas.setAttribute("height", "200px");
  canvas.setAttribute("id", "canvas");
  target.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Not able to init canvas");
  }

  ctx.scale(2, 2);

  if (subscription) {
    subscription.unsubscribe();
  }

  subscription = life$.pipe(take(3)).subscribe(life => {
    ctx.strokeStyle = "orange";

    for (let i = 0; i <= 500; i += 5) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 495);
    }

    for (let i = 0; i <= 500; i += 5) {
      ctx.moveTo(0, i);
      ctx.lineTo(500, i);
    }

    ctx.stroke();

    ctx.fillStyle = "purple";

    life.forEach((line, x) => {
      line.forEach((item, y) => {
        if (item === CellStates.Alive) {
          ctx.fillRect(x * 5, y * 5, 5, 5);
        }
      });
    });
  });

  return subscription;
}
