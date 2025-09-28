/**
* @Author: 858834013@qq.com
* @Name: pageItem
* @Date: 2024年11月13日16:13:36
* @Desc: vue3 数据可视化大屏蓝色边框
*/
<template>
  <div class="pageItemBody" :class="type">
    <div class="title">
      <span class="name">{{ title }}</span>
      <div class="titleRight">
        <slot name="right"></slot>
      </div>
    </div>
    <div class="itemMain">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "title",
  data() {
    return {}
  },
  props: {
    title: {
      type: String,
      default() {
        return '';
      }
    },
    /**
     * @description 边框类型
     * @type {string}
     * @value min - 使用小边框背景图bg.png
     * @value big - 使用大边框背景图bgBig.png
     * @default min
     */
    type: {
      type: String,
      default() {
        return 'min';
      },
      validator: function(value) {
        return ['min', 'big'].indexOf(value) !== -1
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.pageItemBody {
  width: 100%;
  position: relative;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: nowrap;
  flex-direction: column;
  z-index: 1;
  align-content: flex-start;

  &.min {
    background: url('./assets/bg.png') no-repeat;
    background-size: 100% 100%;
    background-color: #0f2e5a;
  }

  &.big {
    background: url('./assets/bgBig.png') no-repeat;
    background-size: 100% 100%;
    background-color: #0f2e5a;
  }

  .title {
    background: url('./assets/titlebg.png') left center no-repeat;
    height: 41px;
    width: calc(100% - 20px);
    border-bottom: 1px solid #054992;
    background-size: 453px 41px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    align-content: flex-start;
    margin-left: 10px;
    margin-top: 5px;

    .name {
      font-size: 18px;
      font-family: MicrosoftYaHei;
      font-weight: 700;
      color: #fff;
      margin-left: 10px;
      background: linear-gradient(180deg, #88ecfb, #66b6f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .titleRight {
      margin-right: 0px;
    }
  }
}

.itemMain {
  position: relative;
  width: 100%;
  height: calc(100% - 47px); // 修正高度计算
  box-sizing: border-box;
}
</style>