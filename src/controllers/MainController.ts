import { css } from "emotion";
import { fromEvent } from "rxjs";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { CELL_SIZE } from "../constants";
import { Game } from "../core";
import { LifeRenderer, LifeRendererProps } from "../renderers";
import { CellStates } from "../types";
import { RenderModes } from "../types/RenderModes";

export class MainController {
  public static create(rootEl: HTMLElement, mode: RenderModes) {
    if (MainController.instance === undefined) {
      MainController.instance = new MainController(rootEl, mode);
    } else {
      throw new Error("MainController has already been initialized");
    }

    return MainController.instance;
  }

  private static instance: MainController;

  private readonly game: Game;
  private readonly rootEl: HTMLElement;
  private readonly scene = window.document.createElement("div");
  private readonly rendererSelect = window.document.createElement("select");
  private renderer: LifeRenderer;

  private constructor(rootEl: HTMLElement, defaultMode: RenderModes) {
    this.rootEl = rootEl;

    this.initRendererSelect(defaultMode);

    const { height, width } = this.initScene();

    const columnsCount = (width - (width % CELL_SIZE)) / CELL_SIZE;

    const rowsCount =
      (height - (height % CELL_SIZE) - CELL_SIZE * 10) / CELL_SIZE;

    this.game = new Game();

    this.game.setLife(
      Array(rowsCount).fill(Array(columnsCount).fill(CellStates.Dead)),
    );

    const rendererProps: LifeRendererProps = {
      columnsCount,
      game: this.game,
      rowsCount,
      target: this.scene,
    };

    this.renderer = RenderModes.mapToRenderer(defaultMode, rendererProps);

    fromEvent(this.rendererSelect, "change")
      .pipe(
        map(event => {
          if (!(event.target instanceof HTMLSelectElement)) {
            throw new Error("Render select is not HTMLSelectElement");
          }

          return Number.parseInt(event.target.value, 10);
        }),
        distinctUntilChanged(),
        tap(mode => {
          this.renderer.dispose();
          this.renderer = RenderModes.mapToRenderer(mode, rendererProps);
        }),
      )
      .subscribe();
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

  private initRendererSelect(defaultMode: RenderModes) {
    RenderModes.asArray().forEach(mode => {
      const option = window.document.createElement("option");

      option.value = String(mode);

      if (mode === defaultMode) {
        option.defaultSelected = true;
      }

      option.label = RenderModes.mapToLabel(mode);

      this.rendererSelect.appendChild(option);
    });

    this.rootEl.appendChild(this.rendererSelect);
  }
}
