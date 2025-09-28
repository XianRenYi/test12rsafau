<template>
  <div class="itemBody">
    <RepairStatusChart ref="repairStatusChartRef" :list="list"></RepairStatusChart>
  </div>
</template>

<script>
// import echarts from "./highcharts/index.vue";
// import highcharts from "./highcharts/index.vue";
import RepairStatusChart from "./RepairStatusChart.vue";
import { proportionOfRespondingPolice } from "@/api/bigScreenIndex/bigScreen";
export default {
  name: "item",
  components: { RepairStatusChart },
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
    this.timer = setInterval(() => {
      this.getData();
    }, 30 * 1000); // 半分钟刷新一次
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    async getData() {
      this.list = [
        { name: "正常", value: 0 },
        { name: "待维护", value: 0 },
        { name: "报废", value: 0 },
      ];
      try {
        const res = await proportionOfRespondingPolice();
      
        
        this.list = res.data;
        // 在数据更新后立即刷新图表
        this.$nextTick(() => {
          this.$refs.repairStatusChartRef.createChart();
        });
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
