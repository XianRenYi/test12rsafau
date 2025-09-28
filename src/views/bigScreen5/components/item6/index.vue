<template>
  <div class="listCom">
    <vue-seamless-scroll
        class="scrollBody"
        :data="warningList"
        direction="top"
        :steep="0.3"
        roller
        :distance="20"
    >
      <div
          class="listItem"
          v-for="(item, index) in warningList"
          :key="index"
          :class="getWarningClass(item.level)"
      >
        <div class="line" :style="getLineStyle(item.level)"></div>
        <div class="rankNum" :style="getNumStyle(item.level)">
          {{ getWarningIcon(item.level) }}
        </div>
        <div class="content">
          <span class="unit">{{ item.location }}</span>
          <span class="desc">{{ item.type }}</span>
          <span class="time">{{ item.time }}</span>
        </div>
        <div class="status" :style="getStatusStyle(item.level)">
          {{ getWarningText(item.level) }}
        </div>
      </div>
    </vue-seamless-scroll>
  </div>
</template>

<script>
export default {
  name: "WarningList",
  data() {
    return {
      warningColors: {
        high: '#ff4d4f',
        medium: '#faad14',
        low: '#1890ff',
        normal: '#52c41a'
      },
      warningList: [
        {level: 'high', location: '1号沉淀池', type: '溶解氧低', time: '10:15'},
        {level: 'medium', location: '进水口', type: 'COD超标', time: '09:45'},
        {level: 'low', location: '2号水泵', type: '振动异常', time: '09:30'},
        {level: 'normal', location: '出水口', type: '水质正常', time: '09:20'},
        {level: 'medium', location: '加药系统', type: '药剂不足', time: '08:55'},
        {level: 'high', location: '曝气系统', type: '压力异常', time: '08:30'},
        {level: 'low', location: '3号水泵', type: '温度偏高', time: '08:15'},
        {level: 'normal', location: '污泥池', type: '运行正常', time: '08:00'},
        {level: 'medium', location: '消毒系统', type: '余氯偏低', time: '07:45'},
        {level: 'high', location: '配电室', type: '电压波动', time: '07:30'}
      ]
    };
  },
  methods: {
    getWarningClass(level) {
      switch(level) {
        case 'high': return 'gradient-bg-high';
        case 'medium': return 'gradient-bg-medium';
        case 'low': return 'gradient-bg-low';
        case 'normal': return 'gradient-bg-normal';
        default: return '';
      }
    },
    getNumStyle(level) {
      return {
        color: this.warningColors[level]
      }
    },
    getLineStyle(level) {
      return {
        backgroundColor: this.warningColors[level]
      }
    },
    getStatusStyle(level) {
      return {
        color: this.warningColors[level],
        borderColor: this.warningColors[level]
      }
    },
    getWarningIcon(level) {
      switch(level) {
        case 'high': return '!';
        case 'medium': return '⚠';
        case 'low': return '⚠';
        case 'normal': return '✓';
        default: return '';
      }
    },
    getWarningText(level) {
      switch(level) {
        case 'high': return '紧急';
        case 'medium': return '警告';
        case 'low': return '注意';
        case 'normal': return '正常';
        default: return '';
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.listCom {
  width: 100%;
  height: 100%;
  overflow: hidden;

  .scrollBody {
    height: 100%;

    .listItem {
      height: 40px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      box-sizing: border-box;
      margin-bottom: 5px;
      position: relative;
      width: calc(100% - 20px);
      margin-left: 10px;

      &.gradient-bg-high {
        background: linear-gradient(to right, rgba(255, 77, 79, 0.15), rgba(255, 77, 79, 0));
      }

      &.gradient-bg-medium {
        background: linear-gradient(to right, rgba(250, 173, 20, 0.15), rgba(250, 173, 20, 0));
      }

      &.gradient-bg-low {
        background: linear-gradient(to right, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0));
      }

      &.gradient-bg-normal {
        background: linear-gradient(to right, rgba(82, 196, 26, 0.15), rgba(82, 196, 26, 0));
      }

      .line {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 33px;
      }

      .rankNum {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        position: relative;
        z-index: 1;
        margin-left: 10px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.2);
      }

      .content {
        flex: 1;
        display: flex;
        align-items: center;
        margin-left: 15px;
        position: relative;
        z-index: 1;

        .unit {
          font-family: MicrosoftYaHei;
          font-weight: 400;
          font-size: 14px;
          color: #FFFFFF;
          margin-right: 10px;
          width: 80px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .desc {
          font-family: MicrosoftYaHei;
          font-weight: 400;
          font-size: 14px;
          color: #83bff6;
          margin-right: 10px;
          width: 80px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .time {
          font-family: MicrosoftYaHei;
          font-weight: 400;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }
      }

      .status {
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: bold;
        border: 1px solid;
        background-color: rgba(0, 0, 0, 0.2);
      }
    }
  }
}

// 为高级别警告添加闪烁动画
@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.gradient-bg-high {
  animation: blink 1.5s infinite;
}
</style>
