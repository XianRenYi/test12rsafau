<script>
import { ref } from "vue";
import { RouterView } from "vue-router";
import ScaleScreen from "@/components/scale-screen";
import { useSettingStore } from "@/store/setting/setting";
import { storeToRefs } from "pinia";

const settingStore = useSettingStore();
const { isScale } = storeToRefs(settingStore);

export default {
  data() {
    return {
      scale: 1,
      containerStyle: {},
      isFullscreen: false,
      designWidth: 1920,
      designHeight: 1080,
    };
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("fullscreenchange", this.handleFullscreenChange);
    this.handleResize();

    // 延迟执行一次，确保初始渲染正确
    setTimeout(() => {
      this.handleResize();
    }, 100);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("fullscreenchange", this.handleFullscreenChange);
  },
  methods: {
    handleResize() {
      // 获取窗口尺寸（排除滚动条）
      const windowWidth = document.documentElement.clientWidth;
      const windowHeight = document.documentElement.clientHeight;

      // 计算宽高比
      const widthRatio = windowWidth / this.designWidth;
      const heightRatio = windowHeight / this.designHeight;

      // 取较小的比例作为缩放因子
      this.scale = Math.min(widthRatio, heightRatio);

      // 计算偏移量，使内容居中
      const offsetX = (windowWidth - this.designWidth * this.scale) / 2;
      const offsetY = (windowHeight - this.designHeight * this.scale) / 2;

      // 设置容器样式
      this.containerStyle = {
        transform: `scale(${this.scale})`,
        transformOrigin: "top left",
        position: "absolute",
        top: `${offsetY}px`,
        left: `${offsetX}px`,
        width: `${this.designWidth}px`,
        height: `${this.designHeight}px`,
        transition: "transform 0.3s ease, top 0.3s ease, left 0.3s ease",
      };

      console.log(`窗口尺寸: ${windowWidth}x${windowHeight}, 缩放比例: ${this.scale}`);
    },

    handleFullscreenChange() {
      this.isFullscreen = !!document.fullscreenElement;

      // 全屏切换后延迟执行，确保浏览器完成布局
      setTimeout(() => {
        this.handleResize();
      }, 100);
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
:root {
  overflow: hidden;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 全屏模式下的特殊处理 */
:fullscreen {
  background-color: #fff;
}
</style>
