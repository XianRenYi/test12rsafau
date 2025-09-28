<template>
  <div class="tableCom">
    <div class="tableHead">
      <div class="tableHeadItem" v-for="(item, index) in head" :key="index" :style="{ flex: item.flex }">
        <span>{{ item.title }}</span>
      </div>
    </div>
    <vue-seamless-scroll
        class="tableBody"
        :data="list"
        direction="top"
        :steep="0.3"
        roller
        :distance="20"
    >
      <div class="tableBody2" v-for="(item, index) in list" :key="index">
        <div class="tableBody2Item" :style="{ flex: head[0].flex }">
          <span class="num">{{ item.date }}</span>
        </div>
        <div class="tableBody2Item" v-for="(param, paramIndex) in item.params" :key="paramIndex" :style="{ flex: head[paramIndex + 1].flex }">
          <span class="num">{{ param.value }}</span>
        </div>
      </div>
    </vue-seamless-scroll>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';

const props = defineProps({
  head: {
    type: Array,
    default() {
      return [
        { title: "日期", flex: 1 },
        { title: "pH (单位)", flex: 1 },
        { title: "COD (mg/L)", flex: 1 },
        { title: "BOD (mg/L)", flex: 1 },
        { title: "SS (mg/L)", flex: 1 },
        { title: "氨氮 (mg/L)", flex: 1 },
        { title: "总磷 (mg/L)", flex: 1 },
        { title: "总氮 (mg/L)", flex: 1 },
      ];
    },
  },
});

const list = ref([]);

onMounted(() => {
  list.value = generateWaterQualityData();
});

function generateWaterQualityData() {
  const waterQualityParams = [
    { name: "pH", min: 1, max: 14 },
    { name: "COD", min: 1, max: 100 },
    { name: "BOD", min: 1, max: 100 },
    { name: "SS", min: 1, max: 100 },
    { name: "氨氮", min: 1, max: 10 },
    { name: "总磷", min: 1, max: 10 },
    { name: "总氮", min: 1, max: 10 },
  ];

  const generatedList = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const params = waterQualityParams.map((param) => ({
      name: param.name,
      value: Math.floor(Math.random() * (param.max - param.min + 1)) + param.min,
    }));
    generatedList.push({
      date: date.toLocaleDateString(),
      params,
    });
  }
  return generatedList;
}
</script>


<style lang="scss" scoped>
.tableCom {
  width: calc(100% - 60px);
  margin: 0 auto;
  position: relative;
  height: 100%;
  overflow: hidden;

  .tableHead {
    width: 100%;
    height: 50px;
    background: url("assets/headbg.png") center bottom no-repeat;
    background-size: 100% 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;

    .tableHeadItem {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      flex: 1;

      span {
        font-size: 20px;
        font-family: PangMenZhengDao;
        font-weight: 400;
        color: #ffffff;
        line-height: 30px;
        background: linear-gradient(0deg, #2ddeff 0%, #ffffff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }

  .tableBody {
    position: relative;
    height: calc(100% - 34px);
    overflow: hidden;

    .tableBody2 {
      height: 50px;
      background: url("assets/tablebg.png") center bottom no-repeat;
      background-size: 100% 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;

      .tableBody2Item {
        font-size: 16px;
        font-family: MiSans;
        font-weight: 500;
        color: #b1ecff;
        text-shadow: 0px 4px 10px rgba(0, 42, 108, 0.12);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: nowrap;
        flex-direction: row;
        flex: 1;
      }
    }
  }
}
</style>