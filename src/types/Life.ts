import { CellStates } from "./CellStates";

export type Life = Readonly<{
  isRunning: boolean;
  interval: number;
  state: ReadonlyArray<ReadonlyArray<CellStates>>;
}>;
