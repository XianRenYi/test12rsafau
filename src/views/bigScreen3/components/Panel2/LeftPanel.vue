<template>
  <div class="left-panel" ref="panel">
    <div class="bgInner">
    </div>
    <div class="bgInnerImg"></div>
    <div class="hideBut" @click="togglePanel">
      <img :class="{ 'rotate-180': isPanelHidden }" src="./assets/icon_left.png" alt="">
    </div>
    <!-- 插槽内容 -->
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
        gsap.to(panel, {x: 0, duration: 0.5});
      } else {
        gsap.to(panel, {x: `-${panel.offsetWidth}px`, duration: 0.5});
      }
      this.isPanelHidden = !this.isPanelHidden;
    },
  },
};
</script>

<style scoped>
.left-panel {
  position: relative; /* 确保相对定位 */
  width: 100%; /* 不限制宽度 */
  height: 100%; /* 不限制高度 */
}

.bgInner {
  position: absolute;
  left: -30px;
  width: 112%;
  height: 100%;
  background: #04223f;
  pointer-events: none;
  z-index: -100;
}

.bgInnerImg {

}

.hideBut {
  cursor: pointer;
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  background: url("./assets/butbg.png") no-repeat;
  background-size: 100% 100%;
  width: 15px;
  height: 633px;
  pointer-events: initial;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;

  img {
    margin-right: -30px;
    cursor: pointer;
  }
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
