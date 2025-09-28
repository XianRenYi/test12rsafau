<template>
  <canvas ref="animation_canvas" class="animation_canvas" id="animation_canvas"></canvas>
</template>

<script>
import firstImage from './topbg/0.png';
export default {
  name: "sequence",
  data() {
    return {}
  },
  props: {
    // 文件数量
    fileLength: {
      type: Number,
      default() {
        return 124;
      }
    },
    // 动画间隔
    IntervalTime: {
      type: Number,
      default() {
        return 50;
      }
    },
  },
  async mounted() {
    var that = this;
    await that.Sequence()
  },
  methods: {
    async Sequence() {
      var that = this;
      //初始化参数
      var canvas = this.$refs.animation_canvas;
      var width = canvas.offsetWidth;
      var height = canvas.offsetHeight;
      var ctx = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;
      var sources = [];
      sources.push(firstImage);  // 使用静态导入的 firstImage

      //立即渲染第一张图片
      var initialImage = new Image();
      initialImage.src = firstImage;  // 直接使用 firstImage，不需要 .default
      initialImage.onload = function () {
        ctx.drawImage(initialImage, 0, 0, width, height);
      };


      //加载其他所有图片
      for (let i = 1; i <= that.fileLength; i++) {
        const image = await import(`./topbg/${i}.png`);
        sources.push(image.default);
      }

      function loadImages(sources, callback) {
        var loadedImages = 0;
        var numImages = sources.length;
        var images = [];
        for (var i = 0, len = sources.length; i < len; i++) {
          images[i] = new Image();
          images[i].onload = function () {
            if (++loadedImages >= numImages) {
              callback(images);
              that.backgroundImageLoaded = false;
            }
          };
          images[i].src = sources[i];
        }
      }

      function playImages(images) {
        var imageNum = images.length;
        var imageNow = 0;
        setInterval(function () {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(images[imageNow], 0, 0, width, height);
          imageNow++;
          if (imageNow >= imageNum) {
            imageNow = 0;
          }
        }, that.IntervalTime);
      }

      loadImages(sources, function (images) {
        playImages(images);
      });
    }
  },
}
</script>

<style lang="scss" scoped>
.animation_canvas {
  position: absolute;
  left: 0;
  top: 0px;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
