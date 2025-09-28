<script setup lang="ts">
import { ref, reactive } from "vue";
import { BorderBox12  } from '@kjgl77/datav-vue3'
import { graphic } from "echarts/core";

//import DeviceLog from '@/views/iot/deviceLog/index.vue'
import AlertLog from '@/views/iot/alert/log.vue'
import AlertLogToday from '@/views/iot/alert/logToday.vue'

import { 
  selectAlertLogListCount, 
  selectAlertLogListTodayCount 
  } from '@/api/iot/alertLog';

  const alertLogRefToday = ref(null);
  const alertLogRefAll = ref(null);


const deviceStatistic = reactive<any>({
  AlertLogListCount: 0,
  AlertLogListTodayCount: 0,
           
});
const dialogVisible_today = ref(false)
const dialogVisible_all = ref(false)

const showDeviceLog = (type:any) => {
  debugger
  if (type == '1') {
      dialogVisible_today.value = true;
  }

  if (type == '2') {
      dialogVisible_all.value = true;
  }

}
const getData = () => { 

    selectAlertLogListCount().then((res:any) => {
   
      if(res.code == 200){
        deviceStatistic.AlertLogListCount = res.data;
      }
    })

    selectAlertLogListTodayCount().then((res:any) => {
      deviceStatistic.AlertLogListTodayCount = res.data;
  })
}


getData();


  // 每秒继续添加新点
  setInterval(getData, 10000)
</script>

<template>

  <div>
    <el-dialog 
      title="今天告警" 
      v-model="dialogVisible_today" 
      style="width: 2000px;"
      top="5vh">
      <alert-log-today ref="alertLogRefToday" v-if="dialogVisible_today" />
    </el-dialog>
  </div>
  <div>
    <el-dialog 
      title="告警总数" 
      v-model="dialogVisible_all" 
       style="width: 2000px;"
      top="5vh">
      <alert-log ref="alertLogRefAll" v-if="dialogVisible_all" />
    </el-dialog>
  </div>


  <div  style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;">
   
    <div style="margin-left: 10px; color: #32c5e9;"  @click="showDeviceLog('1')" >
      <BorderBox12 style="width: 90px; height: 90px; font-weight: 1000; display: flex; justify-content: center; align-items: center;" :dur="10" :color="['#32c5e9', '#238aa4']">
        <div style="font-size: 40px; margin: 16px auto;text-align: center;">{{ deviceStatistic.AlertLogListTodayCount }}</div>
      </BorderBox12>
      <div style="text-align: center; margin-top: 25px;">今日告警</div>
    </div>
   

    <div style="margin-left: 50px; color: #fb7293;" @click="showDeviceLog('2')" >
      <BorderBox12 style="width: 90px; height: 90px; font-weight: 1000; display: flex; justify-content: center; align-items: center;" :dur="10" :color="['#fb7293', '#ad4f65']">
        <div style="font-size: 40px; margin: 16px auto;text-align: center;">{{ deviceStatistic.AlertLogListCount }}</div>
      </BorderBox12>
      <div style="text-align: center; margin-top: 25px;">告警总数</div>
    </div>

    
  </div>
</template>

<style scoped lang="scss"></style>