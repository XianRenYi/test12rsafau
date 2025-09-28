<template>
  <div class="tableCom">
    <div class="tableHead" style="right: 60px; left: -27px">
      <!-- <div
          class="tableHeadItem"
          v-for="(item, index) in head"
          :key="index"
          :style="{ width: item.flex }"
        >
          <div class="title">{{ item.title }}</div>
        </div> -->
      <div class="tableHeadItem">
        <div class="tableHeadItem" :style="{ width: head[0].flex }">
          <div class="title" style="padding-right: 135px">{{ head[0].title }}</div>
        </div>

        <div class="tableHeadItem" :style="{ width: head[1].flex }">
          <div class="title" style="padding-right: 166px">{{ head[1].title }}</div>
        </div>

        <div class="tableHeadItem" :style="{ width: head[2].flex }">
          <div class="title">{{ head[2].title }}</div>
        </div>

        <div class="tableHeadItem" :style="{ width: head[3].flex }">
          <div class="title">{{ head[3].title }}</div>
        </div>

        <div class="tableHeadItem" :style="{ width: head[4].flex }">
          <div class="title">{{ head[4].title }}</div>
        </div>

        <div class="tableHeadItem" :style="{ width: head[5].flex }">
          <div class="title">{{ head[5].title }}</div>
        </div>

        <div class="tableHeadItem" :style="{ width: head[6].flex }">
          <div class="title">{{ head[6].title }}</div>
        </div>

        <div class="tableHeadItem" :style="{ width: head[7].flex }">
          <div class="title">{{ head[7].title }}</div>
        </div>
      </div>
    </div>
    <div class="tableBody" style="right: 8px">
      <div
        class="tableBody2"
        v-for="(item, index) in list"
        :key="index"
        @click="selectRow(index)"
        :class="{ selected: selectedRowIndex === index }"
      >
        <div class="tableBody2s">
          <div class="tableBody2Item" :style="{ width: head[0].flex }">
            <span style="margin-left: 33px">{{ item.deviceName }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[1].flex }">
            <span style="margin-left: 0px">{{ item.networkAddress }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[2].flex }">
            <span style="margin-left: 18px" class="num">{{ item.statusName }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[3].flex }">
            <span style="margin-left: 19px" class="num">{{ item.modelName }}</span>
          </div>

          <div class="tableBody2Item" :style="{ width: head[4].flex }">
            <span style="margin-left: 19px" class="num">{{ item.valueLatest }}</span>
          </div>

          <div class="tableBody2Item" :style="{ width: head[5].flex }">
            <span style="margin-left: 19px" class="num">{{ item.valueAvg }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[6].flex }">
            <span style="margin-left: 15px" class="num">{{ item.valueMax }}</span>
          </div>
          <div class="tableBody2Item" :style="{ width: head[7].flex }">
            <span style="margin-left: 15px" class="num">{{ item.valueMin }}</span>
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
        { title: "名称", flex: "255px" },
        { title: "地点", flex: "180px" },
        { title: "状态", flex: "80px" },
        { title: "类型", flex: "80px" },
        { title: "数值", flex: "80px" },
        { title: "均值", flex: "80px" },
        { title: "最大值", flex: "80px" },
        { title: "最小值", flex: "80px" },
        // { title: "未处理报警", flex: "20%" },
      ],
      list: [],
      selectedRowIndex: null,
    };
  },
  mounted() {
    this.generateData();

    setInterval(this.generateData, 1000);
  },
  methods: {
    async generateData() {
      // const res =await shebeiliebao();
      // this.list = res.data;
      // if(this.selectedRowIndex == null){
      //   this.selectRow(0);
      // }

      await shebeiliebao().then((response) => {
        this.list = response.data;
        if (this.selectedRowIndex == null) {
          this.selectRow(0);
        }
      });
    },
    selectRow(index) {
      this.selectedRowIndex = index;
      const selectedData = this.list[index];
      this.$emit("row-selected", selectedData);
      // 使用 Pinia 设置数据
      const selectedDataStore = useSelectedDataStore();
      selectedDataStore.setSelectedData(selectedData);
    },
  },
};
</script>

<style lang="scss" scoped>
.tableCom {
  //width: calc(100% - 20px);
  margin-left: 10px;
  position: relative;
  height: calc(100% - 10px);
  overflow: hidden;

  .tableHead {
    width: 102%;
    height: 40px;
    background: url("./assets/headbg.png") center center no-repeat;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    border-bottom: 1px solid rgba(38, 75, 112, 1);
    position: relative;

    .tableHeads {
      display: flex;
      height: 40px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      position: relative;
      //width: calc(100% - 20px);
    }

    .tableHeadItem {
      font-size: 17px;
      font-family: MicrosoftYaHei;
      color: #fff;
      margin-left: 10px;
      background: linear-gradient(180deg, #88ecfb, #66b6f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;

      .title {
        width: calc(100% - 20px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
      }
    }
  }

  .tableBody {
    position: relative;
    height: calc(100% - 40px);
    overflow-y: auto; // 添加垂直滚动条
    // 隐藏滚动条（适用于 Webkit 浏览器）
    &::-webkit-scrollbar {
      display: none;
    }

    // 如果需要兼容其他浏览器，可以添加以下样式
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
    .tableBody2 {
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      position: relative;
      width: 100%;
      cursor: pointer;
      z-index: 1;

      &:hover {
        background-color: rgba(10, 235, 255, 0.2);
      }

      &.selected {
        background-color: rgba(10, 235, 255, 0.4);
        transition: background-color 0.3s ease;
        z-index: 2;
      }

      .tableBody2s {
        display: flex;
        height: 40px;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
        flex-direction: row;
        position: relative;
        width: calc(100% - 20px);
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
        font-size: 17px;
        font-family: MicrosoftYaHei;
        color: #fff;
        margin-left: 10px;
        background: linear-gradient(180deg, #fff, #fff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        .num {
          width: calc(100% - 20px);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          text-align: center;
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
