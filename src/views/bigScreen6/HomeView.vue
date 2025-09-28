<script>
export default {
  data() {
    return {
      scale: 1,
      containerStyle: {},
      isFullscreen: false,
    };
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("fullscreenchange", this.handleFullscreenChange);
    this.handleResize();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("fullscreenchange", this.handleFullscreenChange);
  },
  methods: {
    handleResize() {
      // 区分全屏和非全屏模式的缩放逻辑
      if (this.isFullscreen) {
        // 全屏模式使用更激进的缩放策略
        const windowWidth = document.documentElement.clientWidth;
        const windowHeight = document.documentElement.clientHeight;
        const designWidth = 1920;
        const designHeight = 1080;

        const widthRatio = windowWidth / designWidth;
        const heightRatio = windowHeight / designHeight;

        this.scale = Math.min(widthRatio, heightRatio);

        this.containerStyle = {
          transform: `scale(${this.scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: "0",
          left: "0",
          width: `${designWidth}px`,
          height: `${designHeight}px`,
        };
      } else {
        // 非全屏模式使用固定缩放比例
        this.scale = 0.75;
        this.containerStyle = {
          transform: `scale(${this.scale})`,
          transformOrigin: "center center",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${this.scale})`,
          width: `${100 / this.scale}%`,
          height: `${100 / this.scale}%`,
        };
      }
    },

    handleFullscreenChange() {
      this.isFullscreen = !!document.fullscreenElement;
      this.handleResize();
    },
  },
};
</script>
<template>
  <div :style="containerStyle">
    <RouterView />
    <MessageContent />
  </div>
</template>

<style lang="scss" scoped>
/* 添加一些基础样式 */
:root {
  overflow: hidden; /* 防止出现滚动条 */
}

/* 确保所有元素都使用设计稿尺寸 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
