import { css } from "emotion";
import { MainController } from "./controllers";
import { RenderModes } from "./types/RenderModes";

main();

function main(): void {
  applyStyles();

  const rootEl = window.document.getElementById("root");

  if (!rootEl) {
    throw new Error("#root element should be defined");
  }

  MainController.create(rootEl, RenderModes.React);
}

function applyStyles(): void {
  window.document.body.classList.add(css`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    margin: 0;
    padding-left: 10px;
    padding-right: 10px;
    background-color: #222;
  `);
}
