<template>
  <div class="bottom-panel" ref="panel">
    <div class="hideBut" @click="togglePanel">
      <img :class="{ 'rotate-180': isPanelHidden }" src="./assets/icon_bottom.png" alt="">
    </div>
    <slot></slot>
  </div>
</template>

<script>
import {gsap} from "gsap";

export default {
  data() {
    return {
      isPanelHidden: false,
    };
  },
  methods: {
    togglePanel() {
      const panel = this.$refs.panel;
      if (this.isPanelHidden) {
        gsap.to(panel, {y: 0, duration: 0.5});
      } else {
        gsap.to(panel, {y: `${panel.offsetHeight}px`, duration: 0.5});
      }
      this.isPanelHidden = !this.isPanelHidden;
    },
  },
};
</script>

<style scoped>
.bottom-panel {
  position: relative;
  width: 100%;
  height: 100%;
}

.hideBut {
  cursor: pointer;
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: url("./assets/butbg_bottom.png") no-repeat;
  background-size: 100% 100%;
  height: 15px;
  width: 633px;
  pointer-events: initial;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  pointer-events: initial;
  align-content: flex-start;

  img {
    margin-top: -30px;
    cursor: pointer;
  }
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
