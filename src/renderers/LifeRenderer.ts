import { Game } from "../core";
import { IDisposable } from "../types/Disposable";
import { LifeRendererProps } from "./types";

export abstract class LifeRenderer implements IDisposable {
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

  public abstract dispose(): void;
}
