<template>
  <table class="grid">
    <tbody>
      <tr :key="rowIndex" v-for="(row, rowIndex) in life">
        <td
          :key="cellIndex"
          v-bind:class="{ alive: aliveCell === cell, [cellCssClassName]: true }"
          v-for="(cell, cellIndex) in row"
          v-on:click="setSpeedLevel({ x: cellIndex, y: rowIndex })"
        ></td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { tap } from "rxjs/operators";
import Component from "vue-class-component";
import { css } from "emotion";
import { DisposeBag } from "../../helpers";
import { LifeRenderProps } from "./LifeRenderProps";
import { CellStates, Life } from "../../types";
import { CELL_SIZE } from "../../constants";

@Component
export default class Controls extends LifeRenderProps {
  public readonly cellHeight = `${CELL_SIZE - 1}px`;

  public readonly cellWidth = `${CELL_SIZE}px`;

  public readonly cellCssClassName = css`
    height: ${CELL_SIZE - 1}px;
    width: ${CELL_SIZE}px;
    padding: 0;
    border: 1px solid #3e3e3e;
  `;

  public readonly aliveCell = CellStates.Alive;

  public life: Life = [[]];

  private readonly disposeBag = new DisposeBag();

  public mounted() {
    this.disposeBag.subscribe(
      this.game.life$.pipe(
        tap(life => {
          this.life = life;
        }),
      ),
    );
  }

  public setSpeedLevel({ x, y }: Readonly<{ x: number; y: number }>) {
    this.game.pause();
    this.game.toggleCell({ x, y });
  }
}
</script>

<style scoped>
.grid {
  border-collapse: collapse;
}

.alive {
  background-color: #09af00;
}
</style>
