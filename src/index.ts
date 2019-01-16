import { css } from "emotion";
import { CanvasAnimation } from "./CanvasAnimation";
import { CellStates } from "./CellStates";

window.document.body.classList.add(css`
  color: gray;
`);

window.document.body.innerHTML = String(CellStates.Alive);

// @ts-ignore
const canvasAnimation = new CanvasAnimation({
  render: (ctx: CanvasRenderingContext2D) => () => {
    ctx.beginPath();
    ctx.arc(95, 50, 40, 0, 2 * Math.PI);
    ctx.stroke();
  },
  target: window.document.body,
});
