import * as React from "react";
import { FC, Fragment, useState } from "react";
import { RenderModes } from "./types/RenderModes";

export const App: FC = () => {
  const [renderMode, setRenderMode] = useState<RenderModes>(RenderModes.Canvas);

  return (
    <Fragment>
      <div>{renderMode === RenderModes.Canvas ? "Canvas" : "Not Canvas"}</div>
      <select
        value={renderMode}
        onChange={() => setRenderMode(RenderModes.Table)}
      >
        {Object.keys(RenderModes).map(k => (
          <option value={k}>{k}</option>
        ))}
      </select>
    </Fragment>
  );
};

App.displayName = "App";
