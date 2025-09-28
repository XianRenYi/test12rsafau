<template>
  <div class="tableCom">
    <div class="tableHead">
      <!-- <div
          class="tableHeadItem"
          v-for="(item, index) in head"
          :key="index"
          :style="{ width: item.flex }"
        >
          <div class="title">{{ item.title }}</div>
        </div> -->
      <div class="tableHeadRow">
        <div class="tableHeadItem" 
             v-for="(item, index) in head" 
             :key="index"
             :style="{ width: item.flex }">
          <div class="title">{{ item.title }}</div>
        </div>
      </div>
    </div>
    <div class="tableBody">
      <div
        class="tableBody2"
        v-for="(item, index) in list"
        :key="index"
        @click="selectRow(index)"
        @dblclick="toggleVocWindow(index)"
        :class="{ selected: selectedRowIndex === index }"
      >
        <div class="tableBody2s">
          <div class="tableBody2Item" :style="{ width: head[0].flex }">
            <span>{{ item.deviceName }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[1].flex }">
            <span>{{ item.networkAddress }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[2].flex }">
            <span class="num">{{ item.statusName }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[3].flex }">
            <span class="num">{{ item.modelName }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[4].flex }">
            <span class="num">{{ item.valueLatest }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[5].flex }">
            <span class="num">{{ item.valueAvg }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[6].flex }">
            <span class="num">{{ item.valueMax }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[7].flex }">
            <span class="num">{{ item.valueMin }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[8].flex }">
            <span class="num">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSelectedDataStore } from "@/store/selectedDataStore"; // 路径根据实际调整

import { shebeiliebao } from "@/api/bigScreenIndex/bigScreen";
export default {
  name: "tableCom",
  data() {
    return {
      head: [
        { title: "名称", flex: "200px" },
        { title: "地址", flex: "200px" },
        { title: "状态", flex: "70px" },
        { title: "因子", flex: "70px" },
        { title: "数值", flex: "85px" },
        { title: "均值", flex: "85px" },
        { title: "最大值", flex: "85px" },
        { title: "最小值", flex: "85px" },
        { title: "单位", flex: "70px" },
      ],
      list: [],
      selectedRowIndex: null,
      vocWindowVisible: false,
      vocWindowDeviceIndex: null,
      // 定时器相关
      dataUpdateTimer: null,
      isDragPaused: false,
      // 标记点准备状态
      markersReady: false,
      pendingInitialSelection: false,
    };
  },
  mounted() {
    this.generateData();
    this.startDataUpdateTimer();
  },
  beforeUnmount() {
    this.stopDataUpdateTimer();
  },
  methods: {
    // 启动数据更新定时器
    startDataUpdateTimer() {
      if (this.dataUpdateTimer) {
        clearInterval(this.dataUpdateTimer);
      }
      this.dataUpdateTimer = setInterval(() => {
        if (!this.isDragPaused) {
          this.generateData();
        }
      }, 1000);
    },
    
    // 停止数据更新定时器
    stopDataUpdateTimer() {
      if (this.dataUpdateTimer) {
        clearInterval(this.dataUpdateTimer);
        this.dataUpdateTimer = null;
      }
    },
    
    // 暂停数据更新（拖动时）
    pauseDataUpdate() {
      this.isDragPaused = true;
      console.log('数据更新已暂停');
    },
    
    // 恢复数据更新（拖动结束后）
    resumeDataUpdate() {
      this.isDragPaused = false;
      console.log('数据更新已恢复');
    },
    
    async generateData() {
      // const res =await shebeiliebao();
      // this.list = res.data;
      // if(this.selectedRowIndex == null){
      //   this.selectRow(0);
      // }

      await shebeiliebao().then((response) => {
        this.list = response.data;
        
        this.list.forEach(item => {
          item.thingsModelValueData = JSON.parse(item.thingsModelValue);
     
          if(item.thingsModelValueData){
          item.unit = item.thingsModelValueData.unit

          }
        });
        
        // 如果浮窗正在显示，更新浮窗数据
        this.updateVocWindowData();
        
        // 处理初始选择
        if (this.selectedRowIndex == null) {
          if (this.markersReady) {
            // 标记点已准备就绪，直接执行初始选择
            console.log('标记点已准备就绪，执行初始选择');
            this.selectRowFirst(0);
          } else {
            // 标记点尚未准备就绪，标记为待处理
            console.log('标记点尚未准备就绪，标记为待处理');
            this.pendingInitialSelection = true;
          }
        }
      });
    },
    selectRowFirst(index) {
      this.selectedRowIndex = index;
      const selectedData = this.list[index];
      this.$emit("row-selected", selectedData);
      // 使用 Pinia 设置数据
      const selectedDataStore = useSelectedDataStore();
      selectedDataStore.setSelectedData(selectedData);
      
      // 提取经纬度并更新地图中心点
      if (selectedData.latitude && selectedData.longitude) {
        selectedDataStore.setCenterPoint({
          latitude: selectedData.latitude,
          longitude: selectedData.longitude,
        });
      }
      
    },
    
    selectRow(index) {
      this.selectedRowIndex = index;
      debugger
      const selectedData = this.list[index];
      this.$emit("row-selected", selectedData);
      // 使用 Pinia 设置数据
      const selectedDataStore = useSelectedDataStore();
      selectedDataStore.setSelectedData(selectedData);
      
      // 提取经纬度并更新地图中心点
      if (selectedData.latitude && selectedData.longitude) {
        selectedDataStore.setCenterPoint({
          latitude: selectedData.latitude,
          longitude: selectedData.longitude,
        });
      }
      
      // 单击控制浮窗显示/隐藏
      this.toggleVocWindow(index);
    },
    
    toggleVocWindow(index) {
      console.log('点击设备行:', index, this.list[index]);
      
      if (this.vocWindowVisible && this.vocWindowDeviceIndex === index) {
        // 如果浮窗正在显示且点击的是当前显示的浮窗，则隐藏
        this.vocWindowVisible = false;
        this.vocWindowDeviceIndex = null;
        console.log('隐藏浮窗');
      } else {
        // 如果点击的是新行或浮窗未显示，则显示浮窗
        this.vocWindowVisible = true;
        this.vocWindowDeviceIndex = index;
        console.log('显示浮窗，设备数据:', this.list[index]);
      }
      
      // 更新store中的浮窗状态
      const selectedDataStore = useSelectedDataStore();
      selectedDataStore.setVocWindowState({
        visible: this.vocWindowVisible,
        deviceIndex: this.vocWindowDeviceIndex,
        deviceData: this.vocWindowVisible ? this.list[index] : null
      });
      
      console.log('Store状态已更新:', this.vocWindowVisible, this.vocWindowDeviceIndex);
    },
    
    // 更新浮窗数据
    updateVocWindowData() {
      if (this.vocWindowVisible && this.vocWindowDeviceIndex !== null) {
        const selectedDataStore = useSelectedDataStore();
        // 更新浮窗状态中的设备数据
        selectedDataStore.setVocWindowState({
          visible: this.vocWindowVisible,
          deviceIndex: this.vocWindowDeviceIndex,
          deviceData: this.list[this.vocWindowDeviceIndex]
        });
      }
    },

    // 根据设备数据找到对应的列表行索引
    findMatchingRowIndex(deviceData) {
      if (!deviceData || !this.list.length) {
        return -1;
      }

   
      // 尝试通过序列号匹配
      if (deviceData.serialNumber) {
        const indexBySerial = this.list.findIndex(item => item.serialNumber === deviceData.serialNumber);
        if (indexBySerial !== -1) {
          console.log('通过序列号匹配成功:', indexBySerial);
          return indexBySerial;
        }
      }


    

      console.log('未找到匹配的列表行:', deviceData);
      return -1;
    },

    // 根据设备数据选中对应的列表行（供外部调用）
    selectRowByDeviceData(deviceData) {
      console.log('item5接收到选中请求:', deviceData);
      console.log('当前列表数据:', this.list);
      if (!deviceData || !this.list.length) {
        console.log('数据无效或列表为空');
        return;
      }

      // 根据设备数据找到对应的列表行索引
      const matchingIndex = this.findMatchingRowIndex(deviceData);
      if (matchingIndex !== -1) {
       // this.selectedRowIndex = matchingIndex;
       debugger
        this.selectRow(matchingIndex)
        console.log('成功选中列表行:', matchingIndex, deviceData);
      } else {
        console.log('未找到匹配的列表行:', deviceData);
      }
    },

    // 标记点准备就绪回调（供外部调用）
    onMarkersReady() {
      console.log('item5接收到标记点准备就绪通知');
      this.markersReady = true;
      
      // 如果有待处理的初始选择，现在执行
      if (this.pendingInitialSelection && this.selectedRowIndex == null) {
        console.log('执行待处理的初始选择');
        this.selectRowFirst(0);
        this.pendingInitialSelection = false;
      }
    },

  },
};
</script>

<style lang="scss" scoped>
.tableCom {
  width: calc(100% + 31px);
  margin: 0 -15.5px;
  position: relative;
  height: 100%;
  overflow: hidden;
  background: rgba(0, 20, 40, 0.3);
  backdrop-filter: blur(5px);

  .tableHead {
    width: 100%;
    height: 45px;
    background: linear-gradient(135deg, rgba(16, 50, 100, 0.8), rgba(40, 90, 150, 0.6));
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    border-bottom: 2px solid rgba(136, 236, 251, 0.5);
    position: relative;
    z-index: 1;

    .tableHeadRow {
      display: flex;
      height: 45px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      position: relative;
      width: 100%;
      padding: 0 10px;
    }

    .tableHeadItem {
      font-size: 16px;
      font-family: MicrosoftYaHei;
      font-weight: 600;
      color: #fff;
      margin-left: 8px;
      background: linear-gradient(180deg, #88ecfb, #66b6f1);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);

      .title {
        width: calc(100% - 16px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
        letter-spacing: 0.5px;
      }
    }
  }

  .tableBody {
    position: relative;
    height: calc(100% - 45px);
    overflow-y: auto;
    padding: 5px 0;
    
    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: linear-gradient(45deg, #66b6f1, #88ecfb);
      border-radius: 3px;
      
      &:hover {
        background: linear-gradient(45deg, #88ecfb, #66b6f1);
      }
    }
    
    // Firefox 滚动条样式
    scrollbar-width: thin;
    scrollbar-color: #66b6f1 rgba(0, 0, 0, 0.1);
    .tableBody2 {
      height: 42px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      position: relative;
      width: 100%;
      cursor: pointer;
      z-index: 1;
      margin: 1px 0;
      transition: all 0.3s ease;

      &.selected {
        background: linear-gradient(90deg, #0a4c7a, #1e6bb8);
        z-index: 10;
        
        .tableBody2Item {
          span, .num {
            color: #fff;
            background: linear-gradient(180deg, #88ecfb, #66b6f1);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
      }

      .tableBody2s {
        display: flex;
        height: 42px;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
        flex-direction: row;
        position: relative;
        width: calc(100% - 16px);
        padding: 0 8px;
      }

      .icon_left,
      .icon_right {
        position: absolute;
        background-size: cover;
        z-index: 0;
      }

      .icon_left {
        width: 7px;
        height: 8px;
        left: 5px;
      }

      .icon_right {
        width: 7px;
        height: 8px;
        right: 5px;
      }

      .tableBody2Item {
        font-size: 15px;
        font-family: MicrosoftYaHei;
        color: #fff;
        margin-left: 8px;
        background: linear-gradient(180deg, #fff, #e6f7ff);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: flex;
        align-items: center;
        justify-content: center;

        span {
          width: calc(100% - 16px);
          overflow: visible;
          white-space: normal;
          text-overflow: unset;
          text-align: center;
          padding: 0 4px;
          letter-spacing: 0.3px;
          word-wrap: break-word;
          word-break: break-all;
        }

        .num {
          width: calc(100% - 16px);
          overflow: visible;
          white-space: normal;
          text-overflow: unset;
          text-align: center;
          font-weight: 500;
          word-wrap: break-word;
          word-break: break-all;
        }
      }
    }
  }

  /* 状态标签样式 */
  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 17px;
    font-family: MicrosoftYaHei;
    font-weight: 700;
    margin-left: 10px;
    background: linear-gradient(180deg, #fff, #fff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #fff;
    user-select: none;
  }
  .processed {
    background-color: #52c41a; /* 绿色 */
  }
  .processing {
    background-color: #fa8c16; /* 橙色 */
  }
  .unprocessed {
    background-color: #f5222d; /* 红色 */
  }
}
</style>