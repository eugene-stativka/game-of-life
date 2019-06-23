import { Game } from "../core";
import { DisposeBag } from "../helpers/DisposeBag";
import { IDisposable } from "../types/Disposable";
import { LifeRendererProps } from "./types";

export abstract class LifeRenderer implements IDisposable {
  protected readonly disposeBag = new DisposeBag();
  protected readonly game: Game;
  protected readonly target: HTMLElement;
  protected readonly columnsCount: number;
  protected readonly rowsCount: number;

  protected constructor(props: LifeRendererProps) {
    this.game = props.game;
    this.target = props.target;
    this.columnsCount = props.columnsCount;
    this.rowsCount = props.rowsCount;
  }

  public dispose() {
    this.disposeBag.dispose();
  }
}
