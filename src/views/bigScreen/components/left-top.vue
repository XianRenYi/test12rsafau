<script setup lang="ts">
import { ref, reactive } from "vue";
import { Decoration9 } from '@kjgl77/datav-vue3'
import { graphic } from "echarts/core";
import { getDeviceStatistic } from "@/api/iot/device";
import { get } from "http";


const deviceStatistic = reactive<any>({
    deviceCount: 100,
    productCount: 100,
    eventCount: 100,
    alertCount: 100,
    deviceOnlineCount: 100,
});

const getData = () => { 
    getDeviceStatistic().then((res) => {
    deviceStatistic.deviceCount = res.data.deviceCount;
    deviceStatistic.productCount = res.data.productCount;
    deviceStatistic.eventCount = res.data.eventCount;
    deviceStatistic.alertCount = res.data.alertCount;
    deviceStatistic.deviceOnlineCount = res.data.deviceOnlineCount;
});

};

getData();

</script>

<template>
  <div style="display:flex;margin-top:1px;margin-left: 35px;">
    <div style="margin-left:10px;color:#32c5e9;">
        <Decoration9 style="width:90px;height:90px;font-weight:600;" :dur="10" :color="['#32c5e9', '#238aa4']">{{deviceStatistic.deviceCount}}</Decoration9>
        <div style="text-align: center;margin-top:25px;">设备总数</div>
    </div>
    <div style="margin:0 30px;color:#9fe6b8">
        <Decoration9 style="width:90px;height:90px;font-weight:600;" :dur="10" :color="['#9fe6b8', '#70a181']">{{deviceStatistic.deviceOnlineCount}}</Decoration9>
        <div style="text-align: center;margin-top:25px;font-weight:400;">在线设备</div>
    </div>
    <div style="margin-right:30px;color:#ffdb5c">
        <Decoration9 style="width:90px;height:90px;font-weight:600;" :dur="10" :color="['#ffdb5c', '#b39a41']">{{deviceStatistic.deviceCount-deviceStatistic.deviceOnlineCount}}</Decoration9>
        <div style="text-align: center;margin-top:25px;font-weight:400;">离线设备</div>
    </div>
    <div style="color:#fb7293;">
        <Decoration9 style="width:90px;height:90px;font-weight:600;" :dur="10" :color="['#fb7293', '#ad4f65']">{{deviceStatistic.alertCount}}</Decoration9>
        <div style="text-align: center;margin-top:25px;font-weight:400;">告警数量</div>
    </div>
</div>
</template>

<style scoped lang="scss"></style>