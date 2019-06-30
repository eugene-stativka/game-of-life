<template>
  <div>
    <Controls
      :game="game"
      :columnsCount="columnsCount"
      :rowsCount="rowsCount"
    ></Controls>

    <Grid
      :game="game"
      :columnsCount="columnsCount"
      :rowsCount="rowsCount"
    ></Grid>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component";
import Controls from "./Controls.vue";
import Grid from "./Grid.vue";
import { LifeRenderProps } from "./LifeRenderProps";

@Component({
  components: { Controls, Grid },
})
export default class App extends LifeRenderProps {}
</script>
