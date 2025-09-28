<template>
  <div class="gridView">
    <!--    异形装饰-->
    <div class="zhuangshi">
      <img src="./assets/zhuangshi.png" alt="" />
    </div>
    <div class="line">
      <img src="./assets/line1.png" alt="" />
    </div>
    <div class="line2">
      <img src="./assets/line1.png" alt="" />
    </div>
    <div class="line3">
      <img src="./assets/line2.png" alt="" />
    </div>
    <div class="line4">
      <img src="./assets/line2.png" alt="" />
    </div>
    <!--  左上角-->
    <div class="gLeftTop"></div>
    <!--  顶部中间-->
    <div class="gTopCenter"></div>
    <!--  右上角-->
    <div class="gRightTop"></div>
    <!--    中间部分-->
    <div class="gCenterMain">
      <!--  左侧中间-->
      <div class="gLeftCenter"></div>
      <!--  右侧中间-->
      <div class="gRightCenter"></div>
      <!--  中间-->
      <div class="gCenter"></div>
    </div>
    <!--  左下角-->
    <div class="gLeftBottom"></div>
    <!--  底部中间-->
    <div class="gBottomCenter"></div>
    <!--  右下角-->
    <div class="gRightBottom"></div>
  </div>
</template>

<script>
export default {
  name: "gridView",
};
</script>

<style lang="scss" scoped>
.gridView {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 700px;
  max-height: 700px;
  min-height: 80px;
  min-width: 250px;
  bottom: 0;
  right: 0;
  z-index: -1;
  pointer-events: none; //避免div层被点击
  //左上角
  .gLeftTop {
    background: url("./assets/left_top.png") no-repeat;
    background-size: 100% 100%;
    position: absolute;
    left: 0;
    width: 9px;
    height: 9px;
  }

  //顶部中间
  .gTopCenter {
    width: calc(100% - 9px - 9px);
    left: 9px;
    position: absolute;
    height: 9px;
    background: url("./assets/top.png") repeat-x;
    background-size: 100% 100%;
  }

  //右上角
  .gRightTop {
    background: url("./assets/right_top.png") no-repeat;
    background-size: 100% 100%;
    position: absolute;
    right: 0;
    top: 0;
    width: 9px;
    height: 9px;
  }

  //左下角
  .gLeftBottom {
    background: url("./assets/left_bottom.png") no-repeat;
    background-size: 100% 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 64px;
    height: 68px;
  }

  //底部中间
  .gBottomCenter {
    width: calc(100% - 64px - 63px);
    left: 64px;
    bottom: 0;
    position: absolute;
    height: 68px;
    background: url("./assets/bottom.png") repeat-x;
    background-size: 100% 100%;
  }

  //右下角
  .gRightBottom {
    background: url("./assets/right_bottom.png") no-repeat;
    background-size: 100% 100%;
    position: absolute;
    right: 0;
    bottom: 0;
    width: 63px;
    height: 68px;
  }

  //中间部分
  .gCenterMain {
    width: 100%;
    height: calc(100% - 9px - 68px);
    position: absolute;
    top: 9px;
    bottom: 68px;
    //左侧中间
    .gLeftCenter {
      left: 0;
      height: 100%;
      position: absolute;
      background: url("./assets/left_center.png") repeat-y;
      background-size: 100%;
      width: 1px;
    }

    .gCenter {
      width: calc(100% - 1px - 1px);
      left: 1px;
      bottom: 0;
      position: absolute;
      height: 100%;
      background: url("./assets/center.png") no-repeat;
      background-size: 100% 100%;
    }

    //右侧中间
    .gRightCenter {
      height: 100%;
      position: absolute;
      right: 0;
      background: url("./assets/right_center.png");
      background-size: 100% 100%;
      width: 1px;
    }
  }
}

.zhuangshi {
  position: absolute;
  left: 0;
  top: 20%;
  z-index: 100;

  img {
    width: 5px;
    height: 70px;
  }
}

.line {
  position: absolute;
  left: 15%;
  top: -21px;
  z-index: 100;

  img {
    width: 136px;
    height: 42px;
  }
}

.line2 {
  position: absolute;
  left: 70%;
  top: -21px;
  z-index: 100;

  img {
    width: 136px;
    height: 42px;
  }
}

.line3 {
  position: absolute;
  left: -21px;
  top: 60%;
  z-index: 100;

  img {
    width: 43px;
    height: 136px;
  }
}
.line4 {
  position: absolute;
  right: -21px;
  top: 30%;
  z-index: 100;

  img {
    width: 43px;
    height: 136px;
  }
}
</style>
