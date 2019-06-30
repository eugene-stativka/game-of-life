import Vue from "vue";
import { Game } from "../../core";
import { LifeRenderer } from "../LifeRenderer";
import App from "./App.vue";

export class VueLifeRenderer extends LifeRenderer {
  private readonly vm: Vue;
  private readonly vueContainer = document.createElement("div");

  constructor(
    props: Readonly<{
      game: Game;
      target: HTMLElement;
      columnsCount: number;
      rowsCount: number;
    }>,
  ) {
    super(props);

    this.target.appendChild(this.vueContainer);

    this.vm = new Vue({
      el: this.vueContainer,
      render: h => h(App, { props: { game: props.game } }),
    });
  }

  public dispose() {
    this.vm.$destroy();

    while (this.target.firstChild) {
      this.target.removeChild(this.target.firstChild);
    }
  }
}
