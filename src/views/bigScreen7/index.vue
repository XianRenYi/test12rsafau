<template>


   
  <div class="home">
  
   
    <top  style="z-index: 2002;" class="wow fadeInDown" title="工业现场可视化监控平台"></top>
   
    <div  class="homeMain"  style="z-index: 2001;" >
      <HomeBackground  style="z-index: 999;"></HomeBackground>
      
      <div class="homeMainLeft"  style="z-index: 2000;">
        <div class="item1 wow fadeInLeft ">
          <!-- <item title="气体泄漏实时在线监控系统"> -->
          <item title="监控系统">
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
        <!-- <div class="homeMainCenterTop">
          <item4></item4>
        </div> -->
        <!-- 地图 -->
        <div class="homeMainCenterC" >
          <item9 
            @map-device-selected="onMapDeviceSelected"
            @voc-drag-start="onVocDragStart"
            @voc-drag-end="onVocDragEnd"
            @markers-loaded="onMarkersLoaded"
          ></item9>
        </div>
        <!-- 设备列表标题 -->
        <div class="device-list-header"  style="z-index: 2000;">
          <span class="device-list-title">设备列表</span>
        </div>
        <!-- 分割线 -->
        <!-- <div class="device-list-divider"></div> -->
        <div class="homeMainCenterBottom"  style="z-index: 2000;">
          
          <!--           <item type="big" class="wow fadeInUp" title="设备列表" data-wow-delay="0.5s">
            <item5 ref="item5Ref"></item5>
          </item> -->

          <item5 ref="item5Ref"></item5>
          <!-- <item type="big" class="wow fadeInUp" title="设备列表" data-wow-delay="0.5s">
          
          </item> -->

        </div>
      </div>
      <div class="homeMainRight"  style="z-index: 2000;">
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
          <item title="设备维护">
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
import HomeBackground from "./components/HomeBackground.vue";
import item1 from "./components/item1/index.vue";
import item4 from "./components/item4/index.vue";
import item5 from "./components/item5/index.vue";
import item9 from "./components/item9/index.vue";
import item12 from "./components/item12/index.vue";
import item13 from "./components/item13/index.vue";
import item14 from "./components/item14/index.vue";
import item15 from "./components/item15/index.vue";
import item16 from "./components/item16/index.vue";

// 获取item5组件的引用
const item5Ref = ref(null);

// 地图设备选中事件处理
const onMapDeviceSelected = (deviceData) => {
  console.log('bigScreen7接收到地图设备选中事件:', deviceData);
  console.log('item5Ref.value:', item5Ref.value);
  // 调用item5组件的方法来选中对应的列表行
  if (item5Ref.value && item5Ref.value.selectRowByDeviceData) {
    console.log('调用item5的selectRowByDeviceData方法');
    item5Ref.value.selectRowByDeviceData(deviceData);
  } else {
    console.log('item5Ref.value不存在或selectRowByDeviceData方法不存在');
  }
};

// 浮窗拖动开始事件处理
const onVocDragStart = () => {
  console.log('bigScreen7接收到浮窗拖动开始事件');
  // 通知item5组件暂停数据更新
  if (item5Ref.value && item5Ref.value.pauseDataUpdate) {
    item5Ref.value.pauseDataUpdate();
  }
};

// 浮窗拖动结束事件处理
const onVocDragEnd = () => {
  console.log('bigScreen7接收到浮窗拖动结束事件');
  // 通知item5组件恢复数据更新
  if (item5Ref.value && item5Ref.value.resumeDataUpdate) {
    item5Ref.value.resumeDataUpdate();
  }
};

// 标记点加载完成事件处理
const onMarkersLoaded = () => {
  console.log('bigScreen7接收到标记点加载完成事件');
  // 通知item5组件标记点已准备就绪，可以执行初始选择
  if (item5Ref.value && item5Ref.value.onMarkersReady) {
    item5Ref.value.onMarkersReady();
  }
};

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
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: nowrap;
  flex-direction: column;
}

.homeMain {
  position: absolute; /* 从 relative 改为 absolute */
  top: 90px; /* 假设 top 组件的高度约为 90px，使其在 top 组件下方 */
  left: 20px;
  right: 20px;
  bottom: 20px; /* 根据原有的 height 和 margin-top 计算得出 */
  z-index: 1000; /* 确保在地图上方 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  /* 移除以下冲突属性 */
  /* width: calc(100% - 40px); */
  /* height: calc(100% - 110px); */
  /* margin-top: 90px; */
  /* margin-left: 20px; */
  /* margin-right: 20px; */
}

.homeMainLeft {
  width: calc(25% - 20px);
  position: relative;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: column;
  align-content: flex-start;
  margin-right: 20px;
  bottom: 3vh;
  .item1 {
    position: relative;
    width: 100%;
    height: calc(33% - 10px);
  }
}

.homeMainCenter {
  width: calc(51% - 49px);
  
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
    
    top:-20px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    align-content: flex-start;
    width: 130%;
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
    height: calc(40% - 10px); // 增加高度占比
    position: relative;
   
  }
  
  /* 设备列表标题样式 */
  .device-list-header {
    width: calc(100% - 20px);
    height: 35px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
 
    padding-top:  calc(2.66%);;
    margin-bottom: 36px;
    margin-right: 51px;
    .device-list-title {
      font-size: 18px;
      font-family: MicrosoftYaHei;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(180deg, #88ecfb, #66b6f1);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  
  /* 分割线样式 */
  .device-list-divider {
    width: calc(100% - 20px);
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #054992 10%, #88ecfb 50%, #054992 90%, transparent 100%);
    margin: 0 10px 20px 10px;
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
  bottom: 3vh;

  .item1 {
    position: relative;
    width: 100%;
    height: calc(33% - 10px);
  }
}





</style>
