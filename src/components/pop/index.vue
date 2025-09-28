<template>
  <div class="but" @click="getShow">
    <span>{{ title }}</span>
  </div>
  <pop ref="pop" :title="title">
    <slot></slot>
  </pop>
</template>

<script>
import pop from "./pop.vue";

export default {
  data() {
    return {};
  },
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  components: { pop },
  methods: {
    getShow() {
      this.$refs.pop.getShow();
    },
  },
};
</script>

<style lang="scss" scoped>
.but {
  position: absolute;
  right: 10px;
  top: -35px;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;
  color: #fff;
  font-size: 17px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.but:hover {
  background-color: rgba(45, 175, 233, 0.2); /* 背景颜色变化 */
  border-color: #00bfff; /* 边框颜色变化 */
  box-shadow: inset 0 0 15px rgba(45, 175, 233, 1), 0 0 10px rgba(45, 175, 233, 0.5); /* 内发光增强 + 外发光效果 */
  transform: scale(1.05); /* 轻微放大 */
}
</style>
