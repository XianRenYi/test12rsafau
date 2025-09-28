<template>
  <div class="itemBody">
    <highcharts v-if="show" :list="list"></highcharts>
  </div>
</template>

<script>
import echarts from "./highcharts/index.vue";
import highcharts from "./highcharts/index.vue";
import { proportionOfRespondingPolice } from "@/api/bigScreenIndex/bigScreen";
export default {
  name: "item",
  components: { echarts, highcharts },
  data() {
    return {
      show: true,
      list: [],
      value: 0,
    };
  },
  props: {
    active: {
      type: Number,
      default() {
        return 0;
      },
    },
  },
  watch: {
    active() {
      this.getData();
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        const res = await proportionOfRespondingPolice();

        this.list = res.data;
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.itemBody {
  width: 100%;
  height: calc(100% - 0px);
  position: relative;
}
</style>
