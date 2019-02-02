import { Subscription } from "rxjs";
import { CellStates } from "../types";
import { IRenderProperties } from "./types";

let subscription: Subscription;

export function render({
  lifeState$,
  target,
}: IRenderProperties): Subscription {
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

  renderGrid(ctx);

  subscription = lifeState$.subscribe(life => {
    life.forEach((line, x) => {
      line.forEach((item, y) => {
        ctx.fillStyle = item === CellStates.Alive ? "purple" : "white";
        ctx.fillRect(x * 5, y * 5, 4, 4);
      });
    });
  });

  return subscription;
}

function renderGrid(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "#e2e2e2";

  for (let i = 0; i <= 500; i += 5) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 495);
  }

  for (let i = 0; i <= 500; i += 5) {
    ctx.moveTo(0, i);
    ctx.lineTo(500, i);
  }

  ctx.stroke();
}
