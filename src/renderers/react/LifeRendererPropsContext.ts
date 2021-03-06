import { createContext, useContext } from "react";
import { Game } from "../../core";
import { LifeRendererProps } from "../types";

const context = createContext<LifeRendererProps>({
  columnsCount: 0,
  game: new Game(),
  rowsCount: 0,
  target: window.document.createElement("div"),
});

export const { Provider: LifeRendererPropsProvider } = context;

export const useLifeRendererProps = () => useContext(context);
