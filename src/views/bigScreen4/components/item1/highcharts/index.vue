<template>
  <div class="echarts1" :id="className" ref="echarts1"></div>
</template>

<script>
import highcharts from "highcharts";
import highcharts3d from "highcharts/highcharts-3d";

highcharts3d(highcharts);

export default {
  name: "echarts1",
  data() {
    return {
      className: "",
      chart: null, // 存储 Highcharts 实例
    };
  },
  props: {
    colorList: {
      type: Array,
      default() {
        return [];
      },
    },
    list: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  watch: {
    list() {
      this.drawLine();
    },
  },
  mounted() {
    this.className = "container" + this.randomString(10);
    this.$nextTick(() => {
      this.drawLine();
      window.addEventListener("resize", this.handleResize);
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    randomString(e) {
      e = e || 32;
      var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
      for (var i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
      return n;
    },
    drawLine() {
      if (this.chart) {
        this.chart.destroy(); // 销毁旧的实例
      }

      var that = this;
      this.chart = highcharts.chart(this.className, {
        title: {
          text: "",
        },
        chart: {
          type: "pie",
          backgroundColor: "rgba(0,0,0,0)",
          options3d: {
            enabled: true,
            alpha: 60,
            beta: 0,
          },
        },
        colors: [
          "rgba(249, 137, 66, 1)",
          "rgba(38, 237, 183, 1)",
          "rgba(48, 114, 228, 1)",
          "rgba(133, 199, 251, 1)",
          "rgb(177,51,213)",
        ],
        legend: {
          backgroundColor: "rgba(0,0,0,0)",
          shadow: false,
          layout: "vertical",
          align: "right",
          verticalAlign: "middle",
          symbolPadding: 10,
          symbolHeight: 10,
          padding: 0,
          itemMarginTop: 20,
          itemStyle: {
            fontSize: "17px",
            fontWeight: "100",
            color: "#fff",
          },
        },
        credits: {
          enabled: false,
        },
        tooltip: {
          pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
        },
        plotOptions: {
          pie: {
            allowPointSelect: false,
            cursor: "pointer",
            depth: 20,
            width: 1,
            size: 120,
            innerSize: 0,
            showInLegend: true,
            lineWidth: 1,
            borderWidth: 1,
            dataLabels: {
              padding: 0,
              format: "{y}<br>({point.percentage:.1f}%)",
              show: true,
              enabled: true,
              style: {
                color: "#fff",
                fontSize: "17px",
                fontWeight: "100",
                backgroundColor: "rgba(0,0,0,0.5)",
              },
            },
          },
        },
        series: [
          {
            type: "pie",
            name: "校准占比",
            data: that.list,
          },
        ],
      });
    },
    handleResize() {
      if (this.chart) {
        this.chart.reflow();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.echarts1 {
  position: relative;
  width: 100%;
  height: calc(100% - 0px);
}
</style>
