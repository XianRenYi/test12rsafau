<template>
  <div class="home">
    <!-- <bgAnimate></bgAnimate> -->
    <top class="wow fadeInDown" title="申贝物联网可视化平台"></top>
    <div class="homeMain">
      <div class="homeMainLeft">
        <div class="item1 wow fadeInLeft">
          <item title="气体泄漏实时在线监控系统">
            <item16></item16>
          </item>
        </div>
        <div class="item1 wow fadeInLeft" data-wow-delay="0.5s">
          <item title="数据分析">
            <item15></item15>
          </item>
        </div>
        <div class="item1 wow fadeInLeft" data-wow-delay="1s">
          <item title="实时趋势">
            <!-- <item2></item2> -->
            <item14></item14>
          </item>
        </div>
      </div>
      <div class="homeMainCenter">
        <div class="homeMainCenterTop">
          <item4></item4>
        </div>
        <!-- 地图 -->
        <div class="homeMainCenterC">
          <item9></item9>
        </div>
        <div class="homeMainCenterBottom">
          <item type="big" class="wow fadeInUp" title="设备列表" data-wow-delay="0.5s">
            <item5></item5>
          </item>
        </div>
      </div>
      <div class="homeMainRight">
        <div class="item1 wow fadeInRight">
          <item title="报警监测">
            <item12></item12>
          </item>
        </div>
        <div class="item1 wow fadeInRight" data-wow-delay="0.5s">
          <item title="报警分析">
            <item13></item13>
          </item>
        </div>
        <div class="item1 wow fadeInRight" data-wow-delay="1s">
          <item title="设备校准">
            <item1></item1>
          </item>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { gsap } from "gsap";

import top from "./components/top/index.vue";
import item from "./components/item/index.vue";
import item1 from "./components/item1/index.vue";
import item4 from "./components/item4/index.vue";
import item5 from "./components/item5/index.vue";
import item9 from "./components/item9/index.vue";
import item12 from "./components/item12/index.vue";
import item13 from "./components/item13/index.vue";
import item14 from "./components/item14/index.vue";
import item15 from "./components/item15/index.vue";
import item16 from "./components/item16/index.vue";

// 生命周期钩子
onMounted(() => {

  // GSAP 动画：homeMainCenterC 从缩放0到1
  gsap.fromTo(
    ".homeMainCenterC",
    { scale: 0 },
    { scale: 1, duration: 1, ease: "power1.out" }
  );
});
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  position: fixed;
  height: 100%;
  background: url("../../assets/bg.png") no-repeat;
  background-size: 100% 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: nowrap;
  flex-direction: column;
}

.homeMain {
  position: relative;
  width: calc(100% - 40px);
  height: calc(100% - 110px);
  margin-top: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  margin-left: 20px;
  margin-right: 20px;

  .homeMainLeft {
    width: calc(26% - 20px);
    position: relative;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: column;
    align-content: flex-start;
    margin-right: 20px;

    .item1 {
      position: relative;
      width: 100%;
      height: calc(33% - 10px);
    }
  }

  .homeMainCenter {
    width: calc(54% - 40px);
    position: relative;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: column;
    align-content: flex-start;

    .homeMainCenterTop {
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      align-content: flex-start;
      width: 100%;
      height: 100px;
    }
    .homeMainCenterC {
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      align-content: flex-start;
      width: 100%;
      height: calc(66.66% - 110px);
      position: relative;
    }
    .homeMainCenterBottom {
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      align-content: flex-start;
      width: 100%;
      height: calc(33.33% - 10px);
      position: relative;
    }
  }

  .homeMainRight {
    width: calc(25% - 15px);
    position: relative;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: column;
    align-content: flex-start;
    margin-left: 15px;
    z-index: 11;

    .item1 {
      position: relative;
      width: 100%;
      height: calc(33% - 10px);
    }
  }
}
</style>
