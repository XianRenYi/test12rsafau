# 全局报警检测预警弹窗组件

## 功能特性

- ✅ 三级预警类型（一级、二级、三级预警）
- ✅ 实时预警阈值和实际值显示
- ✅ 模拟数据生成功能
- ✅ 定时自动弹出（默认10秒间隔）
- ✅ 符合bigScreen7风格的UI设计
- ✅ 响应式设计，支持移动端
- ✅ 全局插件集成

## 组件结构

```
src/components/AlarmModal/
├── index.vue              # 主弹窗组件
├── GlobalAlarmModal.vue   # 全局弹窗管理组件
└── README.md             # 使用文档
```

## 使用方法

### 1. 全局使用（已集成到main.js）

报警弹窗已经全局集成到应用中，可以通过以下方式使用：

```javascript
// 在Vue组件中使用
export default {
  methods: {
    openAlarmModal() {
      this.$alarmModal.open()
    },
    closeAlarmModal() {
      this.$alarmModal.close()
    },
    toggleAlarmModal() {
      this.$alarmModal.toggle()
    },
    // 定时任务控制
    startAutoPopup() {
      this.$alarmModal.startAutoPopup()
    },
    stopAutoPopup() {
      this.$alarmModal.stopAutoPopup()
    },
    setInterval(interval) {
      this.$alarmModal.setAutoPopupInterval(interval)
    }
  }
}
```

### 2. 在window对象中使用

```javascript
// 全局方法
window.$alarmModal.open()           // 打开弹窗
window.$alarmModal.close()          // 关闭弹窗
window.$alarmModal.toggle()         // 切换弹窗
window.$alarmModal.startAutoPopup() // 开始定时弹出
window.$alarmModal.stopAutoPopup()  // 停止定时弹出
window.$alarmModal.setAutoPopupInterval(5000) // 设置5秒间隔
window.$alarmModal.getStatus()      // 获取状态
```

### 3. 组件内使用

```vue
<template>
  <div>
    <button @click="openModal">打开报警弹窗</button>
    <AlarmModal 
      :visible="isVisible" 
      @close="closeModal"
    />
  </div>
</template>

<script>
import AlarmModal from '@/components/AlarmModal/index.vue'

export default {
  components: {
    AlarmModal
  },
  data() {
    return {
      isVisible: false
    }
  },
  methods: {
    openModal() {
      this.isVisible = true
    },
    closeModal() {
      this.isVisible = false
    }
  }
}
</script>
```

## 配置选项

### 预警类型配置

```javascript
alarmTypes: [
  {
    level: 1,
    name: '一级预警',
    color: 'rgba(248, 4, 87, 1)',  // 红色
    threshold: 80,
    unit: 'mg/m³'
  },
  {
    level: 2,
    name: '二级预警',
    color: 'rgba(254, 229, 0, 1)', // 黄色
    threshold: 60,
    unit: 'mg/m³'
  },
  {
    level: 3,
    name: '三级预警',
    color: 'rgba(2, 255, 134, 1)', // 绿色
    threshold: 40,
    unit: 'mg/m³'
  }
]
```

### 定时任务配置

```javascript
// 默认配置
autoPopupInterval: 10000, // 10秒间隔
isAutoPopupEnabled: true  // 默认启用

// 可选的间隔时间
5000   // 5秒
10000  // 10秒
30000  // 30秒
60000  // 1分钟
300000 // 5分钟
```

## 事件说明

### AlarmModal 事件

- `@close` - 弹窗关闭事件
- `@start-auto-popup` - 开始自动弹出事件
- `@stop-auto-popup` - 停止自动弹出事件
- `@update-interval` - 更新定时间隔事件

### GlobalAlarmModal 事件

- `@opened` - 弹窗打开事件
- `@closed` - 弹窗关闭事件
- `@auto-popup-started` - 自动弹出开始事件
- `@auto-popup-stopped` - 自动弹出停止事件
- `@interval-updated` - 间隔更新事件

## 样式定制

组件使用了bigScreen7的设计风格，主要颜色：

- 主色调：`rgba(30, 60, 114, 0.95)` 到 `rgba(42, 82, 152, 0.95)`
- 标题色：`#88ecfb`
- 一级预警：`rgba(248, 4, 87, 1)` (红色)
- 二级预警：`rgba(254, 229, 0, 1)` (黄色)
- 三级预警：`rgba(2, 255, 134, 1)` (绿色)

## 响应式支持

- 桌面端：完整功能展示
- 移动端：自适应布局，按钮垂直排列
- 平板端：中等尺寸适配

## 注意事项

1. 定时任务会在组件挂载时自动启动
2. 如果弹窗已经打开，定时任务不会重复弹出
3. 组件卸载时会自动清理定时器
4. 建议在生产环境中根据实际需求调整定时间隔

## 更新日志

- v1.0.0 - 初始版本，支持基础报警弹窗功能
- v1.1.0 - 添加定时自动弹出功能
- v1.2.0 - 添加定时任务控制界面
