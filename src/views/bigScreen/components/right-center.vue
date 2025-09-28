<script setup lang="ts">

import SeamlessScroll from "@/components/seamless-scroll";
import { computed, onMounted, reactive } from "vue";
import { useSettingStore } from "@/store/setting/setting";
import { storeToRefs } from "pinia";
import EmptyCom from "@/components/empty-com";
import { ElMessage } from "element-plus";

const settingStore = useSettingStore();
const { defaultOption, indexConfig } = storeToRefs(settingStore);
const state = reactive<any>({
  list: [],
  defaultOption: {
    ...defaultOption.value,
    singleHeight: 256,
    limitScrollNum: 3,
  },
  scroll: true,
});

const getData = () => {
    var res= {
    "success": true,
    "data": {
        "list": [
            {
                "provinceName": "福建省",
                "cityName": "北京市",
                "countyName": "雷州市",
                "createTime": "1982-12-06 11:00:29",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10000,
                "onlineState": 1
            },
            {
                "provinceName": "云南省",
                "cityName": "香港岛",
                "countyName": "梅河口市",
                "createTime": "1986-11-04 16:32:31",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10001,
                "onlineState": 0
            },
            {
                "provinceName": "陕西省",
                "cityName": "南宁市",
                "countyName": "元谋县",
                "createTime": "1997-09-26 20:10:28",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10002,
                "onlineState": 1
            },
            {
                "provinceName": "新疆维吾尔自治区",
                "cityName": "毕节市",
                "countyName": "-",
                "createTime": "2000-09-03 02:10:00",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10003,
                "onlineState": 0
            },
            {
                "provinceName": "甘肃省",
                "cityName": "三沙市",
                "countyName": "北安市",
                "createTime": "1978-03-26 02:47:06",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10004,
                "onlineState": 0
            },
            {
                "provinceName": "陕西省",
                "cityName": "离岛",
                "countyName": "静安区",
                "createTime": "1987-01-18 21:09:59",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10005,
                "onlineState": 0
            },
            {
                "provinceName": "澳门特别行政区",
                "cityName": "吴忠市",
                "countyName": "凌云县",
                "createTime": "2008-02-26 10:17:57",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10006,
                "onlineState": 0
            },
            {
                "provinceName": "山东省",
                "cityName": "伊犁哈萨克自治州",
                "countyName": "平镇市",
                "createTime": "2024-05-29 11:54:52",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10007,
                "onlineState": 0
            },
            {
                "provinceName": "澳门特别行政区",
                "cityName": "南平市",
                "countyName": "同仁县",
                "createTime": "2003-03-01 20:20:32",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10008,
                "onlineState": 0
            },
            {
                "provinceName": "内蒙古自治区",
                "cityName": "鄂尔多斯市",
                "countyName": "铜陵县",
                "createTime": "1976-12-18 07:36:07",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10009,
                "onlineState": 0
            },
            {
                "provinceName": "宁夏回族自治区",
                "cityName": "西双版纳傣族自治州",
                "countyName": "猇亭区",
                "createTime": "2021-07-24 19:44:13",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10010,
                "onlineState": 1
            },
            {
                "provinceName": "福建省",
                "cityName": "上海市",
                "countyName": "红寺堡区",
                "createTime": "1972-12-06 22:17:35",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10011,
                "onlineState": 1
            },
            {
                "provinceName": "海外",
                "cityName": "铜仁市",
                "countyName": "南开区",
                "createTime": "1997-08-11 08:47:56",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10012,
                "onlineState": 1
            },
            {
                "provinceName": "宁夏回族自治区",
                "cityName": "渭南市",
                "countyName": "凤翔县",
                "createTime": "2017-09-09 16:41:08",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10013,
                "onlineState": 1
            },
            {
                "provinceName": "天津",
                "cityName": "郴州市",
                "countyName": "南浔区",
                "createTime": "1970-09-26 16:25:56",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10014,
                "onlineState": 0
            },
            {
                "provinceName": "重庆",
                "cityName": "离岛",
                "countyName": "西沙群岛",
                "createTime": "1992-06-03 01:05:39",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10015,
                "onlineState": 1
            },
            {
                "provinceName": "云南省",
                "cityName": "哈尔滨市",
                "countyName": "余江县",
                "createTime": "2017-07-27 21:19:40",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10016,
                "onlineState": 0
            },
            {
                "provinceName": "河南省",
                "cityName": "恩施土家族苗族自治州",
                "countyName": "宿豫区",
                "createTime": "1997-02-07 23:25:16",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10017,
                "onlineState": 1
            },
            {
                "provinceName": "云南省",
                "cityName": "吉林市",
                "countyName": "海沧区",
                "createTime": "2009-09-27 15:03:08",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10018,
                "onlineState": 1
            },
            {
                "provinceName": "湖南省",
                "cityName": "毕节市",
                "countyName": "普陀区",
                "createTime": "1983-09-26 17:56:09",
                "deviceId": "6c512d754bbcd6d7cd86abce0e0cac58",
                "gatewayno": 10019,
                "onlineState": 0
            }
        ]
    }
};
console.log("左下--设备提醒", res);
      if (res.success) {
        state.list = res.data.list;
      } else {
        ElMessage({
          message: res.msg,
          type: "warning",
        });
      }

  
};
const addressHandle = (item: any) => {
  let name = item.provinceName;
  if (item.cityName) {
    name += "/" + item.cityName;
    if (item.countyName) {
      name += "/" + item.countyName;
    }
  }
  return name;
};
const comName = computed(() => {
  if (indexConfig.value.rightBottomSwiper) {
    return SeamlessScroll;
  } else {
    return EmptyCom;
  }
});
onMounted(() => {
  getData();
});
</script>

<template>
  <div class="left_boottom_wrap beautify-scroll-def" :class="{ 'overflow-y-auto': !indexConfig.rightBottomSwiper }">
    <component
      :is="comName"
      :list="state.list"
      v-model="state.scroll"
      :singleHeight="state.defaultOption.singleHeight"
      :step="state.defaultOption.step"
      :limitScrollNum="state.defaultOption.limitScrollNum"
      :hover="state.defaultOption.hover"
      :singleWaitTime="state.defaultOption.singleWaitTime"
      :wheel="state.defaultOption.wheel"
    >
      <ul class="left_boottom">
        <li class="left_boottom_item" v-for="(item, i) in state.list" :key="i">
          <span class="orderNum doudong">{{ i + 1 }}</span>
          <div class="inner_right">
            <div class="dibu"></div>
            <div class="flex">
              <div class="info addresswrap">
                <span class="labels">设备编号：</span>
                <span class="text-content "> {{ item.gatewayno }}</span>
              </div>
              <div class="info addresswrap">
                <span class="labels">告警时间：</span>
                <span class="text-content"> {{ item.createTime }}</span>
              </div>
            </div>

          

            <div class="info addresswrap">
              <span class="labels">告警信息：</span>
              <span class="text-content" > {{ 'ppm高于200预警'}}</span>
            </div>
          </div>
        </li>
      </ul>
    </component>
  </div>
</template>

<style scoped lang="scss">
.left_boottom_wrap {
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.doudong {
  overflow: hidden;
  backface-visibility: hidden;
}

.overflow-y-auto {
  overflow-y: auto;
}

.left_boottom {
  width: 100%;
  height: 100%;

  .left_boottom_item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    font-size: 30px;
    margin: 10px 0;
    .orderNum {
      margin: 0 16px 0 -20px;
    }

    .info {
      margin-right: 10px;
      display: flex;
      align-items: center;
      color: #fff;

      .labels {
        flex-shrink: 0;
        font-size: 25px;
        color: rgba(255, 255, 255, 0.6);
      }

      .text-content{
        font-size: 25px;
      }

      .zhuyao {
        color: #1890ff;
        font-size: 15px;
      }

      .ciyao {
        color: rgba(255, 255, 255, 0.8);
      }

      .warning {
        color: #e6a23c;
        font-size: 15px;
      }
    }

    .inner_right {
      position: relative;
      height: 100%;
      width: 380px;
      flex-shrink: 0;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      .dibu {
        position: absolute;
        height: 2px;
        width: 104%;
        background-image: url("@/assets/img/zuo_xuxian.png");
        bottom: -10px;
        left: -2%;
        background-size: cover;
      }
      .addresswrap {
        width: 100%;
        display: flex;
        margin-top: 8px;
      }
    }

    .wangguan {
      color: #1890ff;
      font-weight: 900;
      font-size: 15px;
      width: 80px;
      flex-shrink: 0;
    }

    .time {
      font-size: 12px;
      // color: rgba(211, 210, 210,.8);
      color: #fff;
    }

    .address {
      font-size: 12px;
      cursor: pointer;
      // @include text-overflow(1);
    }

    .types {
      width: 30px;
      flex-shrink: 0;
    }

    .typeRed {
      color: #fc1a1a;
    }

    .typeGreen {
      color: #29fc29;
    }
  }
}
</style>
