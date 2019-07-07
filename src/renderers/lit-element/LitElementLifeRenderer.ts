import { LifeRenderer } from "../LifeRenderer";
import { LifeRendererProps } from "../types";
import { Controls } from "./Controls";
import "./Controls";
import { Grid } from "./Grid";
import "./Grid";

export class LitElementLifeRenderer extends LifeRenderer {
  constructor(props: LifeRendererProps) {
    super(props);

    const controls = window.document.createElement(
      "gl-le-controls",
    ) as Controls;

    controls.props = props;

    this.target.appendChild(controls);

    const grid = window.document.createElement("gl-le-grid") as Grid;

    grid.props = { game: props.game };

    this.target.appendChild(grid);
  }

  public dispose() {
    while (this.target.firstChild) {
      this.target.removeChild(this.target.firstChild);
    }
  }
}
