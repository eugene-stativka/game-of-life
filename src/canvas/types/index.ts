import { Observable } from "rxjs";
import { Life } from "../../types";

export interface IRenderProperties {
  readonly target: HTMLElement;
  readonly life$: Observable<Life>;
}
