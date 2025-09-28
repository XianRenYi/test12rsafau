/**
* @Author: 858834013@qq.com
* @Name: item
* @Date: 2022-07-01
* @Desc:
*/
<template>
  <div class="itemBody">
    <echarts :list="list"></echarts>
  </div>
</template>

<script>
import echarts from './echarts/index.vue'

export default {
  name: "item",
  components: {echarts},
  data() {
    return {
      list: [],
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
    
      } catch (err) {
        console.error(err);
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.itemBody {
  width: 100%;
  height: calc(100% - 0px);
  position: relative;
}
</style>
