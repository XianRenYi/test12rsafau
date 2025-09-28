<template>
  <div class="itemBody">
    <echarts :list="list"></echarts>
  </div>
</template>

<script>
import echarts from './echarts/index.vue'

import { time } from 'highcharts';
import { useSelectedDataStore } from '@/store/selectedDataStore'
import { selectLimitDescList } from '@/api/bigScreenIndex/bigScreen'

export default {
  name: "item",
  components: {echarts},
  props: {
    active: {
      type: [String, Number],
      default() {
        return 0;
      }
    }
  },
  data() {
    return {
      selectedFirst: null,
      list: [],
    }
  },
  watch: {
    // selectedData(newVal) {
    //   if (newVal) {
    //     this.handleDataFromItem5(newVal)
    //   }
    // },
    active() {
      this.getData();
    },
    selectedData(newVal) {
    if (newVal) {
     this.selectedFirst = newVal;
     console.log('selectedData', newVal);
     this.getData();
    }
  }
  },
    computed: {
    selectedData() {
      return useSelectedDataStore().selectedData
    }
  },
  mounted() {
    this.getData();
    setInterval(this.getData, 1000);
  },
  methods: {
    async getData() {
      try {
  
     selectLimitDescList(this.selectedFirst).then(res => {
      this.list = res.data;
     });

      } catch (err) {
        console.error(err);
      }
    },

    handleDataFromItem5(data) {
      console.log('从 item5 接收到的数据:', data)
      // 处理数据逻辑
    }


    
  },
}
</script>

<style lang="scss" scoped>
.itemBody {
  width: 100%;
  height: calc(100% - 0px);
  position: relative;
}
</style>
