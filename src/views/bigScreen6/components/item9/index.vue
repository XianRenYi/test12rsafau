<template>
  <div class="map-container">
    <!-- 地图容器 -->
    <div id="mapContainer" class="map-wrapper"></div>
    
    <!-- 控制按钮区域 -->
    <div class="map-controls">
      <div class="amap_info">
        <div class="gas_map_tab">
          <div class="row">
            <div class="info-col">
              <p>No：</p>
              <p id="infoNo" class="value">{{ infoNo }}</p>
            </div>
            <div class="info-col">
              <p>数值：</p>
              <p id="infoValue" class="value">{{ infoValue }}</p>
            </div>
          </div>
          <div class="row">
            <div class="info-col">
              <p>状态：</p>
              <p id="infoType" class="value" v-html="infoType"></p>
            </div>
            <div class="info-col">
              <p>时间：</p>
              <p id="infoTime" class="value">{{ infoTime }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import { zouHangList } from "@/api/platform/TestZouHangMoNi";

// 地图实例
const map = ref(null);
// 是否为3D模式
const is3DMode = ref(true);
// 选中的标记信息
const selectedMarkerInfo = ref(null);
// 标记点数组
const markers = ref([]);
const object3Dlayer = ref(null);
// 状态变量
const startTime = ref('');
const endTime = ref('');
const gasType = ref('');
const gasTypeOptions = ref([]);
const deviceId = ref(''); // 从路由或props获取
const gasArray = ref({});
const wallArray = ref([]);
const wallKey = ref(0);
const lastMeshId = ref('--');
const lastObj = ref(null);
const activeMeshId = ref('--'); // 当前选中的3D墙ID
const show = ref(true);
const timeOut = ref({});

const infoNo = ref('--');
const infoValue = ref('--');
const infoType = ref('--');
const infoTime = ref('--');

// 初始化地图
const initMap = async () => {
  try {
    const AMap = await AMapLoader.load({
      key: '5347d2541c1cb610089fe899b33e327a', // 你的高德地图key
      plugins: [
        "AMap.Object3DLayer", 
        "AMap.Object3D", 
        "AMap.ControlBar", 
        "AMap.Scale", 
        "AMap.ToolBar", 
        "AMap.DistrictSearch", 
        "AMap.GeoJSON", 
        "AMap.Building"
      ], 
    });

    await nextTick();

    map.value = new AMap.Map("mapContainer", {
      layers: [
        new AMap.TileLayer.Satellite(),
        new AMap.TileLayer.RoadNet({
          styles: [{
            featureType: "label",
            elementType: "all",
            stylers: { visibility: "off" }
          }]
        }),
        new AMap.Buildings({
          zooms: [16, 18],
          zIndex: 10,
          heightFactor: 2
        })
      ],
      resizeEnable: true,
      center: [120.585197, 31.299473],
      zoom: 13,
      viewMode: '3D',
      pitch: 60,
      features: ['bg', 'road', 'point'],
      mapStyle: 'amap://styles/light',
    });
    
    // 添加控制条
    map.value.addControl(new AMap.ControlBar({
      showZoomBar: false,
      showControlButton: true,
      position: { right: '10px', top: '10px' }
    }));
    
    // 添加地图控件
    map.value.addControl(new AMap.Scale());
    map.value.addControl(new AMap.ToolBar({
      position: 'RB',
      showControl: true
    }));
    
    // 初始化3D图层
    object3Dlayer.value = new AMap.Object3DLayer({ zIndex: 999 });
    map.value.add(object3Dlayer.value);
    
    // 绑定地图事件
    map.value.on('mousemove', handleMapMouseMove);

    
    fetchGasTypes();
    getDeviceGasInfo();
  } catch (error) {
    console.error('地图初始化失败:', error);
  }
};

// 处理地图鼠标移动事件 - 显示悬停的3D墙信息
function handleMapMouseMove(ev) {
  // 如果有选中的3D墙，不处理鼠标移动事件
  if (activeMeshId.value !== '--') return;
  
  const pixel = ev.pixel;
  const px = new AMap.Pixel(pixel.x, pixel.y);
  const obj = map.value.getObject3DByContainerPos(px, [object3Dlayer.value], false) || {};
  const id = (!isNil(obj.object) && !isNil(obj.object.id)) ? obj.object.id : '--';
console.log('id', id);
  if (id !== '--' && wallArray.value[id]) {
    // 更新信息面板
    updateInfoPanel(wallArray.value[id]);

    // 高亮当前鼠标悬停的3D墙
    updateMeshColor(obj.object, [0 / 255, 14 / 255, 255 / 255, 0.7]);
    
    // 恢复上一个3D墙的颜色
    if (lastMeshId.value !== id && lastMeshId.value !== '--' && wallArray.value[lastMeshId.value]) {
      resetMeshColor(lastObj.value, lastMeshId.value);
    }

    lastMeshId.value = id;
    lastObj.value = obj.object;
  } else if (lastMeshId.value !== '--') {
    // 鼠标离开3D墙区域，恢复颜色
    resetMeshColor(lastObj.value, lastMeshId.value);
    lastMeshId.value = '--';
    lastObj.value = null;
    
    // 如果没有选中的3D墙，清空信息面板
    if (activeMeshId.value === '--') {
      clearInfoPanel();
    }
  }
}

// // 处理地图点击事件 - 选中3D墙并固定显示信息
// function handleMapClick(ev) {
//   const pixel = ev.pixel;
//   const px = new AMap.Pixel(pixel.x, pixel.y);
//   const obj = map.value.getObject3DByContainerPos(px, [object3Dlayer.value], false) || {};
//   const id = (!isNil(obj.object) && !isNil(obj.object.id)) ? obj.object.id : '--';

//   // 如果点击了新的3D墙
//   if (id !== '--' && wallArray.value[id]) {
//     // 如果之前有选中的3D墙，恢复其颜色
//     if (activeMeshId.value !== '--' && activeMeshId.value !== id && wallArray.value[activeMeshId.value]) {
//       resetMeshColorByWallId(activeMeshId.value);
//     }
    
//     // 设置当前选中的3D墙
//     activeMeshId.value = id;
//     updateMeshColor(obj.object, [140 / 255, 40 / 255, 255 / 255, 0.9]); // 选中的颜色
//     updateInfoPanel(wallArray.value[id]);
//   } else {
//     // 点击空白区域，取消选中状态
//     if (activeMeshId.value !== '--') {
//       resetMeshColorByWallId(activeMeshId.value);
//       activeMeshId.value = '--';
//     }
//   }
// }

// 根据墙体ID恢复颜色
function resetMeshColorByWallId(id) {
  if (!wallArray.value[id]) return;
  
  // 找到对应的3D对象
  const walls = object3Dlayer.value.getObjects();
  const wall = walls.find(w => w.id === id);
  if (wall) {
    resetMeshColor(wall, id);
  }
}

// 恢复网格原始颜色
function resetMeshColor(mesh, id) {
  if (!mesh || !wallArray.value[id]) return;
  
  let color = [];
  switch (wallArray.value[id].type) {
    case 'LOW':
      color = [0/255, 201/255, 50/255, 0.7];
      break;
    case 'HIGH':
      color = [237/255, 15/255, 15/255, 0.7];
      break;
    case 'NORMAL':
      color = [255/255, 251/255, 0/255, 0.7];
      break;
  }
  updateMeshColor(mesh, color);
}

// 更新网格颜色
function updateMeshColor(mesh, color) {
  if (!mesh || !mesh.geometry) return;
  
  const vertexColors = mesh.geometry.vertexColors;
  const len = vertexColors.length;
  
  for (let i = 0; i < len / 4; i++) {
    vertexColors.splice(i * 4, 4, color[0], color[1], color[2], color[3]);
  }

  mesh.needUpdate = true;
  mesh.reDraw();
}

// 更新信息面板
function updateInfoPanel(wallData) {
  infoNo.value = wallData.no || '--';
  infoValue.value = wallData.value ? `${wallData.value}${wallData.unit || ''}` : '--';
  
  let typeText = '';
  switch (wallData.type) {
    case 'LOW':
      typeText = '<span class="info" style="color:#00c932">正常</span>';
      break;
    case 'HIGH':
      typeText = '<span class="danger" style="color:#ed0f0f">超标</span>';
      break;
    case 'NORMAL':
      typeText = '<span class="success" style="color:#fffb00">正常</span>';
      break;
    default:
      typeText = '--';
  }
  infoType.value = typeText;
  infoTime.value = wallData.time ? formatTime(wallData.time) : '--';
}

// 清空信息面板
function clearInfoPanel() {
  infoNo.value = '--';
  infoValue.value = '--';
  infoType.value = '--';
  infoTime.value = '--';
}

// 格式化时间
function formatTime(timeStr) {
  try {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return timeStr;
  }
}

// 获取气体类型
const fetchGasTypes = async () => {
  try {
    gasTypeOptions.value = ['ppm'];
    if (gasTypeOptions.value.length > 0) {
      gasType.value = gasTypeOptions.value[0];
    }
  } catch (error) {
    console.error('获取气体类型失败:', error);
  }
};

// 获取设备气体信息
const getDeviceGasInfo = () => {
  try {
    zouHangList().then((response) => { 
      const data = response.data;
      const arr = Object.values(data)[4];
      
      if (arr.length <= 0) {
        clearMap();
        return;
      }
      
      gasArray.value = data;
      renderMap();
    });
  } catch (error) {
    console.error('获取设备气体信息失败:', error);
    clearMap();
  }
};

// 渲染地图
const renderMap = () => {
  if (!map.value) return;
  
  clearMap();

  gasType.value = 'tsp';
  if (gasArray.value[gasType.value] !== undefined) {
    let lastGas = '';
    const localtionMapFrist = JSON.parse(gasArray.value[gasType.value][0].location);
    
    gasArray.value[gasType.value].forEach((gas, index) => {
      const localtionMap = JSON.parse(gas.location);
      
      if (lastGas !== '') {
        const location = [lastGas, new AMap.LngLat(localtionMap[0], localtionMap[1])];
        drawWall(location, gas);
      }
      lastGas = new AMap.LngLat(localtionMap[0], localtionMap[1]);
    });
    
    map.value.setCenter(localtionMapFrist);
  }
};

// 绘制3D墙
const drawWall = (location, gas) => {
  if (!object3Dlayer.value) return;
  
  let wallHeight = gas.value * 100 + 200;
  wallArray.value[wallKey.value] = {
    value: gas.value,
    type: gas.status,
    unit: gas.unit,
    no: gas.id,
    time: gas.time
  };
  
  let color = '';
  switch (gas.status) {
    case 'LOW':
      color = 'rgba(0,201,50,0.7)';
      break;
    case 'HIGH':
      color = 'rgba(237,15,15,0.7)';
      break;
    case 'NORMAL':
      color = 'rgba(255,251,0,0.7)';
      break;
  }
  
  const wall = new AMap.Object3D.Wall({
    path: [location],
    height: wallHeight,
    color: color,
    id: wallKey.value
  });
  
  wall.backOrFront = 'both';
  wall.transparent = true;
  object3Dlayer.value.add(wall);
  
  wallKey.value++;
};

// 清除地图
const clearMap = () => {
  if (map.value) {
    map.value.clearMap();
  }
  if (object3Dlayer.value) {
    object3Dlayer.value.clear();
  }
  wallArray.value = [];
  wallKey.value = 0;
  activeMeshId.value = '--';
  clearInfoPanel();
};

// 辅助函数：检查是否为null或undefined
const isNil = (value) => {
  return value === null || value === undefined;
};

// 切换2D/3D模式
const toggle3DMode = () => {
  if (!map.value) return;
  
  is3DMode.value = !is3DMode.value;
  map.value.setViewMode(is3DMode.value ? '3D' : '2D');
  
  if (is3DMode.value) {
    map.value.setPitch(60);
  }
};

// 组件挂载时初始化地图
onMounted(() => {
  initMap();
});

// 组件卸载时清理
onUnmounted(() => {
  if (map.value) {
    map.value.off('mousemove', handleMapMouseMove);
    map.value.destroy();
    map.value = null;
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

.map-wrapper {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 100;
}

/* 信息面板容器 - 保留背景图 */
.amap_info {
  width: 200px;
  background-image: url("@/assets/img/gas_map.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%; /* 确保背景图完全覆盖容器 */
  color: #fff;
  border-radius: 8px;
  overflow: hidden; /* 确保内容不超出背景 */
  box-shadow: 0 0 15px rgba(75, 237, 255, 0.5);
}

/* 内容容器 */
.gas_map_tab {
  margin-top: 15px;
  padding: 12px; /* 整体内边距，适配背景图 */
}

/* 行容器 */
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px; /* 行间距 */
  width: 100%;
}

.row:last-child {
  margin-bottom: 0;
}

/* 信息列 - 确保均匀分布并撑满背景 */
.info-col {
  flex: 0 0 calc(50% - 8px); /* 两列布局，减去间距 */
  background: rgba(23, 133, 174, 0.8); /* 半透明背景增强可读性 */
  border-radius: 4px;
  padding: 0px;
  box-sizing: border-box;
  box-shadow: 0px 0px 6px 0px rgba(75, 237, 255, 0.3);
}

/* 文本样式 */
.info-col p {
  margin: 0;
  font-size: 17px;

}

.info-col .value {
  color: #24FFF7; /* 高亮值 */
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .amap_info {
    width: 260px;
  }
  
  .info-col {
    padding: 0px;
  }
  
  .info-col p {
    font-size: 17px;
  }
}
</style>
