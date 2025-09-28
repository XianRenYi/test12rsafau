<script setup lang="ts">
import SeamlessScroll from "@/components/seamless-scroll";
import { onMounted, reactive, ref } from "vue";
import { useSettingStore } from "@/store/setting/setting";
import { storeToRefs } from "pinia";
import EmptyCom from "@/components/empty-com";
import { ElMessage } from "element-plus";
import { useDeviceMapStore } from "@/store/deviceMapStore";
import { useChartStore } from "@/store/chartStore"; // 引入 chartStore
import { getDeviceBigScreenIndexList } from "@/api/iot/device";

interface DeviceItem {
  provinceName: string;
  cityName: string;
  countyName: string;
  createTime: string;
  deviceId: string;
  gatewayno: number;
  onlineState: number;
  lat: number; // 新增字段
  lng: number; // 新增字段
}

interface ScrollOptions {
  singleHeight: number;
  step: number;
  limitScrollNum: number;
  hover: boolean;
  singleWaitTime: number;
  wheel: boolean;
}

const settingStore = useSettingStore();
const { defaultOption, indexConfig } = storeToRefs(settingStore);

const state = reactive({
  list: [] as DeviceItem[],
  defaultOption: {
    ...defaultOption.value,
    singleHeight: 80, // 增大行高适应大字体
    limitScrollNum: 6,
  } as ScrollOptions
});

const selectedDeviceId = ref<string | null>(null);
const deviceMapStore = useDeviceMapStore();
const chartStore = useChartStore(); // 使用 chartStore

const getData = async () => {



  try {
 
    getDeviceBigScreenIndexList().then((res) => {
    state.list = res.data;
    });

    // state.list = [
    //   {
    //     "provinceName": "福建省",
    //     "cityName": "北京市",
    //     "countyName": "雷州市",
    //     "createTime": "1982-12-06 11:00:29",
    //     "deviceId": "device_1",
    //     "gatewayno": 10000,
    //     "onlineState": 1,
    //     lat: 31.279101,
    //     lng: 120.526248
    //   },
    //   {
    //     "provinceName": "福建省",
    //     "cityName": "北京市",
    //     "countyName": "雷州市",
    //     "createTime": "1982-12-06 11:00:29",
    //     "deviceId": "device_2",
    //     "gatewayno": 10000,
    //     "onlineState": 1,
    //     lat: 31.279101,
    //     lng: 120.536248
    //   },
    //   {
    //     "provinceName": "福建省",
    //     "cityName": "北京市",
    //     "countyName": "雷州市",
    //     "createTime": "1982-12-06 11:00:29",
    //     "deviceId": "device_3",
    //     "gatewayno": 10000,
    //     "onlineState": 1,
    //     lat: 31.279101,
    //     lng: 120.546248
    //   }
    // ];
  } catch (error) {
    ElMessage.error("请求设备数据时发生错误");
  }
};

const handleRowClick = (item: DeviceItem) => {
  
  
  selectedDeviceId.value = selectedDeviceId.value === item.deviceId ? null : item.deviceId;

  if (selectedDeviceId.value) {
    
    deviceMapStore.setSelectedDevice({
      id: item.deviceId,
      lat: item.lat,
      lng: item.lng
    });

     // 设置当前选中设备 ID 到 chartStore
 // chartStore.setSelectedDeviceId(selectedDeviceId.value);
  } else {
    //chartStore.setSelectedDeviceId(null);
    deviceMapStore.setSelectedDevice(null);
  }
};

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="device-list-container">
    <!-- 表头 - 放大字体 -->
    <div class="list-header">
      <div class="header-item name">设备名称</div>
      <div class="header-item id">设备编号</div>
      <div class="header-item status">状态</div>
    </div>

    <!-- 列表内容 -->
    <component
      :is="indexConfig.leftBottomSwiper ? SeamlessScroll : EmptyCom"
      :list="state.list"
      :config="state.defaultOption"
    >
      <ul class="device-list">
        <li 
          class="list-item"
          v-for="item in state.list"
          :key="item.deviceId"
          :class="{ 'selected': selectedDeviceId === item.deviceId }"
          @click="handleRowClick(item)"
        >
          <span class="item-name">{{ item.deviceName }}</span>
          <span class="item-id">{{ item.serialNumber }}</span>
          <span 
            class="item-status"
            :class="item.status === 3 ? 'status-online' : 'status-offline'"
          >
            {{ item.status === 3 ? "在线" : "离线" }}
          </span>
        </li>
      </ul>
    </component>

   
  </div>
</template>

<style scoped lang="scss">
.device-list-container {
  --primary-color: #1582e8;
  --online-color: #52c41a;
  --offline-color: #ff4d4f;
  --border-color: rgba(18, 34, 97, 0.1);
  --bg-dark: rgba(0, 0, 0, 0.25);
  
  display: flex;
  flex-direction: column;
  background: var(--bg-dark);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  font-family: Arial, sans-serif;

  /* 表头样式 - 放大字体 */
  .list-header {
    display: grid;
    grid-template-columns: 50% 30% 20%;
    padding: 14px 20px; /* 增大内边距 */
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid var(--border-color);
    font-size: 20px; /* 原14px → 16px */
    color: rgba(255, 255, 255, 0.9);
    align-items: center;

    .header-item {
   
      font-weight: 500;
      
      &.name { text-align: left;    padding: 0 46px; /* 增大内边距 */}
      &.id { text-align: left;    padding: 0 28px; /* 增大内边距 */}
      &.status { text-align: center;    padding: 0 12px; /* 增大内边距 */}
    }
  }

  /* 列表项样式 - 放大字体 */
  .device-list {
    height: 450px;
    max-height: calc(100% - 52px); /* 固定最大高度 */
    overflow-y: auto; /* 添加垂直滚动条 */
  
    /* 滚动条样式（可选） */
    &::-webkit-scrollbar {
      width: 8px;
    }
  
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
    }
  
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }


    .list-item {
      display: grid;
      grid-template-columns: 50% 30% 20%;
      align-items: center;
      padding: 14px 20px; /* 增大内边距 */
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid var(--border-color);
      position: relative;

      &:hover {
        background: rgba(255, 255, 255, 0.03);
      }

      &.selected {
        background: #1582e8;;
        
        &::after {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 60%;
          width: 4px; /* 加粗选中指示条 */
          background: var(--primary-color);
          border-radius: 2px;
        }
      }

      > span {
        padding: 0 12px; /* 增大内边距 */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 20px; /* 原13px → 15px */
        
        &.item-name { text-align: left; }
        &.item-id { text-align: left; }
        &.item-status { 
          text-align: center;
          margin: 0 auto;
        }
      }

      .item-status {
        padding: 5px 10px; /* 增大内边距 */
        border-radius: 12px;
        font-size: 20px; /* 原12px → 14px */
        width: fit-content;
        min-width: 60px; /* 确保状态标签有足够空间 */

        &.status-online {
          background: rgba(82, 196, 26, 0.15);
          color: var(--online-color);
        }

        &.status-offline {
          background: rgba(255, 77, 79, 0.15);
          color: var(--offline-color);
        }
      }
    }
  }

  /* 选中提示 - 放大字体 */
  .selection-tip {
    position: absolute;
    bottom: 15px;
    right: 15px;
    padding: 8px 16px; /* 增大内边距 */
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    font-size: 19px; /* 原12px → 15px */
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
  }
}
</style>