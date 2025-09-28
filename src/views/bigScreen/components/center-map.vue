<template>
  <div :id="withKeyId" class="container">
    <!-- 弹窗组件 -->
    <div v-if="selectedDevice" class="device-popup">
      <div>设备：{{ selectedDevice.id }}</div>
      <div>位置：{{ selectedDevice.company }}</div>
      <div>状态：{{ selectedDevice.status }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import "leaflet/dist/leaflet.css";


import { useDeviceMapStore } from "@/store/deviceMapStore";

import { fetchRightBottomData,bigScreenIndexDeviceList } from '@/api/bigScreenIndex/bigScreen'
const deviceMapStore = useDeviceMapStore();

const L =  require("null").L;
const withKeyId = computed(() => `ssss`);

const devices = ref([

]);

let map: any = null;
let markers: any[] = [];
let tileLayer // 底图

const selectedDevice = ref<any>(null);


const initMars3d = () => {
  map = new container.Map(withKeyId.value, {
    zoom: 17,
    center: { lng: 120.526248, lat: 31.279101 },
     basemaps: [
      { name: "高德地图", type: "gaode", layer: "vec", show: true }
    ]
  });

};


const addMarkers = () => { 
  // 创建矢量数据图层
  const graphicLayer = new container.layer.GraphicLayer()
  map.addLayer(graphicLayer)

  debugger

  // 添加设备标记
  devices.value.forEach(device => {

    const color = device.status == '3' ? "#67C23A" : "#909399";
          

     // 增加pulsate动画点
     const graphic = new container.graphic.Marker({
    latlng: [device.latitude, device.longitude],
    style: {
      width: 30,
      pulse: true,
      pulseColor: color,
      pulseShadowColor: color,
      pulseDuration: 3,
      
    }
    })
    graphicLayer.addGraphic(graphic)
 
    const statusName = device.status == '3' ? '在线':'离线';


    const innerHtml =   `<div class="marsTiltPanel marsTiltPanel-theme-red" style="width: 800px;>
                <div class="marsTiltPanel-wrap">
                    <div class="area">
                <div  style="width:1000px;" ><table>
       <tr scope="col" colspan="2"><td  style="text-align:left;font-size:16px;">产品名称：</td><td  style="text-align:left;font-size:16px;"> `+device.productName +`</td></tr>
            <tr scope="col" colspan="2"> <td  style="text-align:left;font-size:16px;">设备名称：</td><td  style="text-align:left;font-size:16px;"> `+device.deviceName +`</td></tr>
            <tr scope="col" colspan="2"><td  style="text-align:left;font-size:16px;">设备编号：</td><td  style="text-align:left;font-size:16px;">`+device.serialNumber +` </td></tr>
            <tr scope="col" colspan="2"><td  style="text-align:left;font-size:16px;">设备状态：</td><td  style="text-align:left;font-size:16px;">`+statusName +`</td></tr>
                  <tr scope="col" colspan="2"><td  style="text-align:left;font-size:16px;">所在位置：</td><td  style="text-align:left;font-size:16px;">`+device.networkAddress +`</td></tr>
                       <tr scope="col" colspan="2"><td  style="text-align:left;font-size:16px;">经纬度：</td><td  style="text-align:left;font-size:16px;">`+"["+[device.latitude,device.longitude]+"]" +`</td></tr>
          </table></div>
                </div>
                <div class="arrow" ></div>
            </div>`

  // 绑定Popup
  graphic.bindPopup(innerHtml)
  // 绑定Tooltip
  //graphic.bindTooltip(innerHtml, { direction: "right" })

  // 绑定点击事件
  graphic.on("click", function (event) {

    
    //map.flyTo(graphic.getLatLng(), 18); // 平滑移动并居中
    graphic.openPopup();
    //graphic.openTooltip();
    console.log("单击了图层", event)

    deviceMapStore.setSelectedDevice({
      id: device.deviceId,
      lat: device.latitude,
      lng: device.longitude
    });

  })



  // graphic.bindPopup(getInnerHtml).openPopup()  //打开绑定div


  //   graphicLayer.bindPopup(function (event) {
  //   const attr = event?.attr || {}
  //   attr["类型"] = event.type
  //   attr["来源"] = "我是layer上绑定的Popup"
  //   attr["备注"] = "我支持鼠标交互"

  //   return container.Util.getTemplateHtml({ title: "layer上绑定的Popup", template: "all", attr })
  // })

  
  markers.push({ id: device.deviceId, graphic });

  });
};

const createMapData = () => { 

  bigScreenIndexDeviceList().then((res: any) => {
   if(res.code == 200){
    devices.value = res.rows;
    addMarkers();

   }
  })
};


// 更新弹窗位置
const updatePopupPosition = (marker: any) => {
  const pos = marker.getLatLng();
  const popup = document.querySelector(".device-popup") as HTMLElement | null;
  if (popup) {
    const mapPos = map.latLngToContainerPoint(pos);
    popup.style.left = `${mapPos.x}px`;
    popup.style.top = `${mapPos.y}px`;
  }
};

// 监听设备选中变化
watch(
  () => deviceMapStore.selectedDevice,
  newDevice => {
    if (newDevice && map) {
      
      const targetMarker = markers.find(m => m.id == newDevice.id)?.graphic;
      if (targetMarker) {
        map.flyTo(targetMarker.getLatLng(), 18); // 平滑移动并居中
        targetMarker.openPopup();
      }
    }
  }
);

onMounted(() => {

  initMars3d();
  //addMarkers();

  createMapData();


  const customColor = "rgb(9 11 26)" ; // 颜色
  map.container.style.background = customColor //  DIV背景

  // 添加底图
  tileLayer = new container.layer.TileLayer({
    url: "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    customColor: customColor // 使用自定义颜色
  })
  map.addLayer(tileLayer)

  // 图层控制控件
  if (map.controls && map.controls.layers) {
    map.controls.layers.addOverlay(tileLayer, "自定义颜色图层")
  }

});

onBeforeUnmount(() => {
  if (map) map.destroy();
});
</script>

<style scoped>

.contetn_center_top[data-v-2c70621a] {
  width: 1386px;
  height: 782px;
}

/* 使用深度选择器来隐藏“火星科技”标志 */
::v-deep .container-logo {
  display: none !important;
}

.container-logo {
  display: none !important;
}

.container {
    top: 8px;
    left: 5px;
    position: relative;
}

.device-popup {
  position: absolute;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  pointer-events: none;
  min-width: 180px;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.device-id {
  font-weight: bold;
}

.device-status {
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 12px;
}

.status-online {
  background-color: #4CAF50;
  color: white;
}

.status-offline {
  background-color: #9E9E9E;
  color: white;
}

.popup-content {
  font-size: 14px;
}

/* 自定义标记样式 */
.custom-marker {
  display: flex;
  justify-content: center;
  align-items: center;
}

.online-marker {
  animation: pulse 2s infinite;
}

.inner-marker {
  width: 10px;
  height: 10px;
  background-color: #4CAF50;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.8);
}

.ripple-container {
  position: relative;
}

.ripple-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.3);
  animation: ripple 2s infinite;
  z-index: 1;
}

.offline-marker {
  width: 10px;
  height: 10px;
  background-color: #9E9E9E;
  border-radius: 50%;
}

@keyframes pulse {
  0% { transform: scale(0.95); }
  50% { transform: scale(1.1); }
  100% { transform: scale(0.95); }
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}


</style>