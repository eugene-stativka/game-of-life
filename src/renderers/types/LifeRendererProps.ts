import { Game } from "../../core";

export type LifeRendererProps = Readonly<{
  game: Game;
  target: HTMLElement;
  columnsCount: number;
  rowsCount: number;
}>;
