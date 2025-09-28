<template>
  <div class="compact-weather">
    <div class="grid-container">
      <!-- 三行布局 -->
      <div class="data-item" v-for="item in items" :key="item.title">
        <div class="label">{{ item.title }}</div>
        <div class="value-container">
          <span class="value">{{ item.value }}</span>
          <span class="unit">{{ item.unit }}</span>
        </div>
        <div :class="['status', item.statusType]">{{ item.status }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const items = [
  { title: '温度', value: 26, unit: '℃', status: '适中', statusType: 'moderate' },
  { title: '湿度', value: 59, unit: '%', status: '潮湿', statusType: 'humid' },
 
  { title: '风速', value: 3, unit: 'm/s', status: '适中', statusType: 'moderate' },
  { title: '大气压', value: 101.95, unit: '/kpa', status: '适中', statusType: 'moderate' },

];
</script>

<style scoped>
.compact-weather {
  border-radius: 8px;
  padding: 25px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 三列布局 */
  gap: 8px;
}

.data-item {
  background: rgba(255,255,255,0.05);
  padding: 25px;
  border-radius: 6px;
  min-height: 100px; /* 缩小最小高度 */
}

.label {
  color: #6b9b68;
  font-size: 25px;
  margin-bottom: 6px;
}

.value-container {
  display: flex;
  align-items: baseline;
  margin: 4px 0;
}

.value {
  color: #4CAF50;
  font-size: 30px; /* 缩小字号 */
}

.unit {
  color: #6b9b68;
  font-size: 25px;
  margin-left: 4px;
}

.status {
  font-size: 24px;
  padding: 4px 8px;
  border-radius: 25px;
  display: inline-block;
  background: rgba(76, 175, 80, 0.15);
}

/* 状态类型配色 */
.humid { background: rgba(121, 85, 72, 0.15); }
.wind { border: 1px solid #4CAF50; }

/* 响应式适配 */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr); /* 移动端两列 */
  }
  
  .value { font-size: 18px; }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr; /* 超小屏单列 */
  }
}
</style>