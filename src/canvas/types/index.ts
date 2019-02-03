import { Observable } from "rxjs";
import { LifeState } from "../../types";

export interface ILifeRenderer {
  render(
    props: Readonly<{
      cellSize: number;
      lifeState$: Observable<LifeState>;
      target: HTMLElement;
    }>,
  ): void;
}
