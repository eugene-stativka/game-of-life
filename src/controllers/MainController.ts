import { css } from "emotion";
import { fromEvent } from "rxjs";
import { CELL_SIZE } from "../constants";
import { Game } from "../core";
import { CanvasLifeRenderer } from "../renderers/canvas";
import { ILifeRenderer } from "../renderers/types";
import { CellStates, Life } from "../types";

const SPEED_INTERVAL = 10;
const SPEED_RANGE_MAX_VALUE = 100;
const SPEED_RANGE_DEFAULT_VALUE = Math.floor(SPEED_RANGE_MAX_VALUE / 2);

export class MainController {
  private get randomLifeState(): Life["state"] {
    return Array.from({ length: this.columnsCount }, () =>
      Array.from({ length: this.rowsCount }, () =>
        Math.random() > 0.75 ? CellStates.Alive : CellStates.Dead,
      ),
    );
  }

  private readonly columnsCount: number;
  private readonly rowsCount: number;
  private readonly game: Game;

  private readonly rootEl: HTMLElement;
  private readonly controls = window.document.createElement("div");
  private readonly randomButton = window.document.createElement("button");
  private readonly scene = window.document.createElement("div");
  private readonly startButton = window.document.createElement("button");
  private readonly stopButton = window.document.createElement("button");
  private readonly speedRange = window.document.createElement("input");

  private renderer: ILifeRenderer = new CanvasLifeRenderer();

  constructor({ rootEl }: Readonly<{ rootEl: HTMLElement }>) {
    this.rootEl = rootEl;

    this.initControls();

    const { height, width } = this.initScene();

    this.columnsCount = (width - (width % CELL_SIZE)) / CELL_SIZE;

    this.rowsCount =
      (height - (height % CELL_SIZE) - CELL_SIZE * 10) / CELL_SIZE;

    this.game = new Game({
      initialState: {
        interval: SPEED_RANGE_DEFAULT_VALUE * SPEED_INTERVAL,
        isRunning: false,
        state: this.randomLifeState,
      },
    });
  }

  public render() {
    this.renderer.render({
      life$: this.game.life$,
      target: this.scene,
    });
  }

  private initControls() {
    this.startButton.innerHTML = "Start";
    this.stopButton.innerHTML = "Stop";
    this.randomButton.innerHTML = "Apply random state";
    this.speedRange.setAttribute("type", "range");
    this.speedRange.value = String(SPEED_RANGE_DEFAULT_VALUE);

    this.controls.appendChild(this.startButton);
    this.controls.appendChild(this.stopButton);
    this.controls.appendChild(this.randomButton);
    this.controls.appendChild(this.speedRange);

    const fragment = window.document.createDocumentFragment();

    fragment.appendChild(this.controls);
    fragment.appendChild(this.scene);

    this.rootEl.appendChild(fragment);

    fromEvent(this.startButton, "click").subscribe(() => this.game.run());

    fromEvent(this.stopButton, "click").subscribe(() => this.game.stop());

    fromEvent(this.randomButton, "click").subscribe(() => {
      this.game.setState(this.randomLifeState);
    });

    fromEvent(this.speedRange, "change").subscribe(event => {
      const value = Number.parseInt(
        (event.target as HTMLInputElement).value,
        10,
      );
      this.game.setInterval(
        Math.abs(value - SPEED_RANGE_MAX_VALUE) * SPEED_INTERVAL,
      );
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

    return this.rootEl.getBoundingClientRect();
  }
}
