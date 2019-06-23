import { css } from "emotion";
import React, { FC, useEffect, useState } from "react";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { SPEED_INTERVAL, SPEED_RANGE_MAX_VALUE } from "../../constants";
import { Game } from "../../core";
import { useLifeRendererProps } from "./LifeRendererPropsContext";

export const Controls: FC<{}> = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { columnsCount, game, rowsCount } = useLifeRendererProps();

  useEffect(() => {
    const subscription = game.life$
      .pipe(
        map(life => life.isRunning),
        distinctUntilChanged(),
        tap(newIsRunning => setIsRunning(newIsRunning)),
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div
      className={css`
        display: flex;
      `}
    >
      {isRunning ? (
        <button onClick={() => game.stop()}>Pause ⏸</button>
      ) : (
        <button onClick={() => game.run()}>Play ▶️</button>
      )}

      <button
        onClick={() =>
          game.setState(Game.getRandomLifeState({ columnsCount, rowsCount }))
        }
      >
        Apply random state
      </button>

      <input
        type="range"
        onChange={event => {
          const value = Number.parseInt(
            (event.target as HTMLInputElement).value,
            10,
          );

          game.setInterval(
            Math.abs(value - SPEED_RANGE_MAX_VALUE) * SPEED_INTERVAL,
          );
        }}
      />
    </div>
  );
};
