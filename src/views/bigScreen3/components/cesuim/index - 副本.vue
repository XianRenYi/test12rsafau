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
      
      <!-- 控制按钮 -->
      <div class="control-buttons">
        <button @click="adjustMapView" class="control-btn">调整视角</button>
        <button @click="toggle3DMode" class="control-btn">切换2D/3D</button>
        <button @click="createTestHexagons" class="control-btn">创建测试对象</button>
        <button @click="debug3DObjects" class="control-btn">调试3D对象</button>
        <button @click="verify3DObjects" class="control-btn">验证3D对象</button>
        <button @click="forceRender3D" class="control-btn">强制渲染3D</button>
        <button @click="fix3DObjects" class="control-btn">修复3D对象</button>
        <button @click="createSimpleMarkers" class="control-btn">创建简单标记</button>
        <button @click="createWorking3D" class="control-btn">创建工作3D</button>
        <button @click="adjustViewFor3D" class="control-btn">调整3D视角</button>
        <button @click="createBig3D" class="control-btn">创建大3D对象</button>
        <button @click="create2DColumns" class="control-btn">创建2D柱状图</button>
        <button @click="renderRealData" class="control-btn">渲染真实数据</button>
        <button @click="createHexagonColumns" class="control-btn">创建六边形柱状图</button>
        <button @click="createReal3DColumns" class="control-btn">创建真实3D柱状图</button>
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
      key: '96f993daa939cb5c3b365ee355936f77', // 你的高德地图key
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
   
      // 卫星图层
      // new AMap.TileLayer.Satellite(), 
   
       // 使用标准地图图层（默认图层）
       new AMap.TileLayer(),
        // new AMap.TileLayer.RoadNet({
        //   styles: [{
        //     featureType: "label",
        //     elementType: "all",
        //     stylers: { visibility: "off" }
        //   }]
        // }),
        new AMap.Buildings({
          zooms: [16, 18],
          zIndex: 17,
          heightFactor: 2,
          style: {
            // 自定义建筑样式，设置为白色
            fillStyle: '#FFFFFF',     // 填充颜色为白色
            strokeStyle: '#FFFFFF',   // 描边颜色为白色
            borderWidth: 1,
            heightFactor: 1
          }
        })
      ],
      resizeEnable: true,
      center: [120.585197, 31.299473],
      zoom: 16, // 降低缩放级别，能看到更大的范围
      viewMode: '3D',
      pitch: 45, // 降低俯仰角，更容易看到3D对象
      features: ['bg', 'road', 'point'],
     // mapStyle: 'amap://styles/dark',
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
    console.log('创建3D图层');
    object3Dlayer.value = new AMap.Object3DLayer({ zIndex: 999 });
    console.log('3D图层创建成功:', object3Dlayer.value);
    map.value.add(object3Dlayer.value);
    console.log('3D图层已添加到地图');
    
    // 绑定地图事件
    map.value.on('mousemove', handleMapMouseMove);

    
    fetchGasTypes();
    getDeviceGasInfo();
    
    // 添加测试功能 - 创建一些测试数据
    setTimeout(() => {
      createTestHexagons();
      // 调整地图视角以更好地查看3D对象
      adjustMapView();
    }, 2000);
  } catch (error) {
    console.error('地图初始化失败:', error);
  }
};

// 处理地图鼠标移动事件 - 显示悬停的3D墙信息
function handleMapMouseMove(ev) {
  // 如果有选中的3D墙，不处理鼠标移动事件
  if (activeMeshId.value !== '--') return;
  
  const pixel = ev.pixel;
  // 检查像素坐标是否有效数字
  if (isNaN(pixel.x) || isNaN(pixel.y)) return;

  const px = new AMap.Pixel(pixel.x, pixel.y);
  const obj = map.value.getObject3DByContainerPos(px, [object3Dlayer.value], false) || {};
  const id = (!isNil(obj.object) && !isNil(obj.object.id)) ? obj.object.id : '--';
  //console.log('id', id);
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
      console.log('API响应数据:', response);
      const data = response.data;
      console.log('解析后的数据:', data);
      const arr = Object.values(data)[4];
      console.log('第4个数组:', arr);
      
      if (arr.length <= 0) {
        console.log('数据为空，清除地图');
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
  if (!map.value) {
    console.log('地图未初始化');
    return;
  }
  
  console.log('开始渲染地图');
  clearMap();

  console.log('气体数组:', gasArray.value);
  
  // 动态获取可用的气体类型
  const availableGasTypes = Object.keys(gasArray.value);
  console.log('可用的气体类型:', availableGasTypes);
  
  if (availableGasTypes.length === 0) {
    console.log('没有可用的气体数据');
    return;
  }
  
  // 使用第一个可用的气体类型，或者使用'tsp'如果存在
  const targetGasType = availableGasTypes.includes('tsp') ? 'tsp' : availableGasTypes[0];
  gasType.value = targetGasType;
  console.log('选择的气体类型:', gasType.value);
  
  if (gasArray.value[gasType.value] !== undefined) {
    console.log('找到气体数据:', gasArray.value[gasType.value]);
    let lastGas = '';
    
    if (gasArray.value[gasType.value].length === 0) {
      console.log('气体数据为空');
      return;
    }
    
    const localtionMapFrist = JSON.parse(gasArray.value[gasType.value][0].location);
    console.log('第一个位置:', localtionMapFrist);
    
    // 用于计算所有六边形的边界
    const allPoints = [];
    
    gasArray.value[gasType.value].forEach((gas, index) => {
      console.log(`处理第${index}个气体数据:`, gas);
      const localtionMap = JSON.parse(gas.location);
      console.log('位置坐标:', localtionMap);
      allPoints.push(new AMap.LngLat(localtionMap[0], localtionMap[1]));
      
      if (lastGas !== '') {
        console.log('绘制六边形柱状图，位置:', lastGas, '到', localtionMap);
        const location = [lastGas, new AMap.LngLat(localtionMap[0], localtionMap[1])];
        drawWall(location, gas);
      }
      lastGas = new AMap.LngLat(localtionMap[0], localtionMap[1]);
    });
    
    console.log('地图渲染完成');
  } else {
    console.log('未找到气体数据，气体类型:', gasType.value);
  }
};

// 绘制真实3D六边形柱状图（使用Mesh）
const drawWall = (location, gas) => {
  console.log('开始绘制3D六边形柱状图');
  console.log('位置:', location);
  console.log('气体数据:', gas);
  
  if (!map.value || !object3Dlayer.value) {
    console.error('地图或3D图层未初始化');
    return;
  }
  
  // 计算高度（根据数值）
  const height = Math.max(100, Math.min(800, gas.value * 3));
  console.log('计算的高度:', height);
  
  wallArray.value[wallKey.value] = {
    value: gas.value,
    type: gas.status,
    unit: gas.unit,
    no: gas.id,
    time: gas.time
  };
  
  // 根据状态设置颜色
  let colors = {};
  switch (gas.status) {
    case 'LOW':
      colors = {
        top: [0, 1, 0, 0.9], // 绿色顶部
        topFace: [0, 1, 0, 0.4], // 绿色顶面
        bottom: [0, 0.5, 0, 0.9] // 深绿色底部
      };
      break;
    case 'HIGH':
      colors = {
        top: [1, 0, 0, 0.9], // 红色顶部
        topFace: [1, 0, 0, 0.4], // 红色顶面
        bottom: [0.5, 0, 0, 0.9] // 深红色底部
      };
      break;
    case 'NORMAL':
      colors = {
        top: [1, 1, 0, 0.9], // 黄色顶部
        topFace: [1, 1, 0, 0.4], // 黄色顶面
        bottom: [0.5, 0.5, 0, 0.9] // 深黄色底部
      };
      break;
    default:
      colors = {
        top: [0.5, 0.5, 0.5, 0.9], // 灰色顶部
        topFace: [0.5, 0.5, 0.5, 0.4], // 灰色顶面
        bottom: [0.25, 0.25, 0.25, 0.9] // 深灰色底部
      };
  }
  
  console.log('使用的颜色:', colors);
  
  // 获取两个点的中点作为中心点
  const startPoint = location[0];
  const endPoint = location[1];
  const centerLng = (startPoint.lng + endPoint.lng) / 2;
  const centerLat = (startPoint.lat + endPoint.lat) / 2;
  const centerPoint = new AMap.LngLat(centerLng, centerLat);
  
  console.log('中心点坐标:', centerPoint);
  
  try {
    // 将经纬度转换为3D坐标
    const center_3d = map.value.lngLatToGeodeticCoord(centerPoint);
    
    // 创建六边形柱状图
    const addRegularPrism = (center, segment, height, radius, colors) => {
      const cylinder = new AMap.Object3D.Mesh();
      const geometry = cylinder.geometry;
      const verticesLength = segment * 2;
      const path = [];
      
      for (let i = 0; i < segment; i += 1) {
        const angle = 2 * Math.PI * i / segment;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        path.push([x, y]);
        geometry.vertices.push(x, y, 0); // 底部顶点
        geometry.vertices.push(x, y, -height); // 顶部顶点

        geometry.vertexColors.push.apply(geometry.vertexColors, colors.bottom); // 底部颜色
        geometry.vertexColors.push.apply(geometry.vertexColors, colors.top); // 顶部颜色

        const bottomIndex = i * 2;
        const topIndex = bottomIndex + 1;
        const nextBottomIndex = (bottomIndex + 2) % verticesLength;
        const nextTopIndex = (bottomIndex + 3) % verticesLength;

        geometry.faces.push(bottomIndex, topIndex, nextTopIndex); // 侧面三角形1
        geometry.faces.push(bottomIndex, nextTopIndex, nextBottomIndex); // 侧面三角形2
      }

      // 构建顶面三角形
      for (let i = 0; i < segment; i += 1) {
        geometry.vertices.push.apply(geometry.vertices, geometry.vertices.slice(i * 6 + 3, i * 6 + 6)); // 底部顶点
        geometry.vertexColors.push.apply(geometry.vertexColors, colors.topFace);
      }

      const triangles = AMap.GeometryUtil.triangulateShape(path);
      const offset = segment * 2;

      for (let v = 0; v < triangles.length; v += 3) {
        geometry.faces.push(triangles[v] + offset, triangles[v + 2] + offset, triangles[v + 1] + offset);
      }

      cylinder.transparent = true;
      cylinder.id = wallKey.value; // 设置ID用于交互
      object3Dlayer.value.add(cylinder);
    };
    
    // 创建六边形柱状图
    const radius = 50; // 半径
    const segment = 6; // 六边形（6个面）
    
    addRegularPrism(center_3d, segment, height, radius, colors);
    
    console.log('3D六边形柱状图绘制完成，ID:', wallKey.value);
    wallKey.value++;
  } catch (error) {
    console.error('绘制3D六边形柱状图时出错:', error);
  }
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

// 创建测试六边形柱状图
const createTestHexagons = () => {
  console.log('开始创建测试六边形柱状图');
  
  if (!object3Dlayer.value) {
    console.error('3D图层未初始化，无法创建测试对象');
    return;
  }
  
  // 创建几个测试点
  const testPoints = [
    { lng: 120.585197, lat: 31.299473, value: 5, status: 'LOW' },
    { lng: 120.586197, lat: 31.300473, value: 15, status: 'NORMAL' },
    { lng: 120.587197, lat: 31.301473, value: 25, status: 'HIGH' },
    { lng: 120.588197, lat: 31.302473, value: 8, status: 'LOW' }
  ];
  
  testPoints.forEach((point, index) => {
    const centerPoint = new AMap.LngLat(point.lng, point.lat);
    const wallHeight = Math.min(point.value * 10 + 50, 500); // 限制最大高度为500米
    
    let color = '';
    switch (point.status) {
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
    
    try {
      const wall = new AMap.Object3D.Wall({
        path: [centerPoint],
        height: wallHeight,
        color: color,
        id: `test_${index}`
      });
      
      wall.backOrFront = 'both';
      wall.transparent = true;
      object3Dlayer.value.add(wall);
      
      console.log(`测试六边形柱状图 ${index} 创建成功`);
    } catch (error) {
      console.error(`创建测试六边形柱状图 ${index} 失败:`, error);
    }
  });
  
  console.log('测试六边形柱状图创建完成');
};

// 调整地图视角以更好地查看3D对象
const adjustMapView = () => {
  if (!map.value) return;
  
  console.log('调整地图视角');
  
  // 设置合适的俯仰角和缩放级别
  map.value.setPitch(25); // 降低俯仰角，更容易看到3D对象
  map.value.setZoom(16);  // 调整缩放级别
  
  // 调整到数据区域（基于我们知道的坐标范围）
  const dataCenter = new AMap.LngLat(120.526, 31.312); // 基于日志中的坐标范围
  map.value.setCenter(dataCenter);
  
  console.log('地图视角已调整到数据区域');
  console.log('当前地图状态:', {
    center: map.value.getCenter(),
    zoom: map.value.getZoom(),
    pitch: map.value.getPitch(),
    viewMode: is3DMode.value ? '3D' : '2D'
  });
};

// 调试3D对象
const debug3DObjects = () => {
  console.log('=== 3D对象调试信息 ===');
  
  if (!map.value) {
    console.log('❌ 地图未初始化');
    return;
  }
  
  if (!object3Dlayer.value) {
    console.log('❌ 3D图层未初始化');
    return;
  }
  
  // 检查3D图层状态
  console.log('3D图层对象:', object3Dlayer.value);
  
  // 尝试不同的方法获取3D对象
  let objects = [];
  if (object3Dlayer.value.getObject3Ds) {
    objects = object3Dlayer.value.getObject3Ds();
  } else if (object3Dlayer.value.getObjects) {
    objects = object3Dlayer.value.getObjects();
  } else if (object3Dlayer.value.Yd) {
    // 从日志中看到有Yd数组，这可能是存储对象的地方
    objects = object3Dlayer.value.Yd || [];
  }
  
  console.log(`✅ 3D图层中有 ${objects ? objects.length : 0} 个对象`);
  console.log('3D图层详细信息:', {
    hasGetObject3Ds: !!object3Dlayer.value.getObject3Ds,
    hasGetObjects: !!object3Dlayer.value.getObjects,
    hasYd: !!object3Dlayer.value.Yd,
    YdLength: object3Dlayer.value.Yd ? object3Dlayer.value.Yd.length : 0
  });
  
  if (!objects || objects.length === 0) {
    console.log('❌ 没有3D对象');
    console.log('但是我们有', Object.keys(wallArray.value).length, '个墙体数据');
    return;
  }
  
  // 显示前5个对象的信息
  objects.slice(0, 5).forEach((obj, index) => {
    console.log(`对象 ${index}:`, {
      id: obj.id,
      position: obj.position,
      height: obj.height,
      color: obj.color,
      visible: obj.visible
    });
  });
  
  // 检查地图状态
  console.log('地图状态:', {
    viewMode: is3DMode.value ? '3D' : '2D',
    pitch: map.value.getPitch(),
    zoom: map.value.getZoom(),
    center: map.value.getCenter()
  });
  
  // 检查3D图层状态
  console.log('3D图层状态:', {
    visible: object3Dlayer.value.getVisible ? object3Dlayer.value.getVisible() : 'unknown',
    zIndex: object3Dlayer.value.getzIndex ? object3Dlayer.value.getzIndex() : 'unknown'
  });
  
  // 检查我们创建的墙体数组
  console.log('墙体数组信息:', {
    wallArrayLength: Object.keys(wallArray.value).length,
    wallKey: wallKey.value,
    wallArraySample: Object.keys(wallArray.value).slice(0, 3).map(key => ({
      key,
      data: wallArray.value[key]
    }))
  });
  
  // 尝试直接检查3D图层的内容
  console.log('3D图层内容检查:', {
    layerKeys: Object.keys(object3Dlayer.value),
    layerValues: Object.values(object3Dlayer.value).slice(0, 3)
  });
  
  // 检查是否有其他方法可以获取对象
  const layerMethods = Object.getOwnPropertyNames(object3Dlayer.value).filter(name => 
    typeof object3Dlayer.value[name] === 'function' && name.includes('get')
  );
  console.log('3D图层可用方法:', layerMethods);
  
  console.log('=== 调试信息结束 ===');
};

// 验证3D对象是否真的存在
const verify3DObjects = () => {
  console.log('=== 验证3D对象 ===');
  
  if (!map.value) {
    console.log('❌ 地图未初始化');
    return;
  }
  
  if (!object3Dlayer.value) {
    console.log('❌ 3D图层未初始化');
    return;
  }
  
  // 检查3D图层的所有属性
  console.log('3D图层所有属性:', Object.keys(object3Dlayer.value));
  
  // 检查是否有对象数组
  if (object3Dlayer.value.Yd && Array.isArray(object3Dlayer.value.Yd)) {
    console.log(`✅ 找到Yd数组，包含 ${object3Dlayer.value.Yd.length} 个对象`);
    
    // 显示前几个对象的信息
    object3Dlayer.value.Yd.slice(0, 3).forEach((obj, index) => {
      console.log(`Yd对象 ${index}:`, {
        id: obj.id,
        type: obj.type,
        CLASS_NAME: obj.CLASS_NAME,
        position: obj.position
      });
    });
  } else {
    console.log('❌ 没有找到Yd数组');
  }
  
  // 检查其他可能的对象存储位置
  const possibleArrays = ['objects', 'children', 'items', 'elements'];
  possibleArrays.forEach(key => {
    if (object3Dlayer.value[key] && Array.isArray(object3Dlayer.value[key])) {
      console.log(`✅ 找到 ${key} 数组，包含 ${object3Dlayer.value[key].length} 个对象`);
    }
  });
  
  // 检查地图上是否有3D对象
  try {
    const mapObjects = map.value.getAllOverlays ? map.value.getAllOverlays() : [];
    console.log(`地图上的覆盖物数量: ${mapObjects.length}`);
  } catch (error) {
    console.log('无法获取地图覆盖物:', error.message);
  }
  
  console.log('=== 验证结束 ===');
};

// 强制渲染3D对象
const forceRender3D = () => {
  console.log('=== 强制渲染3D对象 ===');
  
  if (!map.value) {
    console.log('❌ 地图未初始化');
    return;
  }
  
  if (!object3Dlayer.value) {
    console.log('❌ 3D图层未初始化');
    return;
  }
  
  // 确保在3D模式
  console.log('切换到3D模式');
  // 使用正确的方法设置3D模式
  if (map.value.setViewMode) {
    map.value.setViewMode('3D');
  } else if (map.value.setPitch) {
    // 通过设置俯仰角来启用3D模式
    map.value.setPitch(60);
  }
  is3DMode.value = true;
  
  // 设置合适的视角
  console.log('设置视角参数');
  map.value.setPitch(20); // 很低的俯仰角
  map.value.setZoom(17);  // 较高的缩放级别
  
  // 调整到数据区域
  const dataCenter = new AMap.LngLat(120.526, 31.312);
  map.value.setCenter(dataCenter);
  
  // 强制刷新3D图层
  console.log('强制刷新3D图层');
  if (object3Dlayer.value.reDraw) {
    object3Dlayer.value.reDraw();
  }
  
  // 尝试重新渲染所有3D对象
  if (object3Dlayer.value.Yd && object3Dlayer.value.Yd.length > 0) {
    console.log(`重新渲染 ${object3Dlayer.value.Yd.length} 个3D对象`);
    
    object3Dlayer.value.Yd.forEach((obj, index) => {
      if (obj.reDraw) {
        obj.reDraw();
      }
      if (obj.needUpdate !== undefined) {
        obj.needUpdate = true;
      }
    });
  }
  
  // 强制地图重绘
  console.log('强制地图重绘');
  if (map.value.reDraw) {
    map.value.reDraw();
  }
  
  // 等待一段时间后检查结果
  setTimeout(() => {
    console.log('渲染完成，当前地图状态:', {
      center: map.value.getCenter(),
      zoom: map.value.getZoom(),
      pitch: map.value.getPitch(),
      viewMode: is3DMode.value ? '3D' : '2D'
    });
  }, 1000);
  
  console.log('=== 强制渲染完成 ===');
};

// 修复3D对象
const fix3DObjects = () => {
  console.log('=== 修复3D对象 ===');
  
  if (!object3Dlayer.value || !object3Dlayer.value.Yd) {
    console.log('❌ 没有3D对象可修复');
    return;
  }
  
  console.log(`开始修复 ${object3Dlayer.value.Yd.length} 个3D对象`);
  
  // 清除所有现有对象
  console.log('清除现有3D对象');
  object3Dlayer.value.clear();
  
  // 重新创建3D对象，使用更简单的方法
  console.log('重新创建3D对象');
  
  // 创建一些测试对象
  const testPositions = [
    { lng: 120.526, lat: 31.312, value: 10, status: 'LOW' },
    { lng: 120.527, lat: 31.313, value: 20, status: 'NORMAL' },
    { lng: 120.528, lat: 31.314, value: 30, status: 'HIGH' },
    { lng: 120.529, lat: 31.315, value: 15, status: 'LOW' }
  ];
  
  testPositions.forEach((pos, index) => {
    try {
      const centerPoint = new AMap.LngLat(pos.lng, pos.lat);
      const height = Math.min(pos.value * 5 + 20, 100); // 更小的高度
      
      let color = '';
      switch (pos.status) {
        case 'LOW':
          color = 'rgba(0,255,0,0.8)'; // 绿色
          break;
        case 'NORMAL':
          color = 'rgba(255,255,0,0.8)'; // 黄色
          break;
        case 'HIGH':
          color = 'rgba(255,0,0,0.8)'; // 红色
          break;
      }
      
      // 使用Wall创建3D对象，但使用更简单的参数
      const wall = new AMap.Object3D.Wall({
        path: [centerPoint],
        height: height,
        color: color,
        id: `fixed_${index}`
      });
      
      wall.backOrFront = 'both';
      wall.transparent = false; // 不透明，更容易看到
      
      object3Dlayer.value.add(wall);
      console.log(`创建修复对象 ${index}:`, { position: centerPoint, height, color });
      
    } catch (error) {
      console.error(`创建修复对象 ${index} 失败:`, error);
    }
  });
  
  // 调整地图视角
  console.log('调整地图视角');
  map.value.setPitch(45);
  map.value.setZoom(18);
  map.value.setCenter(new AMap.LngLat(120.527, 31.313));
  
  console.log('=== 修复完成 ===');
};

// 创建简单标记点（用于测试地图是否正常工作）
const createSimpleMarkers = () => {
  console.log('=== 创建简单标记点 ===');
  
  if (!map.value) {
    console.log('❌ 地图未初始化');
    return;
  }
  
  // 清除现有标记
  map.value.clearMap();
  
  // 创建测试标记点
  const testPositions = [
    { lng: 120.526, lat: 31.312, title: '测试点1', color: 'red' },
    { lng: 120.527, lat: 31.313, title: '测试点2', color: 'blue' },
    { lng: 120.528, lat: 31.314, title: '测试点3', color: 'green' },
    { lng: 120.529, lat: 31.315, title: '测试点4', color: 'yellow' }
  ];
  
  testPositions.forEach((pos, index) => {
    try {
      const marker = new AMap.Marker({
        position: [pos.lng, pos.lat],
        title: pos.title,
        icon: new AMap.Icon({
          size: new AMap.Size(40, 50),
          image: `data:image/svg+xml;base64,${btoa(`
            <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="15" fill="${pos.color}" stroke="white" stroke-width="2"/>
              <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
            </svg>
          `)}`
        })
      });
      
      map.value.add(marker);
      console.log(`创建标记点 ${index + 1}:`, { position: [pos.lng, pos.lat], title: pos.title });
      
    } catch (error) {
      console.error(`创建标记点 ${index + 1} 失败:`, error);
    }
  });
  
  // 调整地图视角
  map.value.setCenter([120.527, 31.313]);
  map.value.setZoom(16);
  
  console.log('=== 简单标记点创建完成 ===');
};

// 创建能正常工作的3D对象
const createWorking3D = () => {
  console.log('=== 创建能工作的3D对象 ===');
  
  if (!map.value || !object3Dlayer.value) {
    console.log('❌ 地图或3D图层未初始化');
    return;
  }
  
  // 清除现有内容
  map.value.clearMap();
  
  // 重新初始化3D图层
  object3Dlayer.value = new AMap.Object3DLayer({ zIndex: 999 });
  map.value.add(object3Dlayer.value);
  
  // 创建测试3D对象
  const testPositions = [
    { lng: 120.526, lat: 31.312, value: 10, status: 'LOW' },
    { lng: 120.527, lat: 31.313, value: 20, status: 'NORMAL' },
    { lng: 120.528, lat: 31.314, value: 30, status: 'HIGH' },
    { lng: 120.529, lat: 31.315, value: 15, status: 'LOW' }
  ];
  
  testPositions.forEach((pos, index) => {
    try {
      const centerPoint = new AMap.LngLat(pos.lng, pos.lat);
      const height = Math.min(pos.value * 2 + 10, 50); // 更小的高度
      
      let color = '';
      switch (pos.status) {
        case 'LOW':
          color = 'rgba(0,255,0,0.9)'; // 绿色，不透明
          break;
        case 'NORMAL':
          color = 'rgba(255,255,0,0.9)'; // 黄色，不透明
          break;
        case 'HIGH':
          color = 'rgba(255,0,0,0.9)'; // 红色，不透明
          break;
      }
      
      console.log(`创建3D对象 ${index}:`, { position: centerPoint, height, color });
      
      // 使用Wall创建3D对象
      const wall = new AMap.Object3D.Wall({
        path: [centerPoint],
        height: height,
        color: color,
        id: `working_${index}`
      });
      
      // 设置属性
      wall.backOrFront = 'both';
      wall.transparent = false; // 不透明
      
      // 添加到3D图层
      object3Dlayer.value.add(wall);
      
      console.log(`3D对象 ${index} 创建成功`);
      
    } catch (error) {
      console.error(`创建3D对象 ${index} 失败:`, error);
    }
  });
  
  // 设置3D视角
  console.log('设置3D视角');
  map.value.setPitch(60); // 较高的俯仰角
  map.value.setZoom(17);  // 较高的缩放级别
  map.value.setCenter([120.527, 31.313]);
  
  // 等待一段时间后检查结果
  setTimeout(() => {
    console.log('3D对象创建完成，当前地图状态:', {
      center: map.value.getCenter(),
      zoom: map.value.getZoom(),
      pitch: map.value.getPitch()
    });
    
    // 检查3D图层中的对象
    if (object3Dlayer.value.Yd) {
      console.log(`3D图层中有 ${object3Dlayer.value.Yd.length} 个对象`);
    }
  }, 1000);
  
  console.log('=== 3D对象创建完成 ===');
};

// 调整3D视角
const adjustViewFor3D = () => {
  console.log('=== 调整3D视角 ===');
  
  if (!map.value) {
    console.log('❌ 地图未初始化');
    return;
  }
  
  // 尝试不同的视角设置
  console.log('尝试不同的视角设置');
  
  // 设置1：低俯仰角，高缩放
  console.log('设置1：低俯仰角，高缩放');
  map.value.setPitch(15);
  map.value.setZoom(19);
  map.value.setCenter([120.527, 31.313]);
  
  setTimeout(() => {
    console.log('设置2：中等俯仰角，中等缩放');
    map.value.setPitch(30);
    map.value.setZoom(18);
    
    setTimeout(() => {
      console.log('设置3：高俯仰角，低缩放');
      map.value.setPitch(75);
      map.value.setZoom(16);
      
      setTimeout(() => {
        console.log('设置4：极低俯仰角，极高缩放');
        map.value.setPitch(5);
        map.value.setZoom(20);
        
        setTimeout(() => {
          console.log('当前地图状态:', {
            center: map.value.getCenter(),
            zoom: map.value.getZoom(),
            pitch: map.value.getPitch()
          });
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
  
  console.log('=== 视角调整完成 ===');
};

// 创建大的3D对象（更容易看到）
const createBig3D = () => {
  console.log('=== 创建大的3D对象 ===');
  
  if (!map.value || !object3Dlayer.value) {
    console.log('❌ 地图或3D图层未初始化');
    return;
  }
  
  // 清除现有内容
  map.value.clearMap();
  
  // 重新初始化3D图层
  object3Dlayer.value = new AMap.Object3DLayer({ zIndex: 999 });
  map.value.add(object3Dlayer.value);
  
  // 创建大的3D对象
  const testPositions = [
    { lng: 120.526, lat: 31.312, value: 50, status: 'LOW' },
    { lng: 120.527, lat: 31.313, value: 100, status: 'NORMAL' },
    { lng: 120.528, lat: 31.314, value: 150, status: 'HIGH' },
    { lng: 120.529, lat: 31.315, value: 75, status: 'LOW' }
  ];
  
  testPositions.forEach((pos, index) => {
    try {
      const centerPoint = new AMap.LngLat(pos.lng, pos.lat);
      const height = pos.value; // 直接使用数值作为高度
      
      let color = '';
      switch (pos.status) {
        case 'LOW':
          color = 'rgba(0,255,0,1)'; // 绿色，完全不透明
          break;
        case 'NORMAL':
          color = 'rgba(255,255,0,1)'; // 黄色，完全不透明
          break;
        case 'HIGH':
          color = 'rgba(255,0,0,1)'; // 红色，完全不透明
          break;
      }
      
      console.log(`创建大3D对象 ${index}:`, { position: centerPoint, height, color });
      
      // 使用Wall创建3D对象
      const wall = new AMap.Object3D.Wall({
        path: [centerPoint],
        height: height,
        color: color,
        id: `big_${index}`
      });
      
      // 设置属性
      wall.backOrFront = 'both';
      wall.transparent = false; // 不透明
      
      // 添加到3D图层
      object3Dlayer.value.add(wall);
      
      console.log(`大3D对象 ${index} 创建成功`);
      
    } catch (error) {
      console.error(`创建大3D对象 ${index} 失败:`, error);
    }
  });
  
  // 设置3D视角
  console.log('设置3D视角');
  map.value.setPitch(45); // 中等俯仰角
  map.value.setZoom(16);  // 中等缩放级别
  map.value.setCenter([120.527, 31.313]);
  
  // 等待一段时间后检查结果
  setTimeout(() => {
    console.log('大3D对象创建完成，当前地图状态:', {
      center: map.value.getCenter(),
      zoom: map.value.getZoom(),
      pitch: map.value.getPitch()
    });
    
    // 检查3D图层中的对象
    if (object3Dlayer.value.Yd) {
      console.log(`3D图层中有 ${object3Dlayer.value.Yd.length} 个对象`);
    }
  }, 1000);
  
  console.log('=== 大3D对象创建完成 ===');
};

// 创建2D柱状图（使用圆形标记模拟）
const create2DColumns = () => {
  console.log('=== 创建2D柱状图 ===');
  
  if (!map.value) {
    console.log('❌ 地图未初始化');
    return;
  }
  
  // 清除现有内容
  map.value.clearMap();
  
  // 创建2D柱状图数据
  const testPositions = [
    { lng: 120.526, lat: 31.312, value: 50, status: 'LOW' },
    { lng: 120.527, lat: 31.313, value: 100, status: 'NORMAL' },
    { lng: 120.528, lat: 31.314, value: 150, status: 'HIGH' },
    { lng: 120.529, lat: 31.315, value: 75, status: 'LOW' },
    { lng: 120.530, lat: 31.316, value: 200, status: 'HIGH' },
    { lng: 120.531, lat: 31.317, value: 25, status: 'LOW' }
  ];
  
  testPositions.forEach((pos, index) => {
    try {
      // 根据数值计算圆形大小
      const size = Math.max(20, Math.min(80, pos.value / 3));
      
      let color = '';
      switch (pos.status) {
        case 'LOW':
          color = '#00FF00'; // 绿色
          break;
        case 'NORMAL':
          color = '#FFFF00'; // 黄色
          break;
        case 'HIGH':
          color = '#FF0000'; // 红色
          break;
      }
      
      // 创建圆形标记
      const marker = new AMap.Marker({
        position: [pos.lng, pos.lat],
        title: `数值: ${pos.value}, 状态: ${pos.status}`,
        icon: new AMap.Icon({
          size: new AMap.Size(size, size),
          image: `data:image/svg+xml;base64,${btoa(`
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="${color}" stroke="white" stroke-width="2"/>
              <text x="${size/2}" y="${size/2+4}" text-anchor="middle" fill="white" font-size="${Math.max(8, size/4)}" font-weight="bold">${pos.value}</text>
            </svg>
          `)}`
        })
      });
      
      map.value.add(marker);
      console.log(`创建2D柱状图 ${index}:`, { position: [pos.lng, pos.lat], value: pos.value, size, color });
      
    } catch (error) {
      console.error(`创建2D柱状图 ${index} 失败:`, error);
    }
  });
  
  // 调整地图视角
  map.value.setCenter([120.528, 31.314]);
  map.value.setZoom(16);
  
  console.log('=== 2D柱状图创建完成 ===');
};

// 渲染真实数据（使用2D柱状图）
const renderRealData = () => {
  console.log('=== 渲染真实数据 ===');
  
  if (!map.value) {
    console.log('❌ 地图未初始化');
    return;
  }
  
  // 清除现有内容
  map.value.clearMap();
  
  // 重新获取数据
  getDeviceGasInfo();
  
  console.log('=== 真实数据渲染完成 ===');
};

// 创建六边形柱状图
const createHexagonColumns = () => {
  console.log('=== 创建六边形柱状图 ===');
  
  if (!map.value) {
    console.log('❌ 地图未初始化');
    return;
  }
  
  // 清除现有内容
  map.value.clearMap();
  
  // 创建六边形柱状图数据
  const testPositions = [
    { lng: 120.526, lat: 31.312, value: 50, status: 'LOW' },
    { lng: 120.527, lat: 31.313, value: 100, status: 'NORMAL' },
    { lng: 120.528, lat: 31.314, value: 150, status: 'HIGH' },
    { lng: 120.529, lat: 31.315, value: 75, status: 'LOW' },
    { lng: 120.530, lat: 31.316, value: 200, status: 'HIGH' },
    { lng: 120.531, lat: 31.317, value: 25, status: 'LOW' }
  ];
  
  testPositions.forEach((pos, index) => {
    try {
      // 根据数值计算六边形大小
      const size = Math.max(30, Math.min(80, pos.value / 3));
      const radius = size / 2;
      
      let color = '';
      switch (pos.status) {
        case 'LOW':
          color = '#00FF00'; // 绿色
          break;
        case 'NORMAL':
          color = '#FFFF00'; // 黄色
          break;
        case 'HIGH':
          color = '#FF0000'; // 红色
          break;
      }
      
      // 创建六边形SVG
      const hexagonSvg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <polygon 
            points="${radius},2 ${radius*1.73},${radius*0.5} ${radius*1.73},${radius*1.5} ${radius},${size-2} ${radius*0.27},${radius*1.5} ${radius*0.27},${radius*0.5}" 
            fill="${color}" 
            stroke="white" 
            stroke-width="2"
          />
          <text 
            x="${radius}" 
            y="${radius+4}" 
            text-anchor="middle" 
            fill="white" 
            font-size="${Math.max(10, size/6)}" 
            font-weight="bold"
          >${pos.value}</text>
        </svg>
      `;
      
      // 创建六边形标记
      const marker = new AMap.Marker({
        position: [pos.lng, pos.lat],
        title: `数值: ${pos.value}, 状态: ${pos.status}`,
        icon: new AMap.Icon({
          size: new AMap.Size(size, size),
          image: `data:image/svg+xml;base64,${btoa(hexagonSvg)}`
        })
      });
      
      map.value.add(marker);
      console.log(`创建六边形柱状图 ${index}:`, { position: [pos.lng, pos.lat], value: pos.value, size, color });
      
    } catch (error) {
      console.error(`创建六边形柱状图 ${index} 失败:`, error);
    }
  });
  
  // 调整地图视角
  map.value.setCenter([120.528, 31.314]);
  map.value.setZoom(16);
  
  console.log('=== 六边形柱状图创建完成 ===');
};

// 创建真实3D柱状图（使用Mesh）
const createReal3DColumns = () => {
  console.log('=== 创建真实3D柱状图 ===');
  
  if (!map.value || !object3Dlayer.value) {
    console.log('❌ 地图或3D图层未初始化');
    return;
  }
  
  // 清除现有内容
  map.value.clearMap();
  
  // 重新初始化3D图层
  object3Dlayer.value = new AMap.Object3DLayer();
  map.value.add(object3Dlayer.value);
  
  // 设置3D视角
  map.value.setPitch(50);
  map.value.setZoom(16.5);
  map.value.setCenter([120.527, 31.313]);
  
  // 创建3D柱状图数据
  const testPositions = [
    { lng: 120.526, lat: 31.312, value: 50, status: 'LOW' },
    { lng: 120.527, lat: 31.313, value: 100, status: 'NORMAL' },
    { lng: 120.528, lat: 31.314, value: 150, status: 'HIGH' },
    { lng: 120.529, lat: 31.315, value: 75, status: 'LOW' },
    { lng: 120.530, lat: 31.316, value: 200, status: 'HIGH' }
  ];
  
  // 添加五棱柱（六边形柱状图）的函数
  const addRegularPrism = (center, segment, height, radius, colors) => {
    try {
      const cylinder = new AMap.Object3D.Mesh();
      const geometry = cylinder.geometry;
      const verticesLength = segment * 2;
      const path = [];
      
      for (let i = 0; i < segment; i += 1) {
        const angle = 2 * Math.PI * i / segment;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        path.push([x, y]);
        geometry.vertices.push(x, y, 0); // 底部顶点
        geometry.vertices.push(x, y, -height); // 顶部顶点

        geometry.vertexColors.push.apply(geometry.vertexColors, colors.bottom); // 底部颜色
        geometry.vertexColors.push.apply(geometry.vertexColors, colors.top); // 顶部颜色

        const bottomIndex = i * 2;
        const topIndex = bottomIndex + 1;
        const nextBottomIndex = (bottomIndex + 2) % verticesLength;
        const nextTopIndex = (bottomIndex + 3) % verticesLength;

        geometry.faces.push(bottomIndex, topIndex, nextTopIndex); // 侧面三角形1
        geometry.faces.push(bottomIndex, nextTopIndex, nextBottomIndex); // 侧面三角形2
      }

      // 构建顶面三角形
      for (let i = 0; i < segment; i += 1) {
        geometry.vertices.push.apply(geometry.vertices, geometry.vertices.slice(i * 6 + 3, i * 6 + 6)); // 底部顶点
        geometry.vertexColors.push.apply(geometry.vertexColors, colors.topFace);
      }

      const triangles = AMap.GeometryUtil.triangulateShape(path);
      const offset = segment * 2;

      for (let v = 0; v < triangles.length; v += 3) {
        geometry.faces.push(triangles[v] + offset, triangles[v + 2] + offset, triangles[v + 1] + offset);
      }

      cylinder.transparent = true;
      object3Dlayer.value.add(cylinder);
      
      console.log('3D柱状图创建成功');
    } catch (error) {
      console.error('创建3D柱状图失败:', error);
    }
  };
  
  // 为每个位置创建3D柱状图
  testPositions.forEach((pos, index) => {
    try {
      // 将经纬度转换为3D坐标
      const center_3d = map.value.lngLatToGeodeticCoord(new AMap.LngLat(pos.lng, pos.lat));
      
      // 根据数值计算高度和半径
      const height = Math.max(200, pos.value * 5); // 高度
      const radius = 100; // 半径
      const segment = 6; // 六边形（6个面）
      
      // 根据状态设置颜色
      let colors = {};
      switch (pos.status) {
        case 'LOW':
          colors = {
            top: [0, 1, 0, 0.9], // 绿色顶部
            topFace: [0, 1, 0, 0.4], // 绿色顶面
            bottom: [0, 0.5, 0, 0.9] // 深绿色底部
          };
          break;
        case 'NORMAL':
          colors = {
            top: [1, 1, 0, 0.9], // 黄色顶部
            topFace: [1, 1, 0, 0.4], // 黄色顶面
            bottom: [0.5, 0.5, 0, 0.9] // 深黄色底部
          };
          break;
        case 'HIGH':
          colors = {
            top: [1, 0, 0, 0.9], // 红色顶部
            topFace: [1, 0, 0, 0.4], // 红色顶面
            bottom: [0.5, 0, 0, 0.9] // 深红色底部
          };
          break;
      }
      
      // 添加偏移，避免重叠
      const offset = new AMap.Pixel((index - 2) * 500, 0);
      const centerWithOffset = center_3d.add(offset);
      
      addRegularPrism(centerWithOffset, segment, height, radius, colors);
      
      console.log(`创建3D柱状图 ${index}:`, { 
        position: [pos.lng, pos.lat], 
        value: pos.value, 
        height, 
        status: pos.status 
      });
      
    } catch (error) {
      console.error(`创建3D柱状图 ${index} 失败:`, error);
    }
  });
  
  console.log('=== 真实3D柱状图创建完成 ===');
};

// 切换2D/3D模式
const toggle3DMode = () => {
  if (!map.value) return;
  
  is3DMode.value = !is3DMode.value;
  
  // 使用正确的方法设置3D模式
  if (map.value.setViewMode) {
    map.value.setViewMode(is3DMode.value ? '3D' : '2D');
  } else if (map.value.setPitch) {
    // 通过设置俯仰角来切换3D模式
    map.value.setPitch(is3DMode.value ? 60 : 0);
  }
  
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

/* 控制按钮样式 */
.control-buttons {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-btn {
  background: rgba(23, 133, 174, 0.9);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0px 0px 6px 0px rgba(75, 237, 255, 0.3);
}

.control-btn:hover {
  background: rgba(23, 133, 174, 1);
  box-shadow: 0px 0px 10px 0px rgba(75, 237, 255, 0.5);
  transform: translateY(-1px);
}

.control-btn:active {
  transform: translateY(0);
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
  
  .control-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .control-btn {
    flex: 1;
    min-width: 80px;
  }
}
</style>