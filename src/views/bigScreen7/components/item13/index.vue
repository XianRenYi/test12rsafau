
<template>
  <div class="itemBody">
    <echarts :list="list"></echarts>
  </div>
</template>

<script>
import echarts from './echarts/index.vue'
import { hourfiredistribution } from '@/api/bigScreenIndex/bigScreen'
export default {
  name: "item",
  components: {echarts},
  props: {
    active: {
      type: [String, Number],
      default() {
        return 0;
      }
    }
  },
  data() {
    return {
      list: [],
    }
  },
  watch: {
    active() {
      this.getData();
    },
  },
  mounted() {

    this.getData();
    setInterval(this.getData, 1000);
    

  },
  methods: {
    async getData() {
      try {
        const res =await hourfiredistribution();
        
        this.list = res.data;
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
