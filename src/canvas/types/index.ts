import { Observable } from "rxjs";
import { LifeState } from "../../types";

export interface IRenderProperties {
  readonly target: HTMLElement;
  readonly lifeState$: Observable<LifeState>;
}
