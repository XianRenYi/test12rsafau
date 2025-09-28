/** * @Author: 858834013@qq.com * @Name: lottie * @Date: 2024年02月14日 * @Desc:
lottie封装 */
<template>
  <div ref="lottie" class="lottie"></div>
</template>

<script>
import lottie from "lottie-web";
import alarmData from "./data/data.json";

export default {
  props: {
    canvasId: {
      type: String,
      default: "canvasId",
    },
    renderer: {
      type: String,
      value: "svg",
    },
    isActive: {
      type: Boolean,
      default: false, // 默认不播放动画
    },
  },
  mounted() {
    this.intLottie();
  },
  data() {
    return {
      path: alarmData,
      lottieInstance: null, // 存储lottie实例
    };
  },
  watch: {
    isActive(newVal) {
      if (this.lottieInstance) {
        if (newVal) {
          this.lottieInstance.play();
        } else {
          this.lottieInstance.pause();
        }
      }
    },
  },
  methods: {
    intLottie() {
      // 渲染主图按钮动画
      this.lottieInstance = lottie.loadAnimation({
        container: this.$refs.lottie, // 包含动画的dom元素
        renderer: this.renderer, // 渲染出来的是什么格式
        loop: true, // 循环播放
        autoplay: this.isActive, // 根据isActive控制是否自动播放
        animationData: this.path,
      });
    },
    // 手动控制动画播放
    playAnimation() {
      if (this.lottieInstance) {
        this.lottieInstance.play();
      }
    },
    // 手动控制动画暂停
    pauseAnimation() {
      if (this.lottieInstance) {
        this.lottieInstance.pause();
      }
    },
    destory: function destory() {
      if (this.lottieInstance) {
        this.lottieInstance.destroy();
        this.lottieInstance = null;
      }
    },
  },
  onUnload() {
    this.destory();
  },
};
</script>

<style>
.lottie {
  width: 35px;
  height: 35px;
  position: relative;
  left: 0;
}
</style>
