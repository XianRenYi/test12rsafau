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
  },
  mounted() {
    this.intLottie();
  },
  data() {
    return {
      path: alarmData,
    };
  },
  methods: {
    intLottie() {
      // 渲染主图按钮动画
      let lottieBox = lottie.loadAnimation({
        container: this.$refs.lottie, // 包含动画的dom元素
        renderer: this.renderer, // 渲染出来的是什么格式
        loop: true, // 循环播放
        autoplay: true, // 自动播放
        animationData: this.path,
      });
    },
    destory: function destory() {
      if (this.lottie) {
        this.lottie.destroy();
        this.lottie = null;
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
