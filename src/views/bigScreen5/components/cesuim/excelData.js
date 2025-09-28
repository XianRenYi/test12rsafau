// Excel数据解析 - 从1.xlsx读取无人机飞行数据
import * as XLSX from 'xlsx';

// Excel文件路径
const EXCEL_FILE_PATH = '/1.xlsx';

// 解析Excel数据的核心函数
export const parseExcelData = async () => {
  try {
    // 读取Excel文件
    const response = await fetch(EXCEL_FILE_PATH);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 将工作表转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Excel数据解析结果:', jsonData);
    
    // 处理数据
    const processedData = processExcelData(jsonData);
    return processedData;
    
  } catch (error) {
    console.error('Excel文件读取失败:', error);
    return [];
  }
};

// 处理Excel数据
const processExcelData = (jsonData) => {
  if (!jsonData || jsonData.length < 2) {
    console.warn('Excel数据为空或格式不正确');
    return [];
  }
  
  const data = [];
  const headers = jsonData[0]; // 第一行作为标题
  
  console.log('Excel标题行:', headers);
  
  // 智能列映射 - 根据标题自动识别列
  const columnMap = createColumnMap(headers);
  console.log('列映射:', columnMap);
  
  // 从第二行开始处理数据
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;
    
    // 根据列映射解析数据
    const dataPoint = {
      time: getColumnValue(row, columnMap.time) || '',
      height: parseFloat(getColumnValue(row, columnMap.height)) || 0,
      lng: parseFloat(getColumnValue(row, columnMap.lng)) || 0,
      lat: parseFloat(getColumnValue(row, columnMap.lat)) || 0,
      temperature: parseFloat(getColumnValue(row, columnMap.temperature)) || 0,
      humidity: parseFloat(getColumnValue(row, columnMap.humidity)) || 0,
      pressure: parseFloat(getColumnValue(row, columnMap.pressure)) || 0,
      vocs: parseFloat(getColumnValue(row, columnMap.vocs)) || 0,
      so2: parseFloat(getColumnValue(row, columnMap.so2)) || 0,
      co: parseFloat(getColumnValue(row, columnMap.co)) || 0,
      no2: parseFloat(getColumnValue(row, columnMap.no2)) || 0,
      o3no2: parseFloat(getColumnValue(row, columnMap.o3no2)) || 0,
      pm1: parseFloat(getColumnValue(row, columnMap.pm1)) || 0,
      pm25: parseFloat(getColumnValue(row, columnMap.pm25)) || 0,
      pm10: parseFloat(getColumnValue(row, columnMap.pm10)) || 0,
      deviceId: getColumnValue(row, columnMap.deviceId) || '',
      windNorth: parseFloat(getColumnValue(row, columnMap.windNorth)) || 0,
      windEast: parseFloat(getColumnValue(row, columnMap.windEast)) || 0,
      windSpeed: parseFloat(getColumnValue(row, columnMap.windSpeed)) || 0,
      windDirection: parseFloat(getColumnValue(row, columnMap.windDirection)) || 0
    };
    
    data.push(dataPoint);
  }
  
  console.log(`成功解析${data.length}条Excel数据`);
  return data;
};

// 创建列映射
const createColumnMap = (headers) => {
  const map = {};
  
  headers.forEach((header, index) => {
    if (!header) return;
    
    const headerStr = header.toString().toLowerCase();
    
    // 时间相关
    if (headerStr.includes('时间') || headerStr.includes('time') || headerStr.includes('采样') || headerStr.includes('getalertlogfirst')) {
      map.time = index;
    }
    // 高度相关
    else if (headerStr.includes('高度') || headerStr.includes('height') || headerStr.includes('相对高度')) {
      map.height = index;
    }
    // 经纬度相关
    else if (headerStr.includes('经度') || headerStr.includes('lng') || headerStr.includes('longitude')) {
      map.lng = index;
    }
    else if (headerStr.includes('纬度') || headerStr.includes('lat') || headerStr.includes('latitude')) {
      map.lat = index;
    }
    // 环境参数
    else if (headerStr.includes('温度') || headerStr.includes('temperature') || headerStr.includes('℃')) {
      map.temperature = index;
    }
    else if (headerStr.includes('湿度') || headerStr.includes('humidity') || headerStr.includes('%')) {
      map.humidity = index;
    }
    else if (headerStr.includes('气压') || headerStr.includes('pressure') || headerStr.includes('hpa')) {
      map.pressure = index;
    }
    // 污染物
    else if (headerStr.includes('vocs') || headerStr.includes('ppm')) {
      map.vocs = index;
    }
    else if (headerStr.includes('so2')) {
      map.so2 = index;
    }
    else if (headerStr.includes('co') && !headerStr.includes('no2')) {
      map.co = index;
    }
    else if (headerStr.includes('no2')) {
      map.no2 = index;
    }
    else if (headerStr.includes('o3') || headerStr.includes('no2')) {
      map.o3no2 = index;
    }
    else if (headerStr.includes('pm1') || headerStr.includes('pm1.0')) {
      map.pm1 = index;
    }
    else if (headerStr.includes('pm2.5') || headerStr.includes('pm25')) {
      map.pm25 = index;
    }
    else if (headerStr.includes('pm10')) {
      map.pm10 = index;
    }
    // 设备信息
    else if (headerStr.includes('设备') || headerStr.includes('device') || headerStr.includes('序列号')) {
      map.deviceId = index;
    }
    // 风速风向
    else if (headerStr.includes('wind') && headerStr.includes('north')) {
      map.windNorth = index;
    }
    else if (headerStr.includes('wind') && headerStr.includes('east')) {
      map.windEast = index;
    }
    else if (headerStr.includes('wind') && headerStr.includes('speed')) {
      map.windSpeed = index;
    }
    else if (headerStr.includes('wind') && headerStr.includes('direction')) {
      map.windDirection = index;
    }
  });
  
  return map;
};

// 获取列值
const getColumnValue = (row, columnIndex) => {
  if (columnIndex === undefined || columnIndex === null) return '';
  return row[columnIndex];
};

// 获取特定污染物的热力图数据
export const getPollutantHeatmapDataFromExcel = async (pollutantType) => {
  const data = await parseExcelData();
  return data.map(item => ({
    lng: item.lng,
    lat: item.lat,
    count: item[pollutantType.toLowerCase()] || 0,
    time: item.time,
    height: item.height
  }));
};

// 获取所有污染物类型配置
export const getPollutantTypes = () => {
  return [
    { key: 'vocs', label: 'VOCs', unit: 'ppm', field: 'vocs' },
    { key: 'so2', label: 'SO2', unit: 'μg/m³', field: 'so2' },
    { key: 'co', label: 'CO', unit: 'mg/m³', field: 'co' },
    { key: 'no2', label: 'NO2', unit: 'μg/m³', field: 'no2' },
    { key: 'o3no2', label: 'O3+NO2', unit: 'μg/m³', field: 'o3no2' },
    { key: 'pm1', label: 'PM1.0', unit: 'μg/m³', field: 'pm1' },
    { key: 'pm25', label: 'PM2.5', unit: 'μg/m³', field: 'pm25' },
    { key: 'pm10', label: 'PM10', unit: 'μg/m³', field: 'pm10' }
  ];
};

// 获取数据统计信息
export const getExcelDataStatistics = async () => {
  const data = await parseExcelData();
  
  if (data.length === 0) {
    return {
      totalPoints: 0,
      timeRange: { start: '', end: '' },
      locationRange: { lng: { min: 0, max: 0 }, lat: { min: 0, max: 0 } },
      pollutantRanges: {}
    };
  }
  
  const stats = {
    totalPoints: data.length,
    timeRange: {
      start: data[0].time,
      end: data[data.length - 1].time
    },
    locationRange: {
      lng: {
        min: Math.min(...data.map(d => d.lng)),
        max: Math.max(...data.map(d => d.lng))
      },
      lat: {
        min: Math.min(...data.map(d => d.lat)),
        max: Math.max(...data.map(d => d.lat))
      }
    },
    pollutantRanges: {}
  };
  
  // 计算各污染物的数值范围
  const pollutants = ['vocs', 'so2', 'co', 'no2', 'o3no2', 'pm1', 'pm25', 'pm10'];
  pollutants.forEach(pollutant => {
    const values = data.map(d => d[pollutant]).filter(v => v > 0);
    if (values.length > 0) {
      stats.pollutantRanges[pollutant] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length
      };
    }
  });
  
  return stats;
};

// 按时间范围过滤数据
export const filterExcelDataByTimeRange = async (startTime, endTime) => {
  const data = await parseExcelData();
  return data.filter(item => {
    const itemTime = new Date(item.time);
    const start = new Date(startTime);
    const end = new Date(endTime);
    return itemTime >= start && itemTime <= end;
  });
};

// 按高度范围过滤数据
export const filterExcelDataByHeightRange = async (minHeight, maxHeight) => {
  const data = await parseExcelData();
  return data.filter(item => {
    return item.height >= minHeight && item.height <= maxHeight;
  });
};

// 按污染物数值范围过滤数据
export const filterExcelDataByPollutantRange = async (pollutantType, minValue, maxValue) => {
  const data = await parseExcelData();
  return data.filter(item => {
    const value = item[pollutantType.toLowerCase()];
    return value >= minValue && value <= maxValue;
  });
};

// 获取指定时间点的数据
export const getExcelDataByTime = async (targetTime) => {
  const data = await parseExcelData();
  return data.find(item => item.time === targetTime);
};

// 获取指定位置附近的数据
export const getExcelDataByLocation = async (lng, lat, radius = 0.001) => {
  const data = await parseExcelData();
  return data.filter(item => {
    const distance = Math.sqrt(
      Math.pow(item.lng - lng, 2) + Math.pow(item.lat - lat, 2)
    );
    return distance <= radius;
  });
};

// 默认导出解析后的数据
export default parseExcelData;
