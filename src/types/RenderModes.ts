import { assertNever } from "../helpers";
import {
  CanvasLifeRenderer,
  LifeRenderer,
  ReactLifeRenderer,
} from "../renderers";
import { LifeRendererProps } from "../renderers/types";
import { VueLifeRenderer } from "../renderers/vue/VueLifeRenderer";

export enum RenderModes {
  Canvas,
  React,
  Vue,
}

export namespace RenderModes {
  export function asArray() {
    return Object.keys(RenderModes)
      .map(key => parseInt(key, 10))
      .filter(Number.isInteger);
  }

  export function mapToLabel(mode: RenderModes): string {
    switch (mode) {
      case RenderModes.Canvas:
        return "Canvas";
      case RenderModes.React:
        return "React";
      case RenderModes.Vue:
        return "Vue";
      default:
        return assertNever(mode);
    }
  }

  export function mapToRenderer(
    mode: RenderModes,
    props: LifeRendererProps,
  ): LifeRenderer {
    switch (mode) {
      case RenderModes.Canvas:
        return new CanvasLifeRenderer(props);
      case RenderModes.React:
        return new ReactLifeRenderer(props);
      case RenderModes.Vue:
        return new VueLifeRenderer(props);
      default:
        return assertNever(mode);
    }
  }
}
