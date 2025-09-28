<template>
  <div class="home-background"></div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.home-background {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: url("../../../assets/bj-box3.png") no-repeat;
  background-size: 100% 100%;
  z-index: 0; /* 确保背景在其他内容之下 */
  pointer-events: none; /* 确保背景不拦截鼠标事件 */
}
</style>
