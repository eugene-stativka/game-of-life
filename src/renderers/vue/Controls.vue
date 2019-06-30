<template>
  <div class="controls">
    <button @click="pause" v-if="isRunning">Pause ⏸</button>
    <button @click="play" v-else>Play ▶️</button>
    <button @click="applyRandomState">Apply random state</button>
    <button @click="reset">Reset</button>
    <label>
      <input
        type="range"
        v-model="speedLevel"
        value="speedLevel"
        @change="setSpeedLevel"
      />
    </label>
  </div>
</template>

<script lang="ts">
import { tap } from "rxjs/operators";
import Component from "vue-class-component";
import { Game } from "../../core";
import { DisposeBag } from "../../helpers";
import { LifeRenderProps } from "./LifeRenderProps";

@Component
export default class Controls extends LifeRenderProps {
  public isRunning = false;

  public speedLevel = 50;

  private readonly disposeBag = new DisposeBag();

  public mounted() {
    this.disposeBag.subscribe(
      this.game.isRunning$.pipe(
        tap(isRunning => {
          this.isRunning = isRunning;
        }),
      ),
    );

    this.disposeBag.subscribe(
      this.game.speedLevel$.pipe(
        tap(speedLevel => {
          this.speedLevel = speedLevel;
        }),
      ),
    );
  }

  public beforeDestroy() {
    this.disposeBag.dispose();
  }

  public pause() {
    this.game.pause();
  }

  public play() {
    this.game.play();
  }

  public reset() {
    this.game.resetLife();
  }

  public applyRandomState() {
    this.game.setLife(
      Game.getRandomLife({
        columnsCount: this.columnsCount,
        rowsCount: this.rowsCount,
      }),
    );
  }

  public setSpeedLevel(event: Event) {
    this.game.setSpeed(
      Number.parseInt((event.target as HTMLInputElement).value, 10),
    );
  }
}
</script>

<style scoped>
.controls {
  margin-bottom: 15px;
}
</style>
