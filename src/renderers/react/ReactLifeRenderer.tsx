import * as React from "react";
import * as ReactDOM from "react-dom";
import { LifeRenderer } from "../LifeRenderer";
import { LifeRendererProps } from "../types";
import { Controls } from "./Controls";
import { Grid } from "./Grid";
import { LifeRendererPropsProvider } from "./LifeRendererPropsContext";

export class ReactLifeRenderer extends LifeRenderer {
  constructor(props: LifeRendererProps) {
    super(props);

    ReactDOM.render(
      <LifeRendererPropsProvider value={props}>
        <Controls />
        <Grid />
      </LifeRendererPropsProvider>,
      this.target,
    );
  }

  public dispose() {
    ReactDOM.unmountComponentAtNode(this.target);
  }
}
