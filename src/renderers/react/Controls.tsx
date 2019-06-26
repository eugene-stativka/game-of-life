import { css } from "emotion";
import React, { FC, useEffect, useState } from "react";
import { tap } from "rxjs/operators";
import { Game } from "../../core";
import { useLifeRendererProps } from "./LifeRendererPropsContext";

export const Controls: FC<{}> = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(0);
  const { columnsCount, game, rowsCount } = useLifeRendererProps();

  useEffect(() => {
    const isRunningSubscription = game.isRunning$
      .pipe(tap(newIsRunning => setIsRunning(newIsRunning)))
      .subscribe();

    const speedLevelSubscription = game.speedLevel$
      .pipe(tap(newInterval => setSpeedLevel(newInterval)))
      .subscribe();

    return () => {
      isRunningSubscription.unsubscribe();
      speedLevelSubscription.unsubscribe();
    };
  }, []);

  return (
    <div
      className={css`
        display: flex;
      `}
    >
      {isRunning ? (
        <button onClick={() => game.pause()}>Pause ⏸</button>
      ) : (
        <button onClick={() => game.play()}>Play ▶️</button>
      )}

      <button
        onClick={() =>
          game.setLife(Game.getRandomLife({ columnsCount, rowsCount }))
        }
      >
        Apply random state
      </button>

      <button onClick={() => game.resetLife()}>Reset</button>

      <input
        type="range"
        onChange={event => {
          game.setSpeed(
            Number.parseInt((event.target as HTMLInputElement).value, 10),
          );
        }}
        value={speedLevel}
      />
    </div>
  );
};
