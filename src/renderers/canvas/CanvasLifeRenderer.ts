import { css } from "emotion";
import { animationFrameScheduler, fromEvent } from "rxjs";
import { first, map, observeOn, pairwise, tap } from "rxjs/operators";
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
  private readonly resetButton = window.document.createElement("button");
  private readonly playButton = window.document.createElement("button");
  private readonly pauseButton = window.document.createElement("button");
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

    this.disposeBag.subscribe(
      lifeStateShared$.pipe(
        first(),
        tap(life => {
          this.initControls();

          const height = life.length * CELL_SIZE;
          const width = life[0].length * CELL_SIZE;

          this.initCanvas({ height, target: props.target, width });

          this.initGrid({ height, width });

          this.renderCells([[[]], life]);
        }),
      ),
    );

    this.disposeBag.subscribe(
      lifeStateShared$.pipe(
        pairwise(),
        tap(([prevLife, nextLife]) => {
          this.renderCells([prevLife, nextLife]);
        }),
      ),
    );
  }

  public dispose() {
    this.disposeBag.dispose();

    while (this.target.firstChild) {
      this.target.removeChild(this.target.firstChild);
    }
  }

  private initControls() {
    this.playButton.innerHTML = "Play ▶️";
    this.playButton.style.display = "none";
    this.pauseButton.innerHTML = "Pause ⏸";
    this.pauseButton.style.display = "none";
    this.randomButton.innerHTML = "Apply random state";
    this.resetButton.innerHTML = "Reset";
    this.speedRange.setAttribute("type", "range");
    this.speedRange.value = String(SPEED_LEVEL_DEFAULT_PERCENT);

    this.controls.appendChild(this.playButton);
    this.controls.appendChild(this.pauseButton);
    this.controls.appendChild(this.randomButton);
    this.controls.appendChild(this.resetButton);
    this.controls.appendChild(this.speedRange);

    this.controls.classList.add(css`
      margin-bottom: 15px;
    `);

    const fragment = window.document.createDocumentFragment();

    fragment.appendChild(this.controls);
    fragment.appendChild(this.gameArea);

    this.target.appendChild(fragment);

    this.disposeBag.subscribe(
      fromEvent(this.playButton, "click").pipe(tap(() => this.game.play())),
    );

    this.disposeBag.subscribe(
      fromEvent(this.pauseButton, "click").pipe(tap(() => this.game.pause())),
    );

    this.disposeBag.subscribe(
      fromEvent(this.randomButton, "click").pipe(
        tap(() =>
          this.game.setLife(
            Game.getRandomLife({
              columnsCount: this.columnsCount,
              rowsCount: this.rowsCount,
            }),
          ),
        ),
      ),
    );

    this.disposeBag.subscribe(
      fromEvent(this.resetButton, "click").pipe(
        tap(() => this.game.resetLife()),
      ),
    );

    this.disposeBag.subscribe(
      fromEvent(this.speedRange, "change").pipe(
        tap(event => {
          this.game.setSpeed(
            Number.parseInt((event.target as HTMLInputElement).value, 10),
          );
        }),
      ),
    );

    this.disposeBag.subscribe(
      this.game.speedLevel$.pipe(
        tap(speedLevel => {
          this.speedRange.value = String(speedLevel);
        }),
      ),
    );

    this.disposeBag.subscribe(
      fromEvent<MouseEvent>(this.canvas, "click").pipe(
        map(event => ({
          x: Math.floor(event.offsetX / CELL_SIZE),
          y: Math.floor(event.offsetY / CELL_SIZE),
        })),
        tap(coordinates => {
          this.game.pause();
          this.game.toggleCell(coordinates);
        }),
      ),
    );

    this.disposeBag.subscribe(
      this.game.isRunning$.pipe(
        tap(isRunning => {
          if (isRunning) {
            this.playButton.style.display = "none";
            this.pauseButton.style.display = "inline";
          } else {
            this.playButton.style.display = "inline";
            this.pauseButton.style.display = "none";
          }
        }),
      ),
    );
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
