<template>
  <div class="digitalIcon">
    <div class="iconTop" :data-status="item.status">
      <sequence></sequence>
      <i class="icon" :class="item.icon"></i>
    </div>
    <div class="iconBottom">
      <div class="iconBottomImg" ref="iconBottomImg"></div>
    </div>
  </div>
</template>

<script>
import sequence from "../sequence/index.vue";

export default {
  props: ['item'],
  components: {sequence}
}
</script>

<style lang="scss" scoped>
.digitalIcon {
  position: relative;
  width: 100PX;
  height: auto; // 高度由内容撑开
  display: flex;
  flex-direction: column;
  align-items: center; // 水平居中
  justify-content: flex-end; // 内容从底部开始排列

  .iconTop {
    //background: url("./assets/iconbg.png") no-repeat;
    width: 60PX;
    height: 60PX;
    //background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    align-content: flex-start;
    position: relative;
    icon{

    }
  }


  .iconBottom {
    position: relative;
    width: 66PX;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    align-content: flex-start;
    height: 23.5PX;

    .iconBottomImg {
      position: relative;
      background: url("./assets/dot.png") no-repeat;
      background-size: 100% 100%;
      width: 18PX;
      height: 72PX;
    }
  }
}
.digitalIcon {
  transform: scale(0.8); /* 在地图上可能需要缩小一点 */

  .iconTop {
    .icon {
      font-size: 30PX;
      color: #21bef4;
      position: relative;
      z-index: 100;
    }

    /* 根据状态调整图标颜色 */
    &[data-status="正常"] .icon,
    &[data-status="待命"] .icon {
      color: #00ff00;
    }

    &[data-status="维修中"] .icon,
    &[data-status="出动中"] .icon {
      color: #ff7e00;
    }
  }
}
</style>
