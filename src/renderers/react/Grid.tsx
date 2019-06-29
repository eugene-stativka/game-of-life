import { css } from "emotion";
import React, { FC, useEffect, useState } from "react";
import { tap } from "rxjs/operators";
import { CELL_SIZE } from "../../constants";
import { CellStates, Life } from "../../types";
import { useLifeRendererProps } from "./LifeRendererPropsContext";

export const Grid: FC<{}> = () => {
  const [life, setLife] = useState<Life>([[]]);
  const { game } = useLifeRendererProps();

  useEffect(() => {
    const subscription = game.life$
      .pipe(tap(newLife => setLife(newLife)))
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <table
      className={css`
        border-collapse: collapse;
      `}
    >
      <tbody>
        {life.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td
                className={`${css`
                  height: ${CELL_SIZE - 1}px;
                  width: ${CELL_SIZE}px;
                  padding: 0;
                  border: 1px solid #3e3e3e;
                `} ${
                  CellStates.Alive === cell
                    ? css`
                        background-color: #09af00;
                      `
                    : css`
                        background-color: initial;
                      `
                }`}
                key={cellIndex}
                onClick={() => {
                  game.pause();
                  game.toggleCell({ x: cellIndex, y: rowIndex });
                }}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
