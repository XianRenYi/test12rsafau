<template>
  <div class="itemBody">
    <div class="homeMainTop">
      <div class="item wow fadeInDown" :data-wow-delay="0.5*index+'s'" v-for="(item,index) in topList" :key="index">
        <div class="itemRight">
          <div class="itemRightName">
            <span class="showSpan">{{ item.name }}</span>
          </div>
          <div class="itemRightNum">
            <gsapNumDot  :number="item.value" :delay="0.5*index" :precision="item.precision" :comma="true"></gsapNumDot>
            <span v-if="item.unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gsapNumDot from "@/components/gsapNum/dot.vue";
import { statisticsDevices,alertLogCount } from '@/api/bigScreenIndex/bigScreen'

export default {
  name: "title",
  data() {
    return {
      topList: [
        {
          name: '设备总数',
          value: 100,
          unit: '',
          precision: 0
        },
        {
          name: '设备在线率',
          value: 96,
          unit: '%',
          precision: 0
        },
        {
          name: '在线设备',
          value: 96,
          unit: '',
          precision: 0
        },
        {
          name: '离线设备',
          value: 4,
          unit: '',
          precision: 0
        },
        {
          name: '本年度报警数量',
          value: 10,
          unit: '',
          precision: 0
        }
      ]
    }
  },
  components: { gsapNumDot },


  mounted() {
    this.getstatisticsDevices();
    this.getalertLogCount();
    
  setInterval(this.getstatisticsDevices, 20000);
  
  setInterval(this.getalertLogCount, 20000);
  },
  methods: {
    async getstatisticsDevices() {
        const res =await statisticsDevices();
        
        this.topList[0].value = res.data.totalDevices;
        this.topList[1].value = res.data.onlineRatePercentage;
        this.topList[2].value = res.data.onlineDevices;
        this.topList[3].value = res.data.offlineDevices;
    },
    async getalertLogCount() {
        const res =await alertLogCount();
        this.topList[4].value = res.data;
    },
  },

}
</script>

<style lang="scss" scoped>

 .showSpan{
  font-size: 18px;
  font-family: MicrosoftYaHei;
  font-weight: 700;
  color: #fff;
  margin-left: 10px;
  background: linear-gradient(180deg, #88ecfb, #66b6f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
 }

.itemBody {
  position: relative;
  width: calc(100% - 0px);
  height: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  flex-direction: column;
  align-content: flex-start;

  .homeMainTop {
    height: 80px;
    margin-top: 10px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    flex-direction: row;
    align-content: flex-start;

    .item {
      display: flex;
      width: calc(20% - 15px); // 5个项目，宽度调整为20%
      height: 100%;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      align-content: flex-start;
      position: relative;
      background: url(./assets/itembg2.png) no-repeat;
      background-color: #0f2e5a;
      background-size: 100% 100%;
      margin-bottom: 10px;

      .icon {
        position: relative;
        width: 48px;
        height: 48px;
        margin-left: 20px;
        margin-right: 20px;
        display: flex;
        justify-content: center;
        align-items: center;

        .iconbg {
          position: absolute;
          background: url(./assets/iconbg.png) no-repeat;
          width: 48px;
          height: 48px;
          background-size: 100% 100%;
          z-index: -1;
          animation: rotate 10s linear infinite;
        }

        i {
          font-size: 24px;
          background: linear-gradient(to bottom, #fff 0%, #79efff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .itemRight {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
        flex-direction: column;
        align-content: flex-start;
        width: calc(100% - 0px);

        .itemRightName {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: nowrap;
          flex-direction: row;
          align-content: flex-start;
          width: 100%;
     
        }

        .itemRightNum {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          flex-wrap: nowrap;
          flex-direction: row;
          align-content: flex-start;
          margin-top: 5px;
          margin-left: 10px;

          span {
            font-size: 17px;
            font-family: MicrosoftYaHei;
            font-weight: 700;
            color: #FFFFFF;
          }
        }

        :deep(.itemRightNum) {
          .gsapNum {
            font-size: 17px;
            font-family: MicrosoftYaHei;
            font-weight: 700;
            color: #FFFFFF;
            text-shadow: 0 0 0px #3778d5;
          }
        }
      }
    }
  }
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
