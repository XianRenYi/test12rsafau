<script setup lang="ts">
import ItemWrap from "@/components/item-wrap";

import LeftTop from './components/left-top.vue';
import LeftCenter from "./components/left-center.vue";
import LeftBottom from "./components/left-bottom.vue";
import CenterMap from "./components/center-map.vue";
import CenterBottom from "./components/center-bottom.vue";
import RightTop from "./components/right-top.vue";
import RightCenter from "./components/right-center.vue";
import RightBottom from "./components/right-bottom.vue";

//import DeviceLog from '@/views/iot/deviceLog/index.vue'
import history from "../dataCenter/history.vue";

import { ref } from 'vue'

const dialogVisible = ref(false)

const showDeviceLog = () => {
  debugger
  dialogVisible.value = true
}
</script>

<template>
  <div>
    <el-dialog 
    title="查看历史数据" 
    v-model="dialogVisible" 
    :width="'2000px'"
    top="5vh"
   >  <!-- 添加全屏模式 -->
    <history v-if="dialogVisible" />
  </el-dialog>

  </div>



  <div class="index-box">
    <div class="contetn_left">
      <!-- <div class="pagetab">
        <div class="item">实时监测</div>
        <div class="item">统计分析</div>
      </div> -->
      <ItemWrap class="contetn_left-top contetn_lr-item" style="height:200px" title="在线统计">
        <LeftTop />
      </ItemWrap>
      <ItemWrap class="contetn_left-center contetn_lr-item" style="height:600px"  title="设备列表">
        <LeftCenter />
      </ItemWrap>
      <ItemWrap class="contetn_left-center contetn_lr-item" style="height:500px"  title="气象数据">
        <LeftBottom />
      </ItemWrap>
      <!-- <ItemWrap
        class="contetn_left-bottom contetn_lr-item"
        title="气象数据"
        style="padding: 0 10px 16px 10px"
      >
        <LeftBottom />
      </ItemWrap> -->
    </div>
    <div class="contetn_center">
      
      <!-- <CenterMap class="contetn_center_top" title="设备分布图" /> -->
      
      <ItemWrap  class="contetn_center_top"  style="height:800px;width: 1400px;" >
      <CenterMap class="contetn_center_top"/>
    </ItemWrap>

      <ItemWrap  class="contetn_center-bottom contetn_lr-item" style="margin-top: 20px;margin-bottom: 10px; height:500px;width: 1400px; "  title="实时趋势">
        <!-- <el-button style="float:right;margin-right: 30px;" @click="showDeviceLog">24小时</el-button>
        <el-button style="float:right;margin-right: 30px;" @click="showDeviceLog">12小时</el-button>
        <el-button style="float:right;margin-right: 30px;" @click="showDeviceLog">半小时</el-button>
        <el-button style="float:right;margin-right: 30px;" @click="showDeviceLog">查看历史记录</el-button> -->
        <el-button style="float:right;margin-right: 30px;float: right;
    margin-right: 30px;
    background-color: transparent;
    border: 1;
    color: white;
    padding: 24px;
    text-align: center;
    text-decoration: none;
    font-size: 24px;
    cursor: pointer;" @click="showDeviceLog">查看历史数据</el-button>
        <CenterBottom />
      </ItemWrap>
    </div>

    <!-- 右边 -->
    <div class="contetn_right">
      <ItemWrap class="contetn_left-bottom contetn_lr-item" style="height:200px"  title="报警统计">
        <RightTop />
      </ItemWrap>
      <ItemWrap class="contetn_left-bottom contetn_lr-item" style="height:300px" title="报警列表">
        <RightCenter />
      </ItemWrap>
      <ItemWrap class="contetn_left-bottom contetn_lr-item" style="height:800px"  title="实时数据 ">
        <RightBottom />
      </ItemWrap>
    </div>
  </div>
</template>

<style scoped lang="scss">
.index-box {
  width: 100%;
  display: flex;
  min-height: calc(100% - 64px);
  justify-content: space-between;
}
//左边 右边 结构一样
.contetn_left,
.contetn_right {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  position: relative;
  width: 540px;
  box-sizing: border-box;
  flex-shrink: 0;
}
.contetn_center {
  flex: 1;
  margin: 25px 25px 0px 25px;
  .contetn_center-bottom {
  
    height: 300px;
  }
}

.contetn_lr-item {
  height: 310px;
  font-size: 24px;
}

.contetn_center_top {
  width: 100%;
}

</style>
