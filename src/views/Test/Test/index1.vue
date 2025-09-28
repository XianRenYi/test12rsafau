<template>
  <div class="info">
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="实时数据" name="first" >
        <el-card style="max-width: 480px;margin-bottom: 15px;">
          <div ref="tempChartRef" style="width: 100%; height: 200px;"></div>
        </el-card>

  
        <el-card style="max-width: 480px;margin-bottom: 15px;">
          <div ref="humidityChartRef" style="width: 100%; height: 200px;"></div>
        </el-card>

        <el-card style="max-width: 480px;margin-bottom: 15px;">
          <div ref="pm1ChartRef" style="width: 100%; height: 200px;"></div>
        </el-card>
        <el-card style="max-width: 480px;margin-bottom: 15px;">
          <div ref="pm25ChartRef" style="width: 100%; height: 200px;"></div>
        </el-card>
        <el-card style="max-width: 480px;margin-bottom: 15px;">
          <div ref="pm10ChartRef" style="width: 100%; height: 200px;"></div>
        </el-card>


      </el-tab-pane>
      <el-tab-pane label="加载" name="second">

       <!-- 当前加载的任务列表 -->
       <div class="task-list">
        
        <el-card style="max-width: 480px">
          <template #header>
            <div class="card-header">
              <span>当前加载的任务列表</span>
            </div>
          </template>
          <!-- <el-checkbox-group v-model="selectedTasks">
            <el-checkbox v-for="task in tasks" :key="task.id" :label="task.name">{{ task.name }}</el-checkbox>
          </el-checkbox-group> -->
     
          <el-table
          ref="multipleTableRef"
          :data="tableData"
          row-key="id"
          style="width: 100%" height="250"
          @selection-change="handleSelectionChange" 
        >
          <el-table-column type="selection" :selectable="selectable" width="55" />
          <el-table-column label="时间" width="120">
            <template #default="scope">{{ scope.row.date }}</template>
          </el-table-column>
      
          <el-table-column property="address" label="文件名称" />
        </el-table>

        <el-button type="primary" style="margin-top: 20px; width:100%">载入本地任务文件</el-button>
        </el-card>


        <el-card style="margin-top: 10px;">
          <template #header>
            <div class="card-header">
              <span>数据时间范围</span>
            </div>
          </template>

          <div class="mb-4">
            <el-button type="primary" style="margin-top: 20px; width:120px;">所有</el-button>
        <el-button type="primary" style="margin-top: 20px; width:120px; ">0.5小时内</el-button>
        <el-button type="primary" style="margin-top: 20px; width:120px;">1小时内</el-button>
          </div>
          <div class="mb-4">
            
        <el-button type="primary" style="margin-top: 20px; width:120px;">2小时内</el-button>
        <el-button type="primary" style="margin-top: 20px; width:120px;">6小时内</el-button>
        <el-button type="primary" style="margin-top: 20px; width:120px;">24小时内</el-button>
      
          </div>
      
    
        </el-card>

      </div>

    
     

    
       
      
     

      </el-tab-pane>
      <el-tab-pane label="可视化" name="third">


        <div class="task-list">
          <div class="content-wrapper">
          <div class="color-reference">
          <div class="gradient-bar">
          <div class="gradient"></div>
          </div>
          <div class="scale-marks">
          <span>0.00</span>
          <span>100.00</span>
          </div>
          <h2>调整颜色参考</h2>
          <p>在左侧的可视化界面中，颜色越红代表浓度越高，颜色越绿代表浓度越低。可在此设置颜色与浓度之间的对应关系。</p>
          </div>
          <div class="settings-container">
          <div class="setting-item">
          <div class="setting-header">
          <h3>网格大小</h3>
          <span>{{ gridSize }}</span>
          </div>
          <div class="grid-size-buttons">
          <button v-for="size in gridSizes"
          :key="size"
          @click="setGridSize(size)"
          :class="['button', gridSize === size ? 'active' : '']">
          {{ size }}
          </button>
          </div>
          <div class="checkbox-container">
          <el-checkbox v-model="useAverageValue">网格平均浓度值</el-checkbox>
          <p>通过上面的按钮与滑块调整网格的大小。网格越小，全图分辨率越高，但扫描区域所需要的路程越短。</p>
          </div>
          </div>
          <div class="setting-item">
          <h3>追踪模式</h3>
          <div class="tracking-buttons">
          <button v-for="mode in trackingModes"
          :key="mode"
          @click="setTrackingMode(mode)"
          :class="['button', trackingMode === mode ? 'active' : '']">
          {{ mode }}
          </button>
          </div>
          <p>在"置中"模式下，设备位置会保持在地图视角的中心。在"跟随"模式下，设备位置会处于地图视角内。在"手动"模式下，您可以自由拖动地图视角。</p>
          </div>
          <div class="setting-item">
          <h3>地图源</h3>
          <div class="map-source-buttons">
          <button v-for="source in mapSources"
          :key="source"
          @click="setMapSource(source)"
          :class="['button', mapSource === source ? 'active' : '']">
          {{ source }}
          </button>
          </div>
          <p>根据不同的应用场景，选择最适合的地图来源。中国境内推荐使用高德地图，境外推荐使用MapBox地图。</p>
          </div>
          <div class="setting-item">
          <h3>颜色模式</h3>
          <div class="color-mode-buttons">
          <button v-for="mode in colorModes"
          :key="mode"
          @click="setColorMode(mode)"
          :class="['button', colorMode === mode ? 'active' : '']">
          {{ mode }}
          </button>
          </div>
          <p>选择左侧可视化界面的着色方式，包括线性颜色区间（可手动定义）、中国AQI标准、美国AQI标准。</p>
          </div>
          <div class="setting-item">
          <div class="setting-header">
          <h3>不透明度</h3>
          <span>{{ opacity }}%</span>
          </div>
          <el-slider v-model="opacity" :min="0" :max="100" :step="0.1" />
          <p>选择左侧污染物分布热力图的不透明度。选择的不透明度越高，热力图越明显，但下方的地图图层越不可见。</p>
          </div>
          <div class="setting-item">
          <h3>高度区间 Beta</h3>
          <el-slider v-model="heightRange" range :min="-100" :max="100" />
          <p>只显示某个相对高度区间内的数据。</p>
          </div>
          </div>
          </div>
          </div>

      </el-tab-pane>
      <el-tab-pane label="输出" name="fourth">
        <el-card style="max-width: 450px">
      
          <div class="mb-4">
            <el-form-item label="项目名称">
              <el-input />
            </el-form-item>
            <el-form-item label="监测单位">
              <el-input />
            </el-form-item>
         
         
        </div>
    
        <div class="mb-4">
          <el-button type="primary" style="margin-top: 20px; width:100%">生成任务报告</el-button>
        
        </div>

        <div class="mb-4">
          <el-button type="primary" style="margin-top: 20px; width:100%">导出数据表格(CSV)</el-button>
        
      
        <el-form-item label="时间分辨率">
          <el-radio-group v-model="radio">
            <el-radio :value="3">秒</el-radio>
            <el-radio :value="6">分</el-radio>
            <el-radio :value="9">时</el-radio>
          </el-radio-group>
        </el-form-item>
        </div>
         
     
        <div class="mb-4">
       
          将当前载入并勾选的任务数据输出为任务报告或数据表格(Csv格式)。上方输入的“项目名称”与”监测单位”会自动出现在任务报告和数据表格的页头。注:在生成任务报告前，请将左侧的地图视角缩放至合适的大小与位置，并选好合适的颜色与浓度对应区间。
    
        </div>
          

            <div class="mb-4">
              <el-button type="primary" style="margin-top: 20px; width:100%">导出图片</el-button>
            </div>
            <div class="mb-4">
              <el-button type="primary" style="margin-top: 20px; width:100%">将网格/等值线导出为GeoTiff</el-button>
            </div>

      
      </el-card>

      </el-tab-pane>
      <el-tab-pane label="更多" name="fifth">
      
        <el-card style="max-width: 480px">
          <template #header>
            <div class="card-header">
              <span>更多</span>
            </div>
          </template>
      

       </el-card>

      </el-tab-pane>
    </el-tabs>
  </div>




  <div :id="withKeyId" class="container"></div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import "leaflet/dist/leaflet.css";


import * as mapv from "mapv";

import * as echarts from 'echarts';
import {  ElSlider, ElCheckbox,ElCard } from 'element-plus';
import 'element-plus/dist/index.css';

const activeName = ref('first')
const tempChartRef = ref(null);
const humidityChartRef = ref(null);
const pm1ChartRef = ref(null);
const pm25ChartRef = ref(null);
const pm10ChartRef = ref(null);
const multipleSelection = ref([]);
const multipleTableRef = ref(null);
const tableData =  [
  {
    id: 1,
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    id: 2,
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    id: 3,
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    id: 4,
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    id: 5,
    date: '2016-05-08',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    id: 6,
    date: '2016-05-06',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    id: 7,
    date: '2016-05-07',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]
const tasks = [
  {
    id: 1,
    name: 'Mini2 租赁13号-1952504f-20241011-0...',
    points: [
      { id: 1, lat: 31.279101, lng: 120.526248 },
      // 其他点数据...
    ]
  },
  // 其他任务...
];


//可视化 start

  const gridSize = ref('小');
  const gridSizes = ['自定', '小', '中', '大'];
  const useAverageValue = ref(true);
  const trackingMode = ref('置中');
  const trackingModes = ['置中', '跟随', '手动'];
  const mapSource = ref('MapBox街道');
  const mapSources = ['高德卫星', '高德街道', 'MapBox卫星', 'MapBox街道'];
  const colorMode = ref('线性');
  const colorModes = ['线性', '美国AQI', '中国AQI'];
  const opacity = ref(49.4);
  const heightRange = ref([0, 100]);
  const setGridSize = (size) => {
  gridSize.value = size;
  };
  const setTrackingMode = (mode) => {
  trackingMode.value = mode;
  };
  const setMapSource = (source) => {
  mapSource.value = source;
  };
  const setColorMode = (mode) => {
  colorMode.value = mode;
  };

//可视化 end





const L =  require("null").L;
let map;

const withKeyId = computed(() => `ssss`);

onMounted(() => {
  initMars3d();

  initCharts();

});

onBeforeUnmount(() => {
  if (map) {
    map.destroy();
    map = null;
  }
  console.log("map销毁完成", map);

  if (tempChartRef.value) {
    echarts.dispose(tempChartRef.value);
  }
  if (humidityChartRef.value) {
    echarts.dispose(humidityChartRef.value);
  }
  if (pm1ChartRef.value) {
    echarts.dispose(pm1ChartRef.value);
  }
  if (pm25ChartRef.value) {
    echarts.dispose(pm25ChartRef.value);
  }
  if (pm10ChartRef.value) {
    echarts.dispose(pm10ChartRef.value);
  }
});

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
const handleClick = (tab, event) => {
  console.log(tab, event);
};

const initCharts = () => {
  // 温度折线图
  const tempChart = echarts.init(tempChartRef.value);
  const tempOption = {
    title: {
      text: '温度',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '01:00', '02:00', '03:00', '04:00'],
    },
    yAxis: {
      type: 'value',
    },
    visualMap: { // 添加渐变效果
      show: false,
      type: 'continuous',
      seriesIndex: 0,
      min: 10,
      max: 30,
      inRange: {
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
      }
    },
    series: [
      {
        name: '温度',
        type: 'line',
        data: [22, 24, 19, 23, 25],
        itemStyle: {
          color: '#5470c6',
        },
      },
    ],
  };
  tempChart.setOption(tempOption);

  // 湿度折线图
  const humidityChart = echarts.init(humidityChartRef.value);
  const humidityOption = {
    title: {
      text: '湿度',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '01:00', '02:00', '03:00', '04:00'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '湿度',
        type: 'line',
        data: [45, 50, 55, 60, 65],
        itemStyle: {
          color: '#91cc75',
        },
      },
    ],
  };
  humidityChart.setOption(humidityOption);

  // PM1.0 折线图
  const pm1Chart = echarts.init(pm1ChartRef.value);
  const pm1Option = {
    title: {
      text: 'PM1.0',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '01:00', '02:00', '03:00', '04:00'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'PM1.0',
        type: 'line',
        data: [10, 15, 20, 25, 30],
        itemStyle: {
          color: '#fac858',
        },
      },
    ],
  };
  pm1Chart.setOption(pm1Option);

  // PM2.5 折线图
  const pm25Chart = echarts.init(pm25ChartRef.value);
  const pm25Option = {
    title: {
      text: 'PM2.5',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '01:00', '02:00', '03:00', '04:00'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'PM2.5',
        type: 'line',
        data: [20, 25, 30, 35, 40],
        itemStyle: {
          color: '#ee6666',
        },
      },
    ],
  };
  pm25Chart.setOption(pm25Option);

  // PM10 折线图
  const pm10Chart = echarts.init(pm10ChartRef.value);
  const pm10Option = {
    title: {
      text: 'PM10',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '01:00', '02:00', '03:00', '04:00'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'PM10',
        type: 'line',
        data: [30, 35, 40, 45, 50],
        itemStyle: {
          color: '#73c0de',
        },
      },
    ],
  };
  pm10Chart.setOption(pm10Option);
}

const initMars3d = () => {
  map = new container.Map(withKeyId.value, {
    zoom: 17,
    center: { lng: 120.526248, lat: 31.279101 },
    minZoom: 3,
    maxZoom: 18,
    control: {
      scale: true,
      locationBar: {
        crs: "CGCS2000_GK_Zone_3",
        template:
          "<div>经度:{lng}</div> <div>纬度:{lat}</div> <div>横{crsx}  纵{crsy}</div> <div>层级:{level}</div>",
      },
      zoom: false,
      toolBar: false,
      layers: false,
      attributionControl:false,
    },
    basemaps: [
    
  
    {
      id: 2017,
      pid: 10,
      name: "蓝色地图",
      type: "gaode",
      layer: "vec",
      customColor: "#11243C",
      chinaCRS: "GCJ02"
    },
    {
      pid: 10,
      name: "百度地图",
      type: "baidu",
      layer: "vec",
      crs: "baidu",
   
    },
    {
      pid: 10,
      name: "百度卫星",
      type: "baidu",
      layer: "img",
      crs: "baidu",
    },
    {
      type: "group",
      name: "天地图电子",
      layers: [
        { type: "tdt", layer: "vec_d", key: container.Token.tiandituArr },
        { type: "tdt", layer: "vec_z", key: container.Token.tiandituArr }
      ],
   
    },
    {
      type: "group",
      name: "天地图影像",
      layers: [
        { type: "tdt", layer: "img_d", key: container.Token.tiandituArr },
        { type: "tdt", layer: "img_z", key: container.Token.tiandituArr }
      ],
    
    },
      {
        name: "高德卫星",
        type: "group",
        layers: [
          { name: "底图", type: "gaode", layer: "img_d" },
          { name: "注记", type: "gaode", layer: "img_z" },
        ],
      },
      { name: "高德地图", type: "gaode", layer: "vec", show: true },
      
    ],
    operationallayers: [{ name: "经纬网", type: "graticule" }],
  });


  //showMapVLayer();
  
 //showMapVLayer();
  
 //showMapVLayer();
};


function showMapVLayer() {
  // 构造数据
  const latlngs = []
  const data = []
  let randomCount = 2
  while (randomCount--) {
    const point = randomLatLng() // js/randomLatLng.js
    latlngs.push(point)

    data.push({
      geometry: { type: "Point", coordinates: [point.lng, point.lat] },
      count: 30 * Math.random()
    })
  }
  map.fitBounds(latlngs)

  const dataSet =  new mapv.DataSet(data)
  const options = {
    fillStyle: "rgba(55, 50, 250, 0.8)",
    shadowColor: "rgba(255, 250, 50, 1)",
    shadowBlur: 20,
    size: 40,
    globalAlpha: 0.5,
    label: {
      show: true,
      fillStyle: "white"
      // shadowColor: 'yellow',
      // font: '20px Arial',
      // shadowBlur: 10,
    },
    gradient: { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)" },
    draw: "grid"
  }

  // 创建MapV图层
  const mapVLayer = new container.layer.MapVLayer(options, dataSet)
  map.addLayer(mapVLayer)
}

// 未赋值时，使用中国区域内随机点
const chinaPoly = [
  [
    [114.02709960937501, 22.59372606392931],
    [113.59313964843751, 23.03929774776974],
    [113.48327636718751, 22.253512814974744],
    [110.24230957031251, 21.401933838235188],
    [107.88574218750001, 22.522705703482472],
    [105.27099609375, 23.664650731631625],
    [104.0625, 22.998851594142923],
    [99.93164062500001, 22.471954507739227],
    [98.85498046875001, 25.025884063244828],
    [99.84375, 29.065772888415406],
    [92.57080078125001, 28.65203063036226],
    [85.53955078125001, 29.219302076779456],
    [80.61767578125001, 31.690781806136822],
    [79.69482421875, 34.903952965590065],
    [75.49804687500001, 37.26530995561875],
    [74.95971679687501, 39.45316112807394],
    [81.82617187500001, 42.74701217318067],
    [81.5185546875, 44.25306865928177],
    [84.04541015625001, 46.042735653846506],
    [87.72583007812501, 48.026672195436014],
    [90.5712890625, 45.10454630976873],
    [96.45996093750001, 42.32606244456202],
    [105.71044921875001, 41.19518982948959],
    [112.0166015625, 42.84375132629023],
    [117.02636718750001, 45.73685954736049],
    [120.60791015625, 46.55886030311719],
    [117.83935546875001, 48.922499263758255],
    [122.65136718750001, 53.10721669189343],
    [127.13378906250001, 49.53946900793534],
    [130.97900390625003, 47.368594345213374],
    [134.45068359375003, 48.019324184801185],
    [131.11083984375003, 45.521743896993634],
    [130.51757812500003, 43.197167282501276],
    [126.46362304687501, 41.89409955811395],
    [121.94824218750001, 39.26628442213066],
    [122.54150390625001, 40.55554790286314],
    [121.70654296875001, 41.19518982948959],
    [119.46533203125001, 39.985538414809746],
    [118.64135742187501, 39.206718844918505],
    [117.52075195312501, 39.342794408952386],
    [117.43286132812501, 38.41055825094609],
    [118.56445312500001, 37.59682400108367],
    [119.080810546875, 36.96744946416934],
    [120.81665039062501, 37.326488613342086],
    [122.40966796875001, 37.22158045838649],
    [120.05859375000001, 36.35052700542766],
    [118.88305664062501, 35.10193405724608],
    [120.47607421875001, 33.422272258866045],
    [120.66284179687501, 31.784216884487385],
    [121.81640625000001, 30.996445897426373],
    [120.36621093750001, 30.477082932837682],
    [121.28906250000001, 29.19053283229458],
    [120.30029296875001, 27.31321389856826],
    [119.102783203125, 26.52956523826758],
    [118.45458984375001, 24.9163314045991],
    [116.71875000000001, 23.805449612314625],
    [115.04882812500001, 22.84707068783908],
    [114.02709960937501, 22.59372606392931]
  ]
];

let featureChina;

function randomLatLng(polygon) {
  if (polygon == null) {
    if (!featureChina) {
      featureChina = L.geoJSON({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: chinaPoly }
      }).getLayers()[0]
    }
    polygon = featureChina
  }

  const bounds = polygon.getBounds()
  const southwest = bounds.getSouthWest()
  const northeast = bounds.getNorthEast()

  const jd = random(southwest.lng * 1000000, northeast.lng * 1000000) / 1000000
  const wd = random(southwest.lat * 1000000, northeast.lat * 1000000) / 1000000

  try {
    const pt = window.turf.point([jd, wd])
    const isInside = window.turf.inside(pt, polygon.toGeoJSON())
    if (!isInside) {
      return randomLatLng(polygon)
    }
  } catch (e) {
    //
  }
  return L.latLng(wd, jd)
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 组件销毁时移除事件监听（防止内存泄漏）
onUnmounted(() => {
  document.removeEventListener("initCharts", initCharts);
  document.removeEventListener("initMars3d", initMars3d);
 
});
</script>


<style scoped lang="less">

.container {
  height: 95vh;
  width: 100vw;
}
.info {
  z-index: 9999999;
  //padding: .75rem 1.25rem;
  margin-bottom: 1rem;
  border-radius: .6rem;
  position: fixed;
  top: 4rem;
  background-color: white;
  width: auto;
  min-width: 30rem;
  border-width: 0;
  right: 1rem;
  box-shadow: 0 2px 6px 0 rgba(114, 124, 245, .5);
  height: 92vh; /* 设置固定高度 */

}
.info-title {
  font-weight: bolder;
  color: #fff;
  font-size: 14px;
  line-height: 26px;
  padding: 0 0 0 6px;
  background: #25A5F7
}
.info-content {
  padding: 4px;
  color: #666666;
  line-height: 23px;
  font: 12px Helvetica, 'Hiragino Sans GB', 'Microsoft Yahei', '微软雅黑', Arial;
}
.info-content img {
  float: left;
  margin: 3px;
}
.amap-info-combo .keyword-input {
  height: auto;
}
.input-item-text, input[type=text], input[type=date], select {
  height: calc(2.2rem + 2px);
}

.input-item-text {
  width: 6rem;
  text-align: justify;
  padding: 0.4rem 0.7rem;
  display: inline-block;
  text-justify: distribute-all-lines;
  /*ie6-8*/
  text-align-last: justify;
  /* ie9*/
  -moz-text-align-last: justify;
  /*ff*/
  -webkit-text-align-last: justify;
  /*chrome 20+*/
  -ms-flex-align: center;
  align-items: center;
  margin-bottom: 0;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  text-align: center;
  white-space: nowrap;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}

.input-item-text input[type=checkbox], .input-item-text input[type=radio] {
  margin-top: 0
}

.data-item {
  text-align: center;
  margin-bottom: 1rem;
}

.note {
  text-align: center;
  color: #999;
}


.el-tabs ::v-deep {
  height: calc(100vh - 140px);
  // el-tabs增加竖向滚动条
  .el-tabs__nav-scroll{
    height: 100%;
    overflow-y: auto;overflow-x: inherit;
  }
  // 超出时上下箭头 去掉
   .el-tabs__nav-wrap.is-left.is-scrollable{
    padding: 0;
   }
   .el-tabs__nav-prev,.el-tabs__nav-next{
    display: none;
   }
  .el-tabs__content{
    height: 100%;overflow-y: auto;
  }
  .el-tabs__content{
    height:100%;
  }
}


.task-list,
.data-time-range,
.photo-list,
.orthophoto {
  margin-bottom: 1rem;
}

.el-image {
  width: 100px;
  height: 100px;
  margin-right: 1rem;
  margin-bottom: 1rem;
}



//可视化 start

  .content-wrapper {
  max-width: 450px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  }
  
  .color-reference {
  margin-bottom: 32px;
  }
  
  .gradient-bar {
  position: relative;
  height: 24px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  }
  
  .gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #4ade80, #facc15, #f87171);
  }
  
  .scale-marks {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #4b5563;
  }
  
  h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 16px 0 8px;
  }
  
  h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  }
  
  p {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
  }
  
  .setting-item {
  padding: 24px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
  }
  
  .setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  }
  
  .grid-size-buttons, .tracking-buttons, .map-source-buttons, .color-mode-buttons {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
  }
  
  .grid-size-buttons {
  grid-template-columns: repeat(4, 1fr);
  }
  
  .tracking-buttons, .color-mode-buttons {
  grid-template-columns: repeat(3, 1fr);
  }
  
  .map-source-buttons {
  grid-template-columns: repeat(2, 1fr);
  }
  
  .button {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  }
  
  .button.active {
  background-color: #3b82f6;
  color: white;
  }
  
  .checkbox-container {
  margin-top: 8px;
  }
  
  :deep(.el-slider__runway) {
  background-color: #e5e7eb;
  }
  
  :deep(.el-slider__bar) {
  background-color: #3b82f6;
  }
  
  :deep(.el-slider__button) {
  border-color: #3b82f6;
  }
  
  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #3b82f6;
  border-color: #3b82f6;
  }
  
  :deep(.el-checkbox__label) {
  color: #374151;
  }
  //可视化 end

</style>