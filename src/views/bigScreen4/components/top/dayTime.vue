/**
* @Author: 858834013@qq.com
* @Name: dayTime
* @Date: 2022-7-17
* @Desc: dayTime Week
*/
<template>
  <div class="dateTime  number">
    {{ date }} <span>{{ time }}</span><span>星期{{ week }}</span>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: "dayTime",
  components: {dayjs},
  data() {
    return {
      date: dayjs().format("YYYY.MM.DD"),
      time: dayjs().format("HH:mm分:秒"),
    }
  },
  computed: {
    week() {
      var datas = dayjs().day()
      var week = ['日', '一', '二', '三', '四', '五', '六']
      return week[datas]
    }
  },
  watch: {},
  mounted() {
    var that = this;
    setInterval(function () {
      that.time = dayjs().format("HH时mm分ss秒");
    }, 1000);
  },
  methods: {}
}
</script>

<style lang="scss" scoped>


.dateTime {
  margin-top: 2px;
  display: flex;
  font-size: 16px;
  font-family: MicrosoftYaHei;
  font-weight: 400;
  color: #45BEFF;
  opacity: 0.8;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;

  span {
   
    margin-left: 5px;
  }
}
</style>
