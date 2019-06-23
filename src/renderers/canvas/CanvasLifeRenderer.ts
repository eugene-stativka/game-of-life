import { animationFrameScheduler, fromEvent } from "rxjs";
import { first, observeOn, pairwise } from "rxjs/operators";
import {
  CELL_SIZE,
  SPEED_INTERVAL,
  SPEED_RANGE_DEFAULT_VALUE,
  SPEED_RANGE_MAX_VALUE,
} from "../../constants";
import { Game } from "../../core";
import { assertNever } from "../../helpers";
import { CellStates, Life } from "../../types";
import { LifeRenderer } from "../LifeRenderer";

export class CanvasLifeRenderer extends LifeRenderer {
  private readonly controls = window.document.createElement("div");
  private readonly gameArea = window.document.createElement("div");
  private readonly randomButton = window.document.createElement("button");
  private readonly startButton = window.document.createElement("button");
  private readonly stopButton = window.document.createElement("button");
  private readonly speedRange = window.document.createElement("input");
  private readonly canvas = document.createElement("canvas");
  private readonly context = this.canvas.getContext(
    "2d",
  ) as CanvasRenderingContext2D;

  constructor(
    props: Readonly<{
      game: Game;
      target: HTMLElement;
      columnsCount: number;
      rowsCount: number;
    }>,
  ) {
    super(props);

    const lifeStateShared$ = props.game.life$.pipe(
      observeOn(animationFrameScheduler),
    );

    this.disposeBag.subscribe(lifeStateShared$.pipe(first()), {
      next: life => {
        this.initControls();

        const height = life.state.length * CELL_SIZE;
        const width = life.state[0].length * CELL_SIZE;

        this.initCanvas({ height, target: props.target, width });

        this.initGrid({ height, width });

        this.renderCells([
          { isRunning: false, interval: 0, state: [[]] },
          life,
        ]);
      },
    });

    this.disposeBag.subscribe(lifeStateShared$.pipe(pairwise()), {
      next: ([prevLife, nextLife]) => {
        this.renderCells([prevLife, nextLife]);
      },
    });
  }

  public dispose() {
    super.dispose();

    while (this.target.firstChild) {
      this.target.removeChild(this.target.firstChild);
    }
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
    fragment.appendChild(this.gameArea);

    this.target.appendChild(fragment);

    fromEvent(this.startButton, "click").subscribe(() => this.game.run());

    fromEvent(this.stopButton, "click").subscribe(() => this.game.stop());

    fromEvent(this.randomButton, "click").subscribe(() => {
      this.game.setState(
        Game.getRandomLifeState({
          columnsCount: this.columnsCount,
          rowsCount: this.rowsCount,
        }),
      );
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

  private initGrid({ height, width }: { height: number; width: number }): void {
    this.context.strokeStyle = "#3e3e3e";

    for (let i = 0; i <= width; i += CELL_SIZE) {
      this.context.moveTo(i, 0);
      this.context.lineTo(i, height);
    }

    for (let i = 0; i <= height; i += CELL_SIZE) {
      this.context.moveTo(0, i);
      this.context.lineTo(width, i);
    }

    this.context.stroke();
  }

  private initCanvas({
    height,
    target,
    width,
  }: {
    height: number;
    target: HTMLElement;
    width: number;
  }) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    this.canvas.width = width * devicePixelRatio;
    this.canvas.height = height * devicePixelRatio;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";
    this.context.scale(devicePixelRatio, devicePixelRatio);
    target.appendChild(this.canvas);
  }

  private renderCells([prevLife, nextLife]: [Life, Life]) {
    this.context.fillStyle = "#09af00";
    nextLife.state.forEach((row, y) => {
      row.forEach((item, x) => {
        const prevLifeCell = prevLife.state[y] && prevLife.state[y][x];

        if (prevLifeCell !== undefined && prevLifeCell === item) {
          return;
        }

        const args: Parameters<CanvasRect["fillRect"]> = [
          x * CELL_SIZE + 0.5,
          y * CELL_SIZE + 0.5,
          CELL_SIZE - 1,
          CELL_SIZE - 1,
        ];

        switch (item) {
          case CellStates.Alive:
            this.context.fillRect(...args);
            break;
          case CellStates.Dead:
            this.context.clearRect(...args);
            break;
          default:
            assertNever(item);
            break;
        }
      });
    });
  }
}
