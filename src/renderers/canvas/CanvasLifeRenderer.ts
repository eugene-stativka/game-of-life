import { animationFrameScheduler, fromEvent } from "rxjs";
import { first, map, observeOn, pairwise } from "rxjs/operators";
import { CELL_SIZE, SPEED_LEVEL_DEFAULT_PERCENT } from "../../constants";
import { Game } from "../../core";
import { assertNever, DisposeBag } from "../../helpers";
import { CellStates, Life } from "../../types";
import { LifeRenderer } from "../LifeRenderer";

export class CanvasLifeRenderer extends LifeRenderer {
  private readonly disposeBag = new DisposeBag();
  private readonly controls = window.document.createElement("div");
  private readonly gameArea = window.document.createElement("div");
  private readonly randomButton = window.document.createElement("button");
  private readonly startButton = window.document.createElement("button");
  private readonly stopButton = window.document.createElement("button");
  private readonly speedRange = window.document.createElement("input");
  private readonly canvas = window.document.createElement("canvas");
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

        const height = life.length * CELL_SIZE;
        const width = life[0].length * CELL_SIZE;

        this.initCanvas({ height, target: props.target, width });

        this.initGrid({ height, width });

        this.renderCells([[[]], life]);
      },
    });

    this.disposeBag.subscribe(lifeStateShared$.pipe(pairwise()), {
      next: ([prevLife, nextLife]) => {
        this.renderCells([prevLife, nextLife]);
      },
    });

    this.disposeBag.subscribe(
      fromEvent<MouseEvent>(this.canvas, "click").pipe(
        map(event => ({
          x: Math.floor(event.offsetX / CELL_SIZE),
          y: Math.floor(event.offsetY / CELL_SIZE),
        })),
      ),
      {
        next: coordinates => {
          this.game.toggleCell(coordinates);
        },
      },
    );
  }

  public dispose() {
    this.disposeBag.dispose();

    while (this.target.firstChild) {
      this.target.removeChild(this.target.firstChild);
    }
  }

  private initControls() {
    this.startButton.innerHTML = "Start";
    this.stopButton.innerHTML = "Stop";
    this.randomButton.innerHTML = "Apply random state";
    this.speedRange.setAttribute("type", "range");
    this.speedRange.value = String(SPEED_LEVEL_DEFAULT_PERCENT);

    this.controls.appendChild(this.startButton);
    this.controls.appendChild(this.stopButton);
    this.controls.appendChild(this.randomButton);
    this.controls.appendChild(this.speedRange);

    const fragment = window.document.createDocumentFragment();

    fragment.appendChild(this.controls);
    fragment.appendChild(this.gameArea);

    this.target.appendChild(fragment);

    fromEvent(this.startButton, "click").subscribe(() => this.game.play());

    fromEvent(this.stopButton, "click").subscribe(() => this.game.pause());

    fromEvent(this.randomButton, "click").subscribe(() => {
      this.game.setLife(
        Game.getRandomLife({
          columnsCount: this.columnsCount,
          rowsCount: this.rowsCount,
        }),
      );
    });

    fromEvent(this.speedRange, "change").subscribe(event => {
      this.game.setSpeed(
        Number.parseInt((event.target as HTMLInputElement).value, 10),
      );
    });

    this.disposeBag.subscribe(this.game.speedLevel$, {
      next: speedLevel => {
        this.speedRange.value = String(speedLevel);
      },
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
    nextLife.forEach((row, y) => {
      row.forEach((item, x) => {
        const prevLifeCell = prevLife[y] && prevLife[y][x];

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
