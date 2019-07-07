import { css, customElement, html, LitElement, property } from "lit-element";
import { tap } from "rxjs/operators";
import { CELL_SIZE } from "../../constants";
import { Game } from "../../core";
import { DisposeBag } from "../../helpers";
import { CellStates, Life } from "../../types";

@customElement("gl-le-grid")
export class Grid extends LitElement {
  public static get styles() {
    return css`
      table {
        border-collapse: collapse;
      }

      td {
        height: ${CELL_SIZE - 1}px;
        width: ${CELL_SIZE}px;
        padding: 0;
        border: 1px solid #3e3e3e;
      }

      .alive {
        background-color: #09af00;
      }
    `;
  }

  public props!: Readonly<{ game: Game }>;

  private readonly disposeBag = new DisposeBag();

  @property()
  private life: Life = [[]];

  public connectedCallback() {
    super.connectedCallback();

    this.disposeBag.subscribe(
      this.props.game.life$.pipe(tap(newLife => (this.life = newLife))),
    );
  }

  public disconnectedCallback() {
    this.disposeBag.dispose();
  }

  public render() {
    const { game } = this.props;

    return html`
      <table>
        <tbody>
          ${this.life.map(
            (row, rowIndex) => html`
              <tr>
                ${row.map(
                  (cell, cellIndex) => html`
                    <td
                      class="${cell === CellStates.Alive && "alive"}"
                      @click="${() => {
                        game.pause();
                        game.toggleCell({ x: cellIndex, y: rowIndex });
                      }}"
                    ></td>
                  `,
                )}
              </tr>
            `,
          )}
        </tbody>
      </table>
    `;
  }
}
