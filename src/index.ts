import { css } from "emotion";
import { CellStates } from "./CellStates";

window.document.body.classList.add(css`
  color: gray;
`);

window.document.body.innerHTML = String(CellStates.Alive);
