<template>
  <!-- <pop title="报警历史">
    <history></history>
  </pop> -->
  <div class="itemOutBody">
    <div class="itemOutBodyInner" v-for="(item, index) in list" :key="index">
      <!-- <item :item="item" :status="item.status" :power="item.power"></item> -->

      <div class="container" :class="item.class">
        <div class="line1"></div>
        <div class="line2"></div>
        <div class="line3"></div>
        <div class="line4"></div>
        <div class="containerNum">
          <div class="nums">
            <span class="unit"> {{ item.power }}</span>
            <span class="unit"></span>
            <!-- 增加单位 -->
          </div>
          <img :src="item.icon" alt="" />
          <span class="title">{{ item.title }}</span>
          <!-- 显示名称 -->
          <span class="status" :style="{ color: statusColor }">{{ status }}</span>
          <!-- 显示状态 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSelectedDataStore } from "@/store/selectedDataStore"; // 路径根据实际调整
import icon1 from "./assets/icon4.png";
import icon2 from "./assets/icon2.png";
import icon3 from "./assets/icon3.png";
import pop from "@/components/pop/index.vue";
import history from "./history/index.vue";
import gsapNum from "@/components/gsapNum/index.vue";
import { selectStatisticsAllCount } from "@/api/bigScreenIndex/bigScreen";
export default {
  name: "tableCom",
  components: {
    pop,
    history,
  },
  data() {
    return {
      list: [
        {
          title: "一级预警",
          status: "", // 初始状态
          power: 0, // 初始功率
          icon: icon1,
          class: "container1",
          color: "rgba(248 4 87, 1)",
        },
        {
          title: "二级预警",
          status: "", // 初始状态
          power: 0, // 初始功率
          icon: icon2,
          class: "container2",
          color: "rgba(254, 229, 0, 1)",
        },
        {
          title: "三级预警",
          status: "", // 初始状态
          power: 0, // 初始功率
          icon: icon3,
          class: "container3",
          color: "rgba(2, 255, 134, 1)",
        },
      ],
    };
  },
  mounted() {
    this.generateData();
    setInterval(this.generateData, 1000);
  },
  methods: {
    async generateData() {
      await selectStatisticsAllCount().then((response) => {
        const sss = this.list;
        sss[0].power = response.data.one || 0;
        sss[1].power = response.data.two || 0;
        sss[2].power = response.data.three  || 0;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.itemOutBody {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: row;
  align-content: flex-start;
  position: relative;
  height: calc(100% - 0px);
  width: calc(100% - 0px);

  .itemOutBodyInner {
    width: calc(30% - 10px); // 调整为3个设备，宽度适当增大
    position: relative;
    height: calc(100% - 20px);
    display: flex;
    margin-top: 10px;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    align-content: flex-start;
  }
}

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

.container {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(
    180deg,
    rgba(54, 255, 243, 0) 0%,
    rgba(233, 12, 38, 0.8) 100%
  );
  border-top: 1px solid rgba(233, 12, 38, 0.5);
  border-bottom: 1px solid rgba(233, 12, 38, 0.5);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: column;
  align-content: flex-start;

  :deep(.nums) {
    display: flex;
    align-items: flex-end; // 对齐功率数值和单位
    margin-bottom: 10px;

    .gsapNum {
      font-size: 17px;
      font-family: MicrosoftYaHei;
    }

    .unit {
      font-size: 17px;
      font-family: MicrosoftYaHei;

      color: #ffffff;
      margin-left: 5px; // 单位与数值之间的间距
    }
  }

  .line1 {
    width: 15px;
    height: 2px;
    background: rgba(233, 12, 38, 1);
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
    position: absolute;
    top: -2px;
    left: 0;
  }

  .line3 {
    width: 15px;
    height: 2px;
    background: rgba(233, 12, 38, 1);
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
    position: absolute;
    bottom: -2px;
    left: 0;
  }

  .line4 {
    width: 15px;
    height: 2px;
    background: rgba(233, 12, 38, 1);
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
    position: absolute;
    bottom: -2px;
    right: 0;
  }

  .line2 {
    width: 15px;
    height: 2px;
    background: rgba(233, 12, 38, 1);
    border-radius: 0px 0px 0px 0px;
    opacity: 1;
    right: 0;
    position: absolute;
    top: -2px;
  }

  .containerNum {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: column;
    align-content: flex-start;

    .nums {
      position: absolute;
      margin-top: -50px;
    }

    img {
      margin-top: 10px;
    }

    .title {
      font-size: 17px;
      font-family: MicrosoftYaHei;

      color: #ffffff;
      margin-top: 10px;
    }

    .status {
      font-size: 17px;
      font-family: MicrosoftYaHei;

      font-weight: bold;
      margin-top: 5px;
    }
  }
}

.container2 {
  background: linear-gradient(
    180deg,
    rgba(54, 255, 243, 0) 0%,
    rgba(254, 229, 0, 0.3) 100%
  );
  border-top: 1px solid rgba(254, 229, 0, 0.5);
  border-bottom: 1px solid rgba(254, 229, 0, 0.5);

  :deep(.nums) {
    .real-time-num .real-time-num-item > div {
      background: linear-gradient(360deg, #fe9800 0%, #fee500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  :deep(.progresss) {
    .el-progress-bar__outer {
      background: rgba(254, 229, 0, 0.2);
    }
  }

  .line1 {
    background: rgba(254, 229, 0, 1);
  }

  .line3 {
    background: rgba(254, 229, 0, 1);
  }

  .line4 {
    background: rgba(254, 229, 0, 1);
  }

  .line2 {
    background: rgba(254, 229, 0, 1);
  }
}

.container3 {
  background: linear-gradient(
    180deg,
    rgba(54, 255, 243, 0) 0%,
    rgba(2, 255, 134, 0.3) 100%
  );
  border-top: 1px solid rgba(2, 255, 134, 0.5);
  border-bottom: 1px solid rgba(2, 255, 134, 0.5);

  :deep(.nums) {
    .real-time-num .real-time-num-item > div {
      background: linear-gradient(360deg, #00c14d 0%, #02ff86 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  :deep(.progresss) {
    .el-progress-bar__outer {
      background: rgba(2, 255, 134, 0.2);
    }
  }

  .line1 {
    background: rgba(2, 255, 134, 0.87);
  }

  .line3 {
    background: rgba(2, 255, 134, 0.87);
  }

  .line4 {
    background: rgba(2, 255, 134, 0.87);
  }

  .line2 {
    background: rgba(2, 255, 134, 0.87);
  }
}
</style>
