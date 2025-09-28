<template>
  <div class="gas-map-container">
    <!-- 地图容器 -->
    <div id="map-container" class="map-container"></div>

    <!-- 信息面板 -->
    <div class="info-panel" v-if="activeGasData">
      <div class="info-row">
        <div class="info-item">
          <p class="info-label">{{ t("deviceNo") }}</p>
          <p class="info-value">{{ activeGasData.no || "--" }}</p>
        </div>
        <div class="info-item">
          <p class="info-label">{{ t("value") }}</p>
          <p class="info-value">
            {{
              activeGasData.value ? `${activeGasData.value}${activeGasData.unit}` : "--"
            }}
          </p>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <p class="info-label">{{ t("status") }}</p>
          <p class="info-value" :class="getStatusClass(activeGasData.status)">
            {{ getStatusText(activeGasData.status) }}
          </p>
        </div>
        <div class="info-item">
          <p class="info-label">{{ t("time") }}</p>
          <p class="info-value">{{ activeGasData.time || "--" }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 国际化文本
const t = (key) => {
  const i18n = {
    deviceNo: "设备编号",
    value: "数值",
    status: "状态",
    time: "时间",
    normal: "正常",
    high: "超标",
    low: "低",
  };
  return i18n[key] || key;
};

// 响应式数据
const selectedGasType = ref("CO"); // 默认选择一氧化碳
const gasData = ref({});
const activeGasData = ref(null);
const map = ref(null);
const object3Dlayer = ref(null);
const wallData = ref([]);
const lastHighlightedWall = ref(null);

// 生成模拟数据
const generateMockData = () => {
  const baseLng = 121.4737;
  const baseLat = 31.2304;

  const getRandomLocation = (index) => {
    const offset = (index - 5) * 0.001 + (Math.random() - 0.5) * 0.002;
    return [baseLng + offset, baseLat + offset * 0.8];
  };

  const gasTypes = {
    CO: { unit: "ppm", range: [0, 20] },
    SO2: { unit: "ppb", range: [0, 50] },
    NO2: { unit: "ppb", range: [0, 100] },
  };

  const mockData = {};
  Object.keys(gasTypes).forEach((gasType) => {
    const { unit, range } = gasTypes[gasType];
    mockData[gasType] = Array.from({ length: 10 }, (_, i) => {
      const value = +(range[0] + Math.random() * (range[1] - range[0])).toFixed(2);
      let status = "NORMAL";
      if (value < range[1] * 0.3) status = "LOW";
      else if (value > range[1] * 0.7) status = "HIGH";

      const time = new Date();
      time.setMinutes(time.getMinutes() - Math.floor(Math.random() * 60 * 24));
      return {
        id: `${gasType}-${i + 1}`,
        value,
        unit,
        status,
        location: getRandomLocation(i),
        time: time.toISOString().slice(0, 16).replace("T", " "),
      };
    });
  });
  return mockData;
};

// 初始化地图
const initMap = () => {
  // 关键修复：检查Object3DLayer是否存在
  if (!window.AMap.Object3DLayer) {
    console.error("Object3DLayer插件未加载，请检查API参数");
    alert("地图3D功能加载失败，请刷新页面重试");
    return;
  }

  // 创建地图实例
  map.value = new window.AMap.Map("map-container", {
    layers: [new window.AMap.TileLayer.Satellite(), new window.AMap.TileLayer.RoadNet()],
    resizeEnable: true,
    center: [121.4737, 31.2304],
    zoom: 16, // 提高缩放级别，更容易看到3D物体
    viewMode: "3D",
    pitch: 45, // 调整俯仰角
  });

  // 创建3D图层（修复核心：确保插件已加载）
  object3Dlayer.value = new window.AMap.Object3DLayer({ zIndex: 999 });
  map.value.add(object3Dlayer.value);

  // 添加控制栏
  map.value.addControl(
    new window.AMap.ControlBar({
      showZoomBar: true,
      showControlButton: true,
      position: { right: "10px", top: "10px" },
    })
  );

  // 绑定鼠标事件
  map.value.on("mousemove", handleMapMouseMove);

  // 渲染数据
  renderGasData();
};

// 加载高德地图API（关键修复：确保插件正确加载）
const loadAmapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap && window.AMap.Object3DLayer) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    // 1. 替换为自己的高德Key（必须步骤）
    const key = "5a2e4a9af3bad2091692a8028ba53210";
    // 2. 明确指定需要加载的插件，确保Object3DLayer被包含
    script.src = `https://webapi.amap.com/maps?v=1.4.15&key=5347d2541c1cb610089fe899b33e327a&plugin=AMap.AdvancedInfoWindow&plugin=AMap.CircleEditor&plugin=AMap.Geocoder&plugin=AMap.PolylineEditor&plugin=AMap.MassMarks&plugin=Map3D,AMap.DistrictSearch,AMap.ControlBar`;

    script.onerror = () => reject(new Error("高德地图API加载失败"));
    script.onload = () => {
      // 验证插件是否加载成功
      if (!window.AMap.Object3DLayer) {
        reject(new Error("Object3DLayer插件加载失败"));
      } else {
        resolve();
      }
    };
    document.head.appendChild(script);
  });
};

// 渲染气体数据
const renderGasData = () => {
  if (!map.value || !object3Dlayer.value || !selectedGasType.value) return;

  object3Dlayer.value.clear();
  wallData.value = [];

  const currentGasData = gasData.value[selectedGasType.value];
  if (!currentGasData) return;

  currentGasData.forEach((item, index) => {
    const wallHeight = item.value * 50 + 200; // 增加高度系数，更容易看到
    wallData.value[index] = {
      no: item.id,
      value: item.value,
      unit: item.unit,
      status: item.status,
      time: item.time,
    };

    let color;
    switch (item.status) {
      case "LOW":
        color = "rgba(0, 201, 50, 0.7)";
        break;
      case "HIGH":
        color = "rgba(237, 15, 15, 0.7)";
        break;
      default:
        color = "rgba(255, 251, 0, 0.7)";
    }

    // 创建墙体时使用更明显的路径偏移
    const wall = new window.AMap.Object3D.Wall({
      path: [
        [item.location[0], item.location[1]],
        [item.location[0] + 0.0002, item.location[1] + 0.0002], // 增大偏移量
      ],
      height: wallHeight,
      color: color,
      backOrFront: "both",
      transparent: false, // 暂时关闭透明，更容易看到
    });
    wall.id = index;
    object3Dlayer.value.add(wall);
  });
};

// 鼠标移动事件
const handleMapMouseMove = (event) => {
  if (!object3Dlayer.value) return;

  const pixel = event.pixel;
  const obj = map.value.getObject3DByContainerPos(
    new window.AMap.Pixel(pixel.x, pixel.y),
    [object3Dlayer.value],
    false
  );

  if (
    lastHighlightedWall.value &&
    (!obj || obj.object.id !== lastHighlightedWall.value.id)
  ) {
    highlightWall(lastHighlightedWall.value, false);
    lastHighlightedWall.value = null;
  }

  if (obj && obj.object && obj.object.id !== undefined) {
    activeGasData.value = wallData.value[obj.object.id];
    highlightWall(obj.object, true);
    lastHighlightedWall.value = obj.object;
  } else {
    activeGasData.value = null;
  }
};

// 高亮墙体
const highlightWall = (wall, isHighlight) => {
  const originalColor = wallData.value[wall.id].status;
  let targetColor;

  if (isHighlight) {
    targetColor = [0 / 255, 14 / 255, 255 / 255, 0.7];
  } else {
    switch (originalColor) {
      case "LOW":
        targetColor = [0 / 255, 201 / 255, 50 / 255, 0.7];
        break;
      case "HIGH":
        targetColor = [237 / 255, 15 / 255, 15 / 255, 0.7];
        break;
      default:
        targetColor = [255 / 255, 251 / 255, 0 / 255, 0.7];
    }
  }

  const vertexColors = wall.geometry.vertexColors;
  for (let i = 0; i < vertexColors.length; i += 4) {
    vertexColors.splice(
      i,
      4,
      targetColor[0],
      targetColor[1],
      targetColor[2],
      targetColor[3]
    );
  }
  wall.needUpdate = true;
  wall.reDraw();
};

// 状态处理
const getStatusText = (status) => {
  const statusMap = { LOW: "低", HIGH: "超标", NORMAL: "正常" };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const classMap = { LOW: "status-low", HIGH: "status-high", NORMAL: "status-normal" };
  return classMap[status] || "";
};

// 初始化
onMounted(async () => {
  gasData.value = generateMockData();
  try {
    await loadAmapScript();
    initMap();
  } catch (error) {
    console.error("地图初始化失败:", error);
    alert(`地图加载失败: ${error.message}`);
  }
});

onUnmounted(() => {
  if (map.value) map.value.destroy();
});
</script>

<style scoped>
.gas-map-container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

.info-panel {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: rgba(23, 133, 174, 0.9);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  color: white;
  min-width: 300px;
  z-index: 100;
}

.info-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  flex: 1;
}

.info-label {
  font-size: 0.9rem;
  margin: 0 0 5px 0;
  opacity: 0.8;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.status-high {
  color: #ff4444;
}
.status-normal {
  color: #ffff00;
}
.status-low {
  color: #00e676;
}
</style>
