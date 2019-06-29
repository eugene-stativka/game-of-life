import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { IDisposable } from "../types/Disposable";

export class DisposeBag implements IDisposable {
  private readonly dispose$ = new Subject();

  public dispose() {
    this.dispose$.next();
  }

  public subscribe<T>(observable: Observable<T>) {
    return observable.pipe(takeUntil(this.dispose$)).subscribe();
  }
}
