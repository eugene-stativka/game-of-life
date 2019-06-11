import { css } from "emotion";
import {
  CELL_SIZE,
  SPEED_INTERVAL,
  SPEED_RANGE_DEFAULT_VALUE,
} from "../constants";
import { Game } from "../core";
import { CanvasLifeRenderer } from "../renderers/canvas";
import { LifeRenderer } from "../renderers/types";

export class MainController {
  private readonly game: Game;

  private readonly rootEl: HTMLElement;
  private readonly scene = window.document.createElement("div");

  // @ts-ignore
  private renderer: LifeRenderer;

  constructor({ rootEl }: Readonly<{ rootEl: HTMLElement }>) {
    this.rootEl = rootEl;

    const { height, width } = this.initScene();

    const columnsCount = (width - (width % CELL_SIZE)) / CELL_SIZE;

    const rowsCount =
      (height - (height % CELL_SIZE) - CELL_SIZE * 10) / CELL_SIZE;

    this.game = new Game({
      initialState: {
        interval: SPEED_RANGE_DEFAULT_VALUE * SPEED_INTERVAL,
        isRunning: false,
        state: Game.getRandomLifeState({ columnsCount, rowsCount }),
      },
    });

    this.renderer = new CanvasLifeRenderer({
      columnsCount,
      game: this.game,
      rowsCount,
      target: this.scene,
    });
  }

  private initScene() {
    this.rootEl.classList.add(css`
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      flex-direction: column;
    `);

    this.scene.classList.add(css`
      flex: 1;
    `);

    this.rootEl.appendChild(this.scene);

    return this.rootEl.getBoundingClientRect();
  }
}
