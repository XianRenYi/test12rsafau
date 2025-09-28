<template>
  <div class="item5-container">
    <div class="indicators">
      <div class="indicator-item">
        <span class="label">日处理量达标率:</span>
        <span class="value" :class="{'value-error': isErrorRate(reachRate)}">
          <gsap-number :from="0" :to="reachRate" :duration="1.5" />%
        </span>
      </div>
      <div class="indicator-item">
        <span class="label">系统负荷率:</span>
        <span class="value" :class="{'value-error': isErrorLoad(loadRate)}">
          <gsap-number :from="0" :to="loadRate" :duration="1.5" />%
        </span>
      </div>
      <div class="indicator-item">
        <span class="label">处理效率提升:</span>
        <span class="value" :class="{'value-error': isErrorEfficiency(efficiencyRate)}">
          <span v-if="efficiencyRate > 0">+</span><gsap-number :from="0" :to="efficiencyRate" :duration="1.5" />%
        </span>
      </div>
    </div>
    <div class="chart-container">
      <!-- 可以使用echarts实现处理效率的折线图或柱状图 -->
      <div ref="efficiencyChart" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import * as echarts from 'echarts';
import gsap from 'gsap';

// 创建GSAP数字动画组件
const GsapNumber = {
  props: {
    from: {
      type: Number,
      default: 0
    },
    to: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      tweened: {
        number: this.from
      }
    }
  },
  mounted() {
    gsap.to(this.tweened, {
      duration: this.duration,
      number: this.to,
      ease: 'power1.out'
    });
  },
  render() {
    return this.tweened.number.toFixed(1);
  }
}

// 数据值
const reachRate = ref(98.6);
const loadRate = ref(76.3);
const efficiencyRate = ref(5.2);

// 判断值是否异常的函数
const isErrorRate = (value) => value < 90;
const isErrorLoad = (value) => value > 90 || value < 50;
const isErrorEfficiency = (value) => value < 0;

const efficiencyChart = ref(null);

onMounted(() => {
  const chart = echarts.init(efficiencyChart.value);
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: '20',
      left: '10',
      right: '10',
      bottom: '0',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: {
        lineStyle: {
          color: '#0c82df'
        }
      },
      axisLabel: {
        color: '#83bff6'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#0c82df'
        }
      },
      axisLabel: {
        color: '#83bff6'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(12, 130, 223, 0.3)'
        }
      }
    },
    series: [
      {
        name: '处理效率',
        type: 'line',
        data: [92, 93, 95, 94, 96, 98],
        smooth: true,
        color: '#00fffc',
        lineStyle: {
          width: 3,
          color: '#00fffc'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: 'rgba(0, 255, 252, 0.8)'},
            {offset: 1, color: 'rgba(0, 255, 252, 0.1)'}
          ])
        }
      }
    ]
  };
  chart.setOption(option);

  window.addEventListener('resize', () => {
    chart.resize();
  });

  // 模拟数据变化，触发动画效果
  setInterval(() => {
    // 随机更新数据
    reachRate.value = Math.min(100, Math.max(85, reachRate.value + (Math.random() - 0.5) * 5));
    loadRate.value = Math.min(95, Math.max(45, loadRate.value + (Math.random() - 0.5) * 8));
    efficiencyRate.value = Math.min(10, Math.max(-3, efficiencyRate.value + (Math.random() - 0.5) * 3));

    // 重新初始化GSAP动画
    gsap.to(GsapNumber.data().tweened, {
      duration: GsapNumber.props.duration.default,
      number: reachRate.value,
      ease: 'power1.out'
    });
  }, 5000);
});
</script>

<style scoped>
.item5-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  color: #83bff6;
}

.chart-container {
  width: 100%;
  height: calc(100% - 30px);
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
}

.indicators {
  height: 30px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;
}

.indicator-item {
  text-align: center;
}

.label {
  font-size: 14px;
  color: #83bff6;
}

.value {
  font-size: 16px;
  color: #00fffc;
  margin-left: 5px;
  transition: color 0.3s ease;
}

.value-error {
  color: #ff4d4f;
  animation: flash 0.8s ease-in-out;
}

@keyframes flash {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
