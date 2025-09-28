<template>
  <div class="map-container">
    <!-- 地图容器 -->
    <div id="mapContainer" class="map-wrapper"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-item">
        <button @click="startAnimation" :disabled="isAnimating">开始飞行</button>
        <button @click="pauseAnimation" :disabled="!isAnimating">暂停</button>
        <button @click="resetAnimation">重置</button>
        <button @click="loadAllGrids">一次性加载所有网格</button>
        <button @click="testDataParsing">测试数据解析</button>
      </div>
      <div class="control-item">
        <label>飞行速度: </label>
        <input type="range" v-model="animationSpeed" min="1" max="10" />
        <span>{{ animationSpeed }}x</span>
      </div>
      <div class="control-item">
        <span>已生成方格: {{ generatedGrids.length }}</span>
      </div>
      <div class="control-item">
        <span>当前时间: {{ currentTime }}</span>
      </div>
      <div class="control-item">
        <span>数据状态: {{ dataStatus }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import { parseExcelData } from './excelData.js';
import mapv from 'mapv';

// 地图实例
const map = ref(null);
const AMap = ref(null);

// 动画控制
const isAnimating = ref(false);
const animationSpeed = ref(3);
const currentTime = ref('');
const generatedGrids = ref([]);
const dataStatus = ref('未加载');

// 无人机相关
const droneMarker = ref(null);
const flightPath = ref([]);
const gridSize = 50; // 50米方格

// 网格参数
const gridParams = ref({
  // 50米对应的经纬度间隔
  lngSizeDegrees: 0,
  latSizeDegrees: 0
});

// 解析飞行数据
const parseFlightData = async () => {
  try {
    dataStatus.value = '加载中...';
    const data = await parseExcelData();
    
    if (data.length === 0) {
      dataStatus.value = '数据为空';
      return [];
    }
    
    flightPath.value = data.map(item => ({
      time: item.time,
      lng: item.lng,
      lat: item.lat,
      height: item.height,
      temperature: item.temperature,
      pm25: item.pm25
    }));
    
    dataStatus.value = `已加载 ${flightPath.value.length} 个数据点`;
    console.log('解析到飞行数据点:', flightPath.value.length);
    
    // 分析数据范围
    analyzeDataRange(flightPath.value);
    
    return flightPath.value;
  } catch (error) {
    console.error('解析Excel数据失败:', error);
    dataStatus.value = '加载失败';
    flightPath.value = [];
    return [];
  }
};

// 分析数据范围
const analyzeDataRange = (data) => {
  if (!data || data.length === 0) return;
  
  const lngs = data.map(d => d.lng);
  const lats = data.map(d => d.lat);
  
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  
  const lngRange = maxLng - minLng;
  const latRange = maxLat - minLat;
  
  console.log('=== 数据范围分析 ===');
  console.log(`经度范围: ${minLng.toFixed(6)} ~ ${maxLng.toFixed(6)} (差值: ${lngRange.toFixed(6)})`);
  console.log(`纬度范围: ${minLat.toFixed(6)} ~ ${maxLat.toFixed(6)} (差值: ${latRange.toFixed(6)})`);
  
  // 50米对应的经纬度间隔
  const latRad = (31 * Math.PI) / 180;
  const lngSizeDegrees = 50 / (111000 * Math.cos(latRad));
  const latSizeDegrees = 50 / 111000;
  
  console.log(`50米网格大小: 经度 ${lngSizeDegrees.toFixed(8)} 度, 纬度 ${latSizeDegrees.toFixed(8)} 度`);
  
  // 计算网格范围
  const minGridLng = Math.floor(minLng / lngSizeDegrees);
  const maxGridLng = Math.ceil(maxLng / lngSizeDegrees);
  const minGridLat = Math.floor(minLat / latSizeDegrees);
  const maxGridLat = Math.ceil(maxLat / latSizeDegrees);
  
  const gridCols = maxGridLng - minGridLng + 1;
  const gridRows = maxGridLat - minGridLat + 1;
  const totalGrids = gridCols * gridRows;
  
  console.log(`网格范围: ${gridCols} 列 x ${gridRows} 行 = ${totalGrids} 个网格`);
  console.log(`目标网格数量: 238`);
  console.log(`差异: ${totalGrids - 238}`);
  
  // 分析实际数据点覆盖的网格
  const uniqueGrids = new Set();
  data.forEach(point => {
    const gridCoord = getGridCoordinate(point.lng, point.lat);
    uniqueGrids.add(`${gridCoord.gridLng}_${gridCoord.gridLat}`);
  });
  
  console.log(`实际覆盖网格数量: ${uniqueGrids.size}`);
  
  // 生成所有可能的网格
  const allPossibleGrids = generateAllPossibleGrids(data);
  
  // 计算网格参数
  if (gridParams.value.lngSizeDegrees === 0) {
    const latRad = (31 * Math.PI) / 180;
    gridParams.value.lngSizeDegrees = 50 / (111000 * Math.cos(latRad));
    gridParams.value.latSizeDegrees = 50 / 111000;
  }
  
  // 验证网格生成
  console.log('=== 网格验证 ===');
  console.log(`理论网格总数: ${allPossibleGrids.size}`);
  console.log(`目标网格总数: 238`);
  console.log(`差异: ${allPossibleGrids.size - 238}`);
  
  // 分析每行的网格数量
  const rowCounts = new Map();
  allPossibleGrids.forEach(gridKey => {
    const [gridLng, gridLat] = gridKey.split('_').map(Number);
    rowCounts.set(gridLat, (rowCounts.get(gridLat) || 0) + 1);
  });
  
  console.log('每行实际网格数量:');
  const sortedRows = Array.from(rowCounts.entries()).sort((a, b) => a[0] - b[0]);
  sortedRows.forEach(([row, count]) => {
    console.log(`第${row}行: ${count}个网格`);
  });
  
  console.log('==================');
};

// 计算网格坐标 - 基于50米×50米的实际距离
const getGridCoordinate = (lng, lat) => {
  // 如果网格参数还没有计算，先计算
  if (gridParams.value.lngSizeDegrees === 0) {
    const latRad = (31 * Math.PI) / 180; // 31度转换为弧度
    gridParams.value.lngSizeDegrees = 50 / (111000 * Math.cos(latRad)); // 经度方向50米对应的度数
    gridParams.value.latSizeDegrees = 50 / 111000; // 纬度方向50米对应的度数
  }
  
  // 使用更精确的网格计算
  const gridLng = Math.round(lng / gridParams.value.lngSizeDegrees);
  const gridLat = Math.round(lat / gridParams.value.latSizeDegrees);
  
  return {
    gridLng,
    gridLat,
    centerLng: gridLng * gridParams.value.lngSizeDegrees + gridParams.value.lngSizeDegrees / 2,
    centerLat: gridLat * gridParams.value.latSizeDegrees + gridParams.value.latSizeDegrees / 2,
    lngSizeDegrees: gridParams.value.lngSizeDegrees,
    latSizeDegrees: gridParams.value.latSizeDegrees
  };
};

// 基于实际数据分布生成所有可能的网格
const generateAllPossibleGrids = (data) => {
  if (!data || data.length === 0) return;
  
  // 50米对应的经纬度间隔
  const latRad = (31 * Math.PI) / 180;
  const lngSizeDegrees = 50 / (111000 * Math.cos(latRad));
  const latSizeDegrees = 50 / 111000;
  
  const lngs = data.map(d => d.lng);
  const lats = data.map(d => d.lat);
  
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  
  console.log('=== 生成所有可能网格 ===');
  console.log(`数据范围: 经度 ${minLng.toFixed(6)} ~ ${maxLng.toFixed(6)}`);
  console.log(`数据范围: 纬度 ${minLat.toFixed(6)} ~ ${maxLat.toFixed(6)}`);
  console.log(`50米网格大小: 经度 ${lngSizeDegrees.toFixed(8)} 度, 纬度 ${latSizeDegrees.toFixed(8)} 度`);
  
  // 计算网格范围
  const minGridLng = Math.floor(minLng / lngSizeDegrees);
  const maxGridLng = Math.ceil(maxLng / lngSizeDegrees);
  const minGridLat = Math.floor(minLat / latSizeDegrees);
  const maxGridLat = Math.ceil(maxLat / latSizeDegrees);
  
  console.log(`网格范围: 经度 ${minGridLng} ~ ${maxGridLng}, 纬度 ${minGridLat} ~ ${maxGridLat}`);
  
  // 生成所有可能的网格
  const allGrids = new Set();
  for (let lat = minGridLat; lat <= maxGridLat; lat++) {
    for (let lng = minGridLng; lng <= maxGridLng; lng++) {
      allGrids.add(`${lng}_${lat}`);
    }
  }
  
  console.log(`理论网格数量: ${allGrids.size}`);
  console.log('==================');
  
  return allGrids;
};

// 创建方格
const createGrid = (lng, lat, data) => {
  const gridCoord = getGridCoordinate(lng, lat);
  const gridKey = `${gridCoord.gridLng}_${gridCoord.gridLat}`;
  
  // 检查是否已存在
  if (generatedGrids.value.find(g => g.key === gridKey)) {
    return null;
  }
  
  // 创建方格多边形
  const gridPolygon = new AMap.value.Polygon({
    path: [
      [gridCoord.centerLng - gridCoord.lngSizeDegrees/2, gridCoord.centerLat - gridCoord.latSizeDegrees/2],
      [gridCoord.centerLng + gridCoord.lngSizeDegrees/2, gridCoord.centerLat - gridCoord.latSizeDegrees/2],
      [gridCoord.centerLng + gridCoord.lngSizeDegrees/2, gridCoord.centerLat + gridCoord.latSizeDegrees/2],
      [gridCoord.centerLng - gridCoord.lngSizeDegrees/2, gridCoord.centerLat + gridCoord.latSizeDegrees/2]
    ],
    fillColor: getColorByPM25(data.pm25),
    fillOpacity: 0.6,
    strokeColor: '#fff',
    strokeWeight: 1,
    strokeOpacity: 0.8
  });
  
  // 添加标签
  const label = new AMap.value.Text({
    text: data.pm25.toFixed(1),
    position: [gridCoord.centerLng, gridCoord.centerLat],
    style: {
      color: '#000',
      fontSize: '10px',
      fontWeight: 'bold',
      textAlign: 'center'
    }
  });
  
  map.value.add(gridPolygon);
  map.value.add(label);
  
  const gridData = {
    key: gridKey,
    polygon: gridPolygon,
    label: label,
    data: data,
    gridCoord: gridCoord
  };
  
  generatedGrids.value.push(gridData);
  return gridData;
};

// 根据PM2.5值获取颜色
const getColorByPM25 = (pm25) => {
  if (pm25 <= 35) return '#00ff00'; // 绿色 - 优
  if (pm25 <= 75) return '#ffff00'; // 黄色 - 良
  if (pm25 <= 115) return '#ff8000'; // 橙色 - 轻度污染
  if (pm25 <= 150) return '#ff0000'; // 红色 - 中度污染
  if (pm25 <= 250) return '#800080'; // 紫色 - 重度污染
  return '#8b0000'; // 深红色 - 严重污染
};

// 创建无人机标记
const createDroneMarker = (lng, lat) => {
  const marker = new AMap.value.Marker({
    position: [lng, lat],
    icon: new AMap.value.Icon({
      size: new AMap.value.Size(20, 20),
      image: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" fill="#ff0000" stroke="#fff" stroke-width="2"/>
          <circle cx="10" cy="10" r="3" fill="#fff"/>
        </svg>
      `),
      imageSize: new AMap.value.Size(20, 20)
    }),
    title: '无人机'
  });
  
  map.value.add(marker);
  return marker;
};

// 动画函数
const animateFlight = async () => {
  if (!flightPath.value.length) return;
  
  isAnimating.value = true;
  let currentIndex = 0;
  
  // 创建无人机标记
  if (droneMarker.value) {
    map.value.remove(droneMarker.value);
  }
  
  const firstPoint = flightPath.value[0];
  droneMarker.value = createDroneMarker(firstPoint.lng, firstPoint.lat);
  
  // 设置地图中心
  map.value.setCenter([firstPoint.lng, firstPoint.lat]);
  map.value.setZoom(17);
  
  const animate = () => {
    if (!isAnimating.value || currentIndex >= flightPath.value.length) {
      isAnimating.value = false;
      return;
    }
    
    const point = flightPath.value[currentIndex];
    
    // 更新无人机位置
    if (droneMarker.value) {
      droneMarker.value.setPosition([point.lng, point.lat]);
    }
    
    // 更新当前时间
    currentTime.value = point.time;
    
    // 生成方格
    createGrid(point.lng, point.lat, point);
    
    currentIndex++;
    
    // 控制动画速度
    const delay = 1000 / animationSpeed.value;
    setTimeout(animate, delay);
  };
  
  animate();
};

// 开始动画
const startAnimation = async () => {
  if (!flightPath.value.length) {
    await parseFlightData();
  }
  animateFlight();
};

// 暂停动画
const pauseAnimation = () => {
  isAnimating.value = false;
};

// 重置动画
const resetAnimation = () => {
  isAnimating.value = false;
  currentIndex = 0;
  currentTime.value = '';
  
  // 清除所有方格
  generatedGrids.value.forEach(grid => {
    map.value.remove(grid.polygon);
    map.value.remove(grid.label);
  });
  generatedGrids.value = [];
  
  // 移除无人机标记
  if (droneMarker.value) {
    map.value.remove(droneMarker.value);
    droneMarker.value = null;
  }
};

// 一次性加载所有网格
const loadAllGrids = async () => {
  if (!flightPath.value.length) {
    await parseFlightData();
  }
  
  if (!flightPath.value.length) {
    console.error('没有飞行数据');
    return;
  }
  
  // 清除现有网格
  generatedGrids.value.forEach(grid => {
    map.value.remove(grid.polygon);
    map.value.remove(grid.label);
  });
  generatedGrids.value = [];
  
  // 计算网格参数
  if (gridParams.value.lngSizeDegrees === 0) {
    const latRad = (31 * Math.PI) / 180;
    gridParams.value.lngSizeDegrees = 50 / (111000 * Math.cos(latRad));
    gridParams.value.latSizeDegrees = 50 / 111000;
  }
  
  // 获取数据范围
  const lngs = flightPath.value.map(d => d.lng);
  const lats = flightPath.value.map(d => d.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  
  // 计算网格范围
  const minGridLng = Math.floor(minLng / gridParams.value.lngSizeDegrees);
  const maxGridLng = Math.ceil(maxLng / gridParams.value.lngSizeDegrees);
  const minGridLat = Math.floor(minLat / gridParams.value.latSizeDegrees);
  const maxGridLat = Math.ceil(maxLat / gridParams.value.latSizeDegrees);
  
  console.log('=== 一次性加载所有网格 ===');
  console.log(`数据范围: 经度 ${minLng.toFixed(6)} ~ ${maxLng.toFixed(6)}`);
  console.log(`数据范围: 纬度 ${minLat.toFixed(6)} ~ ${maxLat.toFixed(6)}`);
  console.log(`网格范围: 经度 ${minGridLng} ~ ${maxGridLng}, 纬度 ${minGridLat} ~ ${maxGridLat}`);
  console.log(`50米网格大小: 经度 ${gridParams.value.lngSizeDegrees.toFixed(8)} 度, 纬度 ${gridParams.value.latSizeDegrees.toFixed(8)} 度`);
  
  // 生成所有网格
  let gridCount = 0;
  for (let lat = minGridLat; lat <= maxGridLat; lat++) {
    for (let lng = minGridLng; lng <= maxGridLng; lng++) {
      // 计算网格中心点 - 使用相对于数据最小值的偏移
      const centerLng = minLng + (lng - minGridLng) * gridParams.value.lngSizeDegrees + gridParams.value.lngSizeDegrees / 2;
      const centerLat = minLat + (lat - minGridLat) * gridParams.value.latSizeDegrees + gridParams.value.latSizeDegrees / 2;
      
      // 创建网格
      const gridPolygon = new AMap.value.Polygon({
        path: [
          [centerLng - gridParams.value.lngSizeDegrees/2, centerLat - gridParams.value.latSizeDegrees/2],
          [centerLng + gridParams.value.lngSizeDegrees/2, centerLat - gridParams.value.latSizeDegrees/2],
          [centerLng + gridParams.value.lngSizeDegrees/2, centerLat + gridParams.value.latSizeDegrees/2],
          [centerLng - gridParams.value.lngSizeDegrees/2, centerLat + gridParams.value.latSizeDegrees/2]
        ],
        fillColor: '#00ff00',
        fillOpacity: 0.3,
        strokeColor: '#fff',
        strokeWeight: 1,
        strokeOpacity: 0.8
      });
      
      // 添加标签
      const label = new AMap.value.Text({
        text: `${lng}_${lat}`,
        position: [centerLng, centerLat],
        style: {
          color: '#000',
          fontSize: '10px',
          fontWeight: 'bold',
          textAlign: 'center'
        }
      });
      
      map.value.add(gridPolygon);
      map.value.add(label);
      
      const gridData = {
        key: `${lng}_${lat}`,
        polygon: gridPolygon,
        label: label,
        gridLng: lng,
        gridLat: lat,
        centerLng: centerLng,
        centerLat: centerLat
      };
      
      generatedGrids.value.push(gridData);
      gridCount++;
    }
  }
  
  console.log(`总共生成了 ${gridCount} 个网格`);
  
  // 分析每行的网格数量
  const rowCounts = new Map();
  generatedGrids.value.forEach(grid => {
    const lat = grid.gridLat;
    rowCounts.set(lat, (rowCounts.get(lat) || 0) + 1);
  });
  
  console.log('每行网格数量:');
  const sortedRows = Array.from(rowCounts.entries()).sort((a, b) => a[0] - b[0]);
  sortedRows.forEach(([row, count]) => {
    console.log(`第${row}行: ${count}个网格`);
  });
  
  // 验证网格位置
  console.log('网格位置验证:');
  const firstRowGrids = generatedGrids.value.filter(grid => grid.gridLat === minGridLat);
  const secondRowGrids = generatedGrids.value.filter(grid => grid.gridLat === minGridLat + 1);
  const thirdRowGrids = generatedGrids.value.filter(grid => grid.gridLat === minGridLat + 2);
  
  console.log(`第1行网格位置: ${firstRowGrids.map(g => g.gridLng).sort((a, b) => a - b).join(', ')}`);
  console.log(`第2行网格位置: ${secondRowGrids.map(g => g.gridLng).sort((a, b) => a - b).join(', ')}`);
  console.log(`第3行网格位置: ${thirdRowGrids.map(g => g.gridLng).sort((a, b) => a - b).join(', ')}`);
  
  console.log('==================');
};

// 测试数据解析
const testDataParsing = async () => {
  console.log('=== 测试数据解析 ===');
  
  try {
    const data = await parseExcelData();
    console.log('解析到的数据数量:', data.length);
    
    if (data.length > 0) {
      console.log('前5条数据:');
      data.slice(0, 5).forEach((item, index) => {
        console.log(`数据${index + 1}:`, {
          time: item.time,
          lng: item.lng,
          lat: item.lat,
          pm25: item.pm25
        });
      });
      
      // 分析经纬度范围
      const lngs = data.map(d => d.lng);
      const lats = data.map(d => d.lat);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      
      console.log('经纬度范围:');
      console.log(`经度: ${minLng.toFixed(6)} ~ ${maxLng.toFixed(6)} (差值: ${(maxLng - minLng).toFixed(6)})`);
      console.log(`纬度: ${minLat.toFixed(6)} ~ ${maxLat.toFixed(6)} (差值: ${(maxLat - minLat).toFixed(6)})`);
      
      // 计算50米对应的经纬度
      const latRad = (31 * Math.PI) / 180;
      const lngSizeDegrees = 50 / (111000 * Math.cos(latRad));
      const latSizeDegrees = 50 / 111000;
      
      console.log('50米对应的经纬度:');
      console.log(`经度: ${lngSizeDegrees.toFixed(8)} 度`);
      console.log(`纬度: ${latSizeDegrees.toFixed(8)} 度`);
      
      // 计算理论网格数量
      const gridCols = Math.ceil((maxLng - minLng) / lngSizeDegrees);
      const gridRows = Math.ceil((maxLat - minLat) / latSizeDegrees);
      const totalGrids = gridCols * gridRows;
      
      console.log(`理论网格数量: ${gridCols} 列 x ${gridRows} 行 = ${totalGrids} 个`);
      console.log(`目标网格数量: 238 个`);
      console.log(`差异: ${totalGrids - 238} 个`);
    }
  } catch (error) {
    console.error('数据解析失败:', error);
  }
  
  console.log('==================');
};

// 基于数据点生成网格
const generateGridsFromData = async () => {
  console.log('=== 基于数据点生成网格 ===');
  
  if (!flightPath.value.length) {
    await parseFlightData();
  }
  
  if (!flightPath.value.length) {
    console.error('没有飞行数据');
    return;
  }
  
  // 清除现有网格
  generatedGrids.value.forEach(grid => {
    map.value.remove(grid.polygon);
    map.value.remove(grid.label);
  });
  generatedGrids.value = [];
  
  // 获取数据范围
  const lngs = flightPath.value.map(d => d.lng);
  const lats = flightPath.value.map(d => d.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  
  const lngRange = maxLng - minLng;
  const latRange = maxLat - minLat;
  
  console.log(`数据范围: 经度 ${minLng.toFixed(6)} ~ ${maxLng.toFixed(6)} (差值: ${lngRange.toFixed(6)})`);
  console.log(`数据范围: 纬度 ${minLat.toFixed(6)} ~ ${maxLat.toFixed(6)} (差值: ${latRange.toFixed(6)})`);
  
  // 强制生成238个网格
  const targetGrids = 238;
  
  // 直接使用14列×17行=238个网格
  const bestCols = 14;
  const bestRows = 17;
  
  // 计算网格大小
  const gridSizeLng = lngRange / bestCols;
  const gridSizeLat = latRange / bestRows;
  
  console.log(`强制网格配置: ${bestCols} 列 x ${bestRows} 行 = ${bestCols * bestRows} 个`);
  console.log(`网格大小: 经度 ${gridSizeLng.toFixed(8)} 度, 纬度 ${gridSizeLat.toFixed(8)} 度`);
  console.log(`与目标238的差异: ${bestCols * bestRows - targetGrids} 个`);
  
  // 生成精确的238个网格
  let gridCount = 0;
  
  for (let row = 0; row < bestRows; row++) {
    for (let col = 0; col < bestCols; col++) {
      // 计算网格中心点
      const centerLng = minLng + col * gridSizeLng + gridSizeLng / 2;
      const centerLat = minLat + row * gridSizeLat + gridSizeLat / 2;
      
      // 检查这个网格内是否有数据点
      const hasData = flightPath.value.some(point => {
        const pointCol = Math.floor((point.lng - minLng) / gridSizeLng);
        const pointRow = Math.floor((point.lat - minLat) / gridSizeLat);
        return pointCol === col && pointRow === row;
      });
      
      if (hasData) {
        // 使用mapV创建网格数据
        const gridData = {
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [centerLng - gridSizeLng/2, centerLat - gridSizeLat/2],
              [centerLng + gridSizeLng/2, centerLat - gridSizeLat/2],
              [centerLng + gridSizeLng/2, centerLat + gridSizeLat/2],
              [centerLng - gridSizeLng/2, centerLat + gridSizeLat/2],
              [centerLng - gridSizeLng/2, centerLat - gridSizeLat/2]
            ]]
          },
          properties: {
            id: `${col}_${row}`,
            col: col,
            row: row,
            centerLng: centerLng,
            centerLat: centerLat,
            color: '#00ff00',
            opacity: 0.3
          }
        };
        
        generatedGrids.value.push(gridData);
        gridCount++;
      }
    }
  }
  
  console.log(`基于数据点生成了 ${gridCount} 个网格`);
  
  // 使用mapV显示网格
  if (generatedGrids.value.length > 0) {
    // 创建mapV数据源
    const dataSet = new mapv.DataSet(generatedGrids.value);
    
    // 创建mapV图层
    const mapvLayer = new mapv.baiduMapLayer(map.value, dataSet, {
      fillColor: function(data) {
        return data.properties.color;
      },
      fillOpacity: function(data) {
        return data.properties.opacity;
      },
      strokeColor: '#fff',
      strokeWidth: 1,
      strokeOpacity: 0.8,
      zIndex: 100
    });
    
    // 存储图层引用
    generatedGrids.value.mapvLayer = mapvLayer;
  }
  
  // 分析每行的网格数量
  const rowCounts = new Map();
  generatedGrids.value.forEach(grid => {
    const lat = grid.properties.row;
    rowCounts.set(lat, (rowCounts.get(lat) || 0) + 1);
  });
  
  console.log('每行网格数量:');
  const sortedRows = Array.from(rowCounts.entries()).sort((a, b) => a[0] - b[0]);
  sortedRows.forEach(([row, count]) => {
    console.log(`第${row}行: ${count}个网格`);
  });
  
  console.log('==================');
};

// 初始化地图
const initMap = async () => {
  try {
    AMap.value = await AMapLoader.load({
      key: '96f993daa939cb5c3b365ee355936f77',
      plugins: [
        "AMap.ControlBar", 
        "AMap.Scale", 
        "AMap.ToolBar"
      ], 
    });

    await nextTick();

    map.value = new AMap.value.Map("mapContainer", {
      resizeEnable: true,
      center: [120.413, 31.347], // 根据数据调整中心点
      zoom: 16,
      features: ['bg', 'road', 'point'],
      scrollWheel: true,
      doubleClickZoom: true,
      keyboardEnable: true,
      dragEnable: true,
      zoomEnable: true
    });
    
    // 添加地图控件
    map.value.addControl(new AMap.value.Scale());
    map.value.addControl(new AMap.value.ToolBar({
      position: 'RB',
      showControl: true
    }));

    // 预加载飞行数据
    parseFlightData().catch(error => {
      console.error('预加载Excel数据失败:', error);
    });

  } catch (error) {
    console.error('地图初始化失败:', error);
  }
};

// 组件挂载时初始化地图
onMounted(() => {
  initMap();
});

// 组件卸载时清理资源
onUnmounted(() => {
  resetAnimation();
  if (map.value) {
    map.value.destroy();
    map.value = null;
  }
});
</script>

<style scoped lang="scss">
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.map-wrapper {
  width: 100%;
  height: 100%;
}

.control-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 300px;
}

.control-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
    
    &:hover:not(:disabled) {
      background: #0056b3;
    }
    
    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  }
  
  input[type="range"] {
    width: 100px;
  }
  
  span {
    font-size: 14px;
    color: #333;
    min-width: 80px;
  }
  
  label {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .control-panel {
    top: 10px;
    left: 10px;
    right: 10px;
    min-width: auto;
  }
  
  .control-item {
    flex-wrap: wrap;
  }
}
</style>