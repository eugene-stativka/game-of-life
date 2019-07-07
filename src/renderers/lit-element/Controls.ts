import { css, customElement, html, LitElement, property } from "lit-element";
import { tap } from "rxjs/operators";
import { Game } from "../../core";
import { DisposeBag } from "../../helpers";
import { LifeRendererProps } from "../types";

@customElement("gl-le-controls")
export class Controls extends LitElement {
  public static get styles() {
    return css`
      .controls {
        display: flex;
        margin-bottom: 15px;
      }
    `;
  }

  public props!: LifeRendererProps;

  @property()
  private isRunning = false;

  @property()
  private speedLevel = 0;

  private readonly disposeBag = new DisposeBag();

  public connectedCallback() {
    super.connectedCallback();

    this.disposeBag.subscribe(
      this.props.game.isRunning$.pipe(
        tap(newIsRunning => (this.isRunning = newIsRunning)),
      ),
    );

    this.disposeBag.subscribe(
      this.props.game.speedLevel$.pipe(
        tap(newInterval => (this.speedLevel = newInterval)),
      ),
    );
  }

  public disconnectedCallback() {
    this.disposeBag.dispose();
  }

  public render() {
    const { columnsCount, game, rowsCount } = this.props;

    return html`
      <div class="controls">
        ${this.isRunning
          ? html`
              <button @click="${() => game.pause()}">Pause ⏸</button>
            `
          : html`
              <button @click="${() => game.play()}">Play ▶️</button>
            `}

        <button
          @click="${() => {
            game.setLife(Game.getRandomLife({ columnsCount, rowsCount }));
          }}"
        >
          Apply random state
        </button>

        <button @click="${() => game.resetLife()}">Reset</button>

        <input
          type="range"
          @change="${(event: Event) => {
            game.setSpeed(
              Number.parseInt((event.target as HTMLInputElement).value, 10),
            );
          }}"
          value="${this.speedLevel}"
        />
      </div>
    `;
  }
}
