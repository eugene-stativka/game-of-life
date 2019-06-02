import { Observable } from "rxjs";
import { Life } from "../../types";

export interface ILifeRenderer {
  dispose(): void;

  render(
    props: Readonly<{
      life$: Observable<Life>;
      target: HTMLElement;
    }>,
  ): void;
}
