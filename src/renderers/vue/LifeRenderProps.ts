import Vue from "vue";
import { Game } from "../../core";

export const LifeRenderProps = Vue.extend({
  props: {
    columnsCount: Number,
    game: Game,
    rowsCount: Number,
  },
});
