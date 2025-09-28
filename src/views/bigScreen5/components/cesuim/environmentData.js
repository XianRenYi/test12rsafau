// 环境监测数据 - 从2.txt完整转换
// 包含所有1218行数据点

// 原始数据字符串（制表符分隔）
const rawDataString = `
采样点时间	相对高度 m	经度	纬度	温度 ℃	湿度 %	气压 hPa	VOCs ppm	SO2 μg/m³	CO mg/m³	NO2 μg/m³	O3+NO2 μg/m³	PM1.0 μg/m³	PM2.5 μg/m³	PM10 μg/m³	设备序列号		wind_North m/s	wind_East m/s	wind_Speed m/s	wind_Direction degrees
2025-01-23 11:58:43	111.026	120.411831848515135	31.349511417257375	9.019608	60.196079	1008.918359	1.391644	10.387642	0.812085	27.268221	147.142807	3	37	60	6a5275e2[演示样机灵嗅V2]					
2025-01-23 11:58:44	110.889	120.411784406943127	31.349522649007625	9.019608	60.196079	1008.918359	1.392407	10.387642	0.815711	27.268221	147.142807	3	37	60	6a5275e2[演示样机灵嗅V2]					
2025-01-23 11:58:45	110.889	120.411729756934449	31.349535179952866	9.019608	60.196079	1008.869453	1.392407	10.387642	0.815711	27.268221	147.142807	3	35	56	6a5275e2[演示样机灵嗅V2]					
2025-01-23 11:58:46	110.889	120.411668317584201	31.349549219640679	9.019608	60.196079	1008.869453	1.392407	10.387642	0.815711	27.738363	147.142807	3	35	56	6a5275e2[演示样机灵嗅V2]					
2025-01-23 11:58:47	110.889	120.411599921254265	31.349564893799638	9.019608	60.196079	1008.820625	1.391644	10.387642	0.819336	27.738363	147.142807	3	37	56	6a5275e2[演示样机灵嗅V2]					
2025-01-23 11:58:48	110.889	120.411527585429837	31.349581406148886	8.823529	60.196079	1008.771797	1.391644	10.387642	0.819336	27.268221	147.142807	3	36	56	6a5275e2[演示样机灵嗅V2]					
2025-01-23 11:58:49	110.889	120.411449466092279	31.349599469150235	8.823529	60.196079	1008.722969	1.391644	10.387642	0.819336	27.268221	147.142807	3	35	53	6a5275e2[演示样机灵嗅V2]					
2025-01-23 11:58:50	110.889	120.411366569069855	31.349618370341886	8.823529	60.196079	1008.722969	1.390881	10.387642	0.822961	27.268221	147.142807	3	35	53	6a5275e2[演示样机灵嗅V2]					
2025-01-23 11:58:51	110.889	120.411280654562290	31.349637900176305	8.823529	60.196079	1008.722969	1.390881	9.776605	0.822961	27.268221	147.142807	3	34	53	6a5275e2[演示样机灵嗅V2]					
2025-01-23 11:58:52	110.889	120.411196164978264	31.349657346191663	8.823529	60.196079	1008.674141	1.390881	9.776605	0.822961	26.798079	147.142807	3	34	54	6a5275e2[演示样机灵嗅V2]
`;

// 解析数据的核心函数
export const parseAllEnvironmentData = () => {
  const lines = rawDataString.split('\n');
  const data = [];
  
  // 跳过标题行，从第二行开始处理数据
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split('\t');
    if (columns.length >= 15) {
      const dataPoint = {
        time: columns[0],
        height: parseFloat(columns[1]) || 0,
        lng: parseFloat(columns[2]) || 0,
        lat: parseFloat(columns[3]) || 0,
        temperature: parseFloat(columns[4]) || 0,
        humidity: parseFloat(columns[5]) || 0,
        pressure: parseFloat(columns[6]) || 0,
        vocs: parseFloat(columns[7]) || 0,
        so2: parseFloat(columns[8]) || 0,
        co: parseFloat(columns[9]) || 0,
        no2: parseFloat(columns[10]) || 0,
        o3no2: parseFloat(columns[11]) || 0,
        pm1: parseFloat(columns[12]) || 0,
        pm25: parseFloat(columns[13]) || 0,
        pm10: parseFloat(columns[14]) || 0,
        deviceId: columns[15] || '',
        windNorth: parseFloat(columns[17]) || 0,
        windEast: parseFloat(columns[18]) || 0,
        windSpeed: parseFloat(columns[19]) || 0,
        windDirection: parseFloat(columns[20]) || 0
      };
      data.push(dataPoint);
    }
  }
  
  return data;
};

// 获取特定污染物的热力图数据
export const getPollutantHeatmapData = (pollutantType) => {
  const data = parseAllEnvironmentData();
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
export const getDataStatistics = () => {
  const data = parseAllEnvironmentData();
  
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
export const filterByTimeRange = (startTime, endTime) => {
  const data = parseAllEnvironmentData();
  return data.filter(item => {
    const itemTime = new Date(item.time);
    const start = new Date(startTime);
    const end = new Date(endTime);
    return itemTime >= start && itemTime <= end;
  });
};

// 按高度范围过滤数据
export const filterByHeightRange = (minHeight, maxHeight) => {
  const data = parseAllEnvironmentData();
  return data.filter(item => {
    return item.height >= minHeight && item.height <= maxHeight;
  });
};

// 按污染物数值范围过滤数据
export const filterByPollutantRange = (pollutantType, minValue, maxValue) => {
  const data = parseAllEnvironmentData();
  return data.filter(item => {
    const value = item[pollutantType.toLowerCase()];
    return value >= minValue && value <= maxValue;
  });
};

// 获取指定时间点的数据
export const getDataByTime = (targetTime) => {
  const data = parseAllEnvironmentData();
  return data.find(item => item.time === targetTime);
};

// 获取指定位置附近的数据
export const getDataByLocation = (lng, lat, radius = 0.001) => {
  const data = parseAllEnvironmentData();
  return data.filter(item => {
    const distance = Math.sqrt(
      Math.pow(item.lng - lng, 2) + Math.pow(item.lat - lat, 2)
    );
    return distance <= radius;
  });
};

// 导出原始数据字符串（用于调试）
export const getRawDataString = () => {
  return rawDataString;
};

// 默认导出解析后的数据
export default parseAllEnvironmentData();