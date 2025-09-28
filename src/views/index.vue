<template>
  <div class="dashboard-container">
    <!-- 顶部天气和统计信息 -->
    <el-row :gutter="20" class="top-section">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="16" :xl="16">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card device-card">
                          <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="#000000"><path d="M0 0v19h24v-19h-24zm22 17h-20v-15h20v15zm-6.599 4l2.599 3h-12l2.599-3h6.802zm-6.401-16l6 4.674-2.538.427 1.538 3.095-1.571.804-1.546-3.157-1.883 1.759v-7.602z"/></svg>
            </div>
              <div class="stat-content">
                <div class="stat-title">项目数量</div>
                <div class="stat-value">{{ deviceStatistic.tenantCount || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card product-card">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="#000000" fill-rule="evenodd" clip-rule="evenodd"><path d="M11.499 12.03v11.971l-10.5-5.603v-11.835l10.5 5.467zm11.501 6.368l-10.501 5.602v-11.968l10.501-5.404v11.77zm-16.889-15.186l10.609 5.524-4.719 2.428-10.473-5.453 4.583-2.499zm16.362 2.563l-4.664 2.4-10.641-5.54 4.831-2.635 10.474 5.775z"/></svg>
            </div>
              <div class="stat-content">
                <div class="stat-title">设备总数</div>
                <div class="stat-value">{{ deviceStatistic.deviceCount || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card online-device-card">
                                         <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="#000000"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
            </div>
              <div class="stat-content">
                <div class="stat-title">在线设备</div>
                <div class="stat-value">{{ deviceStatistic.onlineCount || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card monitor-card">
                          <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="#000000"><path d="M14.11 21h-8.61c-3.037 0-5.5-2.463-5.5-5.5 0-2.702 1.951-4.945 4.521-5.408.212-3.951 3.473-7.092 7.479-7.092 3.634 0 6.646 2.587 7.335 6.017-4.069-.195-7.335 3.06-7.335 6.983 0 1.958.811 3.729 2.11 5zm.607-6.667c1.306 0 1.398.905 1.691 1.755.129.373.164.56.275.56.13 0 .177-.23.324-.691.204-.633.509-1.628 1.22-1.628.685 0 .978.91 1.235 1.669.137.406.191.65.308.65.122 0 .202-.245.339-.65.248-.747.516-1.669 1.205-1.669.678 0 .985.891 1.171 1.479.256.814.332 1.025.806 1.025h.635c.045-.271.074-.548.074-.833 0-2.761-2.238-5-5-5-2.177 0-4.023 1.392-4.711 3.333h.428zm8.992 3.334c-.687 1.941-2.532 3.333-4.709 3.333-2.762 0-5-2.239-5-5 0-.285.029-.562.074-.833h.684c.458 0 .503.196.755 1.014.171.553.484 1.479 1.171 1.479.694 0 .988-.941 1.253-1.722.145-.423.176-.598.291-.598.123 0 .158.195.3.622.256.771.55 1.698 1.243 1.698.622 0 .92-.765 1.136-1.379.247-.702.282-.964.408-.964.128 0 .152.228.373.864.358 1.026.586 1.485 1.543 1.485h.478z"/></svg>
            </div>
              <div class="stat-content">
                <div class="stat-title">离线设备</div>
                <div class="stat-value">{{ deviceStatistic.offlineCount || 0 }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="6">
            <div class="stat-card alert-card">
                          <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="#000000"><path d="M15.137 3.945c-.644-.374-1.042-1.07-1.041-1.82v-.003c.001-1.172-.938-2.122-2.096-2.122s-2.097.95-2.097 2.122v.003c.001.751-.396 1.446-1.041 1.82-4.667 2.712-1.985 11.715-6.862 13.306v1.749h20v-1.749c-4.877-1.591-2.195-10.594-6.863-13.306zm-3.137-2.945c.552 0 1 .449 1 1 0 .552-.448 1-1 1s-1-.448-1-1c0-.551.448-1 1-1zm3 20c0 1.598-1.392 3-2.971 3s-3.029-1.402-3.029-3h6zm5.778-11.679c.18.721.05 1.446-.304 2.035l.97.584c.504-.838.688-1.869.433-2.892-.255-1.024-.9-1.848-1.739-2.351l-.582.97c.589.355 1.043.934 1.222 1.654zm.396-4.346l-.597.995c1.023.616 1.812 1.623 2.125 2.874.311 1.251.085 2.51-.53 3.534l.994.598c.536-.892.835-1.926.835-3-.001-1.98-1.01-3.909-2.827-5.001zm-16.73 2.692l-.582-.97c-.839.504-1.484 1.327-1.739 2.351-.255 1.023-.071 2.053.433 2.892l.97-.584c-.354-.588-.484-1.314-.304-2.035.179-.72.633-1.299 1.222-1.654zm-4.444 2.308c0 1.074.299 2.108.835 3l.994-.598c-.615-1.024-.841-2.283-.53-3.534.312-1.251 1.101-2.258 2.124-2.873l-.597-.995c-1.817 1.092-2.826 3.021-2.826 5z"/></svg>
            </div>
              <div class="stat-content">
                <div class="stat-title">本年度报警数量</div>
                <div class="stat-value">{{ deviceStatistic.yearAlertCount || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card event-card">
                          <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="#000000"><path d="M12 1l-12 22h24l-12-22zm-1 8h2v7h-2v-7zm1 11.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/></svg>
            </div>
              <div class="stat-content">
                <div class="stat-title">本月监测数量</div>
                <div class="stat-value">{{ deviceStatistic.eventCount || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card maintenance-card">
                          <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="#000000"><path d="M23.131 18.937l-9.662-9.663c-.662-.661-1.002-1.581-.93-2.514.137-1.767-.471-3.58-1.82-4.93-1.225-1.224-2.825-1.83-4.428-1.83-.603 0-1.207.086-1.791.257l3.771 3.771c.408 1.889-2.33 4.66-4.242 4.242l-3.771-3.77c-.172.584-.258 1.188-.258 1.792 0 1.602.607 3.202 1.83 4.426 2.616 2.619 4.932 2.103 7.857 2.262 3.37.184 6.562 2.729 6.279 7.183l2.969 2.969c.581.578 1.339.868 2.098.868 1.797 0 2.967-1.467 2.967-2.989 0-.731-.27-1.474-.869-2.074zm-2.131 3.063c-.553 0-1-.448-1-1s.447-1 1-1 1 .447 1 1-.447 1-1 1zm-11.5-7c-2.483 0-4.5 2.015-4.5 4.5s2.017 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.017-4.5-4.5-4.5zm2.5 5h-5v-1h5v1z"/></svg>
            </div>
              <div class="stat-content">
                <div class="stat-title">需维护台数</div>
                <div class="stat-value">{{ deviceStatistic.maintenanceCount || 0 }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card expiry-card">
                          <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="#000000"><path d="M6 14h6v-6c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6zm16 0c0 5.523-4.478 10-10 10s-10-4.477-10-10 4.478-10 10-10 10 4.477 10 10zm-2 0c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8 8-3.589 8-8zm-6-11.819v-2.181h-4v2.181c1.408-.238 2.562-.243 4 0zm6.679 3.554l1.321-1.321-1.414-1.414-1.407 1.407c.536.402 1.038.844 1.5 1.328z"/></svg>
            </div>
              <div class="stat-content">
                <div class="stat-title">即将到期台数</div>
                <div class="stat-value">{{ deviceStatistic.expiryCount || 0 }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-col>

      <!-- 右侧区域 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
        <!-- 信息栏 -->
        <div class="info-card info-card-compact">
          <div class="info-header">
            <h3>信息栏</h3>
          </div>
          <div class="info-content">
            <div 
              v-for="item in noticeList.slice(0, 6)" 
              :key="item.noticeId" 
              class="info-item"
              @click="openDetail(item.noticeId)"
            >
              <div class="info-tag">
                <el-tag 
                  size="small" 
                  :type="item.noticeType == 2 ? 'warning' : 'info'"
                  effect="dark"
                >
                  {{ item.noticeType == 2 ? '公告' : '信息' }}
                </el-tag>
              </div>
              <div class="info-text">{{ item.noticeTitle }}</div>
              <div class="info-date">{{ parseTime(item.createTime, '{y}-{m}-{d}') }}</div>
            </div>
          </div>
        </div>

     
      </el-col>
    </el-row>

        <!-- 底部内容区域 -->
    <el-row :gutter="20" class="bottom-section">
      <!-- 地图部分 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="16" :xl="16">
        <MapComponent :device-list="deviceList" ref="mapComponentRef" />
      </el-col>

      <!-- 右侧信息区域 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
       
              
              <DeviceCategoryStatistics />
        </el-col>
      </el-row>

    </div>
  </template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from "@/store/modules/user";
import MapComponent from '@/components/MapComponent.vue'
import DeviceCategoryStatistics from '@/views/components/DeviceCategoryStatistics.vue'

import axios from 'axios'
import { getDeviceStatistic } from '@/api/iot/device'
import { listNotice, getNotice } from '@/api/system/notice'
import { CountUp } from 'countup.js'
import { getServer } from '@/api/monitor/server'
 
import { getNettyMqttStats, statisticNettyMqtt } from '@/api/iot/netty'
// import * as echarts from 'echarts'
// 导入大屏接口
import { statisticsDevices, alertLogCount } from '@/api/bigScreenIndex/bigScreen'
import { listDeviceLog } from '@/api/iot/deviceLog'
import { parseTime } from '@/utils/ruoyi'
// 响应式数据
const router = useRouter()
const userStore = useUserStore()

// 引用
const mapComponentRef = ref(null)

// 响应式数据
const stats = ref({})
const mqttStats = ref({})
const loading = ref(true)
const open = ref(false)
const noticeList = ref([])
const notice = ref({})
const isAdmin = ref(false)
const deviceList = ref([])
const deviceStatistic = ref({})
const deviceCount = ref(0)
const maintenanceCount = ref(0)
const expiryCount = ref(0)
const version = ref('3.8.0')
const server = reactive({
    jvm: {
        name: '',
        version: '',
        startTime: '',
        runTime: '',
        used: '',
        total: 100,
    },
    sys: {
        computerName: '',
        osName: '',
        computerIp: '',
        osArch: '',
    },
    cpu: {
        cpuNum: 1,
    },
    mem: {
        total: 2,
    },
})
const tableData = ref([])

// 登录用户数量趋势数据
const userLoginData = ref([
  { date: '01-01', value: 45 },
  { date: '01-02', value: 52 },
  { date: '01-03', value: 48 },
  { date: '01-04', value: 61 },
  { date: '01-05', value: 55 },
  { date: '01-06', value: 67 },
  { date: '01-07', value: 58 }
])

// 新增设备台数趋势数据
const newDeviceData = ref([
  { date: '01-01', value: 12 },
  { date: '01-02', value: 18 },
  { date: '01-03', value: 15 },
  { date: '01-04', value: 22 },
  { date: '01-05', value: 19 },
  { date: '01-06', value: 25 },
  { date: '01-07', value: 21 }
])

// 报警统计时间类型选择
const alarmTimeType = ref('month') // 默认按月份

// 报警统计数据 - 按年份
const alarmDataYear = ref([
  { type: '温度异常', count: 156 },
  { type: '湿度异常', count: 89 },
  { type: '电压异常', count: 134 },
  { type: '通信异常', count: 67 },
  { type: '传感器故障', count: 98 },
  { type: '网络中断', count: 45 }
])

// 报警统计数据 - 按月份（12个月）
const alarmDataMonth = ref([
  { type: '1月', count: 25 },
  { type: '2月', count: 18 },
  { type: '3月', count: 22 },
  { type: '4月', count: 16 },
  { type: '5月', count: 19 },
  { type: '6月', count: 14 },
  { type: '7月', count: 28 },
  { type: '8月', count: 32 },
  { type: '9月', count: 26 },
  { type: '10月', count: 21 },
  { type: '11月', count: 24 },
  { type: '12月', count: 30 }
])

// 当前显示的报警数据
const alarmData = computed(() => {
  return alarmTimeType.value === 'year' ? alarmDataYear.value : alarmDataMonth.value
})

// 数据日志列表
const logList = ref([
  { id: 1, type: 'online', title: '设备上线', description: '北京网关01已连接', time: '10:30:15' },
  { id: 2, type: 'offline', title: '设备离线', description: '上海节点-A1连接断开', time: '10:28:42' },
  { id: 3, type: 'error', title: '数据异常', description: '深圳节点-B7温度值超出范围', time: '10:25:18' },
  { id: 4, type: 'warning', title: '预警提醒', description: '成都网关02电池电量低', time: '10:22:35' },
  { id: 5, type: 'online', title: '设备上线', description: '广州节点-C3已连接', time: '10:20:12' },
  { id: 6, type: 'error', title: '通信异常', description: '武汉节点-D5信号强度弱', time: '10:18:56' },
  { id: 7, type: 'online', title: '设备上线', description: '西安节点-E8已连接', time: '10:15:23' },
  { id: 8, type: 'warning', title: '预警提醒', description: '南京节点-F2存储空间不足', time: '10:12:47' }
])

// 图表实例
let deviceChart = null
let userLoginChart = null
let newDeviceChart = null
let alarmChart = null

// 方法
const getChartData = () => {
    // 为"本月需维护台数"生成模拟数据
    // maintenanceCount.value = Math.floor(Math.random() * 30) + 10 // 10-40之间的随机数
    
    // // 为"即将到期台数"生成模拟数据
    // expiryCount.value = Math.floor(Math.random() * 20) + 5 // 5-25之间的随机数
    
    // 生成登录用户数量趋势模拟数据（最近7天）
    const today = new Date()
    const dates = []
    const loginValues = []
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
        dates.push(dateStr)
        
        // 生成合理的登录用户数量（40-80之间，周末略高）
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const baseValue = isWeekend ? 60 : 50
        const randomValue = Math.floor(Math.random() * 20) + baseValue
        loginValues.push(randomValue)
    }
    
    userLoginData.value = dates.map((date, index) => ({
        date: date,
        value: loginValues[index]
    }))
    
    // 生成新增设备台数趋势模拟数据（最近7天）
    const deviceValues = []
    for (let i = 0; i < 7; i++) {
        // 生成合理的新增设备数量（8-30之间）
        const randomValue = Math.floor(Math.random() * 22) + 8
        deviceValues.push(randomValue)
    }
    
    newDeviceData.value = dates.map((date, index) => ({
        date: date,
        value: deviceValues[index]
    }))
    
    // 生成报警统计模拟数据 - 按年份
    alarmDataYear.value = [
        { type: '温度异常', count: Math.floor(Math.random() * 50) + 120 },
        { type: '湿度异常', count: Math.floor(Math.random() * 40) + 70 },
        { type: '电压异常', count: Math.floor(Math.random() * 60) + 100 },
        { type: '通信异常', count: Math.floor(Math.random() * 30) + 50 },
        { type: '传感器故障', count: Math.floor(Math.random() * 40) + 80 },
        { type: '网络中断', count: Math.floor(Math.random() * 25) + 30 }
    ]
    
    // 生成报警统计模拟数据 - 按月份（12个月）
    alarmDataMonth.value = [
        { type: '1月', count: Math.floor(Math.random() * 20) + 15 },
        { type: '2月', count: Math.floor(Math.random() * 18) + 10 },
        { type: '3月', count: Math.floor(Math.random() * 22) + 12 },
        { type: '4月', count: Math.floor(Math.random() * 15) + 8 },
        { type: '5月', count: Math.floor(Math.random() * 18) + 10 },
        { type: '6月', count: Math.floor(Math.random() * 12) + 5 },
        { type: '7月', count: Math.floor(Math.random() * 25) + 18 },
        { type: '8月', count: Math.floor(Math.random() * 30) + 20 },
        { type: '9月', count: Math.floor(Math.random() * 22) + 15 },
        { type: '10月', count: Math.floor(Math.random() * 20) + 12 },
        { type: '11月', count: Math.floor(Math.random() * 18) + 14 },
        { type: '12月', count: Math.floor(Math.random() * 25) + 20 }
    ]
    
    console.log('本月需维护台数:', maintenanceCount.value)
    console.log('即将到期台数:', expiryCount.value)
    console.log('登录用户趋势数据:', userLoginData.value)
    console.log('新增设备趋势数据:', newDeviceData.value)
    console.log('报警统计数据 - 按年份:', alarmDataYear.value)
    console.log('报警统计数据 - 按月份:', alarmDataMonth.value)
    console.log('当前报警统计时间类型:', alarmTimeType.value)
    
    // 绘制所有图表
    nextTick(() => {
        createDeviceTypeChart()
        createUserLoginChart()
        createNewDeviceChart()
        createAlarmChart()
    })
}




const init = () => {
    if (userStore.roles.indexOf('tenant') === -1 && userStore.roles.indexOf('general') === -1) {
        isAdmin.value = true
        getServerData()
        getChartData()
    }
}


const getlistDeviceLog = () => {
    listDeviceLog().then(response => {
      deviceStatistic.value.eventCount = response.total 
    })
  }


const getDeviceStatisticData = () => {
    // 获取设备统计信息
    // getDeviceStatistic().then((response) => {
    //   debugger
    //     deviceStatistic.value = response.data
    // })
    
    // 获取大屏设备统计信息
    statisticsDevices().then((response) => {
        if (response.data) {
            // 更新设备总数、在线设备、离线设备

                deviceStatistic.value.deviceCount  = response.data.totalDevices || 0,        // 设备总数
                deviceStatistic.value.onlineCount  = response.data.onlineDevices || 0,      // 在线设备
                deviceStatistic.value.offlineCount = response.data.offlineDevices || 0     // 离线设备
                deviceStatistic.value.tenantCount = response.data.tenantCount || 0     // 项目总数
                deviceStatistic.value.maintenanceCount = response.data.maintenanceCount || 0     // 需维护台数
                deviceStatistic.value.expiryCount = response.data.expiryCount || 0     // 即将到期台数



          }
    }).catch((error) => {
        console.error('获取设备统计信息失败:', error)
    })
    
    // 获取本年度报警数量
    const currentYear = new Date().getFullYear()
    alertLogCount({ year: currentYear }).then((response) => {
        if (response.data) {
        deviceStatistic.value.yearAlertCount = response.data || 0    
        }
    }).catch((error) => {
        console.error('获取年度报警数量失败:', error)
    })
}

const getNoticeList = () => {
    let queryParams = {
        pageNum: 1,
        pageSize: 6,
    }
    listNotice(queryParams).then((response) => {
        noticeList.value = response.rows.splice(0, 6)
    })
}

const openDetail = (id) => {
    open.value = true
    loading.value = true
    getNotice(id).then((response) => {
        notice.value = response.data
        open.value = true
        loading.value = false
    })
}

const closeDetail = () => {
    open.value = false
}

const getAllDevice = () => {
    // 使用假数据替代接口调用
    const mockDevices = [
        { deviceId: 1, deviceName: '北京网关01', productName: '环境监测网关', device_type: 'gateway', tenantName: '默认租户', serialNumber: 'BJGW-0001', gwDevCode: 'GW-001', firmwareVersion: '1.0.3', status: 3, rssi: -60, isShadow: 0, locationWay: 'GPS', activeTime: '2024-01-10 10:30:00', networkAddress: '北京市东城区', longitude: 116.407526, latitude: 39.90403 },
        { deviceId: 2, deviceName: '上海节点-A1', productName: '温湿度节点', device_type: 'sensor', tenantName: '默认租户', serialNumber: 'SHND-A1', gwDevCode: 'ND-101', firmwareVersion: '2.2.1', status: 4, rssi: -70, isShadow: 0, locationWay: 'LBS', activeTime: '2024-01-12 09:15:00', networkAddress: '上海市黄浦区', longitude: 121.473701, latitude: 31.230416 },
        { deviceId: 3, deviceName: '深圳节点-B7', productName: '烟感节点', device_type: 'sensor', tenantName: '默认租户', serialNumber: 'SZND-B7', gwDevCode: 'ND-207', firmwareVersion: '3.0.0', status: 3, rssi: -55, isShadow: 0, locationWay: 'GPS', activeTime: '2024-01-15 14:05:00', networkAddress: '深圳市南山区', longitude: 113.93041, latitude: 22.53332 },
        { deviceId: 4, deviceName: '成都网关02', productName: '智慧用电网关', device_type: 'gateway', tenantName: '默认租户', serialNumber: 'CDGW-0002', gwDevCode: 'GW-002', firmwareVersion: '1.1.0', status: 2, rssi: -65, isShadow: 1, locationWay: 'Manual', activeTime: '2024-01-18 11:20:00', networkAddress: '成都市武侯区', longitude: 104.061, latitude: 30.67 }
    ]

    deviceList.value = mockDevices
    deviceCount.value = mockDevices.length
  
}

// loadMap 方法已移至 MapComponent

// initAMap 方法已移至 MapComponent

// createMap 方法已移至 MapComponent

// getDeviceIcon 方法已移至 MapComponent

// getDeviceInfo 方法已移至 MapComponent

// getStatusText 方法已移至 MapComponent

const getServerData = () => {
    getServer().then((response) => {
        Object.assign(server, response.data)
        console.log(response.data)
        tableData.value = [
            {
                server: '服务器名',
                serverContent: server.sys.computerName,
                java: 'Java名称',
                javaContent: server.jvm.name,
            },
            {
                server: '服务器IP',
                serverContent: server.sys.computerIp,
                java: '启动时间',
                javaContent: server.jvm.startTime,
            },
            {
                server: '系统',
                serverContent: server.sys.osName,
                java: 'Java版本',
                javaContent: server.jvm.version,
            },
            {
                server: '系统架构',
                serverContent: server.sys.osArch,
                java: '运行时长',
                javaContent: server.jvm.runTime,
            },
            {
                server: 'CPU核心',
                serverContent: server.cpu.cpuNum,
                java: '内存使用率',
                javaContent: server.jvm.used,
            },
            {
                server: '内存大小',
                serverContent: server.mem.total,
                java: 'JVM总内存',
                javaContent: server.jvm.total,
            },
        ]
    })
}

const createDeviceTypeChart = () => {
  
}

// 创建登录用户数量趋势折线图
const createUserLoginChart = () => {
    const chartDom = document.getElementById('userLoginChart')
    if (!chartDom) return

    if (userLoginChart) {
        userLoginChart.dispose()
    }

    userLoginChart = echarts.init(chartDom)

    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ddd',
            borderWidth: 1,
            textStyle: {
                color: '#333',
            },
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            top: '15%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: userLoginData.value.map(item => item.date),
            axisLine: {
                lineStyle: {
                    color: '#ddd',
                },
            },
            axisLabel: {
                color: '#666',
                fontSize: 11,
            },
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#ddd',
                },
            },
            axisLabel: {
                color: '#666',
                fontSize: 11,
            },
            splitLine: {
                lineStyle: {
                    type: 'solid',
                    color: '#eee',
                },
            },
        },
        series: [
            {
                name: '登录用户数',
                type: 'line',
                data: userLoginData.value.map(item => item.value),
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                    color: '#409EFF',
                    width: 3,
                },
                itemStyle: {
                    color: '#409EFF',
                    borderColor: '#fff',
                    borderWidth: 2,
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' },
                        ],
                    },
                },
            },
        ],
    }

    userLoginChart.setOption(option)
}

// 创建新增设备台数趋势折线图
const createNewDeviceChart = () => {
    const chartDom = document.getElementById('newDeviceChart')
    if (!chartDom) return

    if (newDeviceChart) {
        newDeviceChart.dispose()
    }

    newDeviceChart = echarts.init(chartDom)

    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ddd',
            borderWidth: 1,
            textStyle: {
                color: '#333',
            },
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            top: '15%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: newDeviceData.value.map(item => item.date),
            axisLine: {
                lineStyle: {
                    color: '#ddd',
                },
            },
            axisLabel: {
                color: '#666',
                fontSize: 11,
            },
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#ddd',
                },
            },
            axisLabel: {
                color: '#666',
                fontSize: 11,
            },
            splitLine: {
                lineStyle: {
                    type: 'solid',
                    color: '#eee',
                },
            },
        },
        series: [
            {
                name: '新增设备数',
                type: 'line',
                data: newDeviceData.value.map(item => item.value),
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                    color: '#67C23A',
                    width: 3,
                },
                itemStyle: {
                    color: '#67C23A',
                    borderColor: '#fff',
                    borderWidth: 2,
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' },
                        ],
                    },
                },
            },
        ],
    }

    newDeviceChart.setOption(option)
}

// 处理报警统计时间类型变化
const handleAlarmTimeTypeChange = () => {
    // 重新绘制报警统计图表
    nextTick(() => {
        createAlarmChart()
    })
}

// 创建报警统计柱状图
const createAlarmChart = () => {
    const chartDom = document.getElementById('alarmChart')
    if (!chartDom) return

    if (alarmChart) {
        alarmChart.dispose()
    }

    alarmChart = echarts.init(chartDom)

    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ddd',
            borderWidth: 1,
            textStyle: {
                color: '#333',
            },
        },
        grid: {
            left: '15%',
            right: '10%',
            bottom: '15%',
            top: '15%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: alarmData.value.map(item => item.type),
            axisLine: {
                lineStyle: {
                    color: '#ddd',
                },
            },
            axisLabel: {
                color: '#666',
                fontSize: 11,
                rotate: 45,
            },
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#ddd',
                },
            },
            axisLabel: {
                color: '#666',
                fontSize: 11,
            },
            splitLine: {
                lineStyle: {
                    type: 'solid',
                    color: '#eee',
                },
            },
        },
        series: [
            {
                name: '报警次数',
                type: 'bar',
                data: alarmData.value.map(item => item.count),
                barWidth: '60%',
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: '#FF6B6B' },
                            { offset: 1, color: '#FF8E8E' },
                        ],
                    },
                    borderRadius: [4, 4, 0, 0],
                },
                emphasis: {
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: '#FF5252' },
                                { offset: 1, color: '#FF7676' },
                            ],
                        },
                    },
                },
            },
        ],
    }

    alarmChart.setOption(option)
}


// 生命周期
onMounted(() => {
    init()
    getAllDevice()
    getNoticeList()
    getDeviceStatisticData()
    getlistDeviceLog()

})
</script>

<style lang="scss" scoped>
// 全局隐藏滚动条
* {
  &::-webkit-scrollbar {
    display: none;
  }
  
  // 兼容Firefox
  scrollbar-width: none;
  
  // 兼容IE
  -ms-overflow-style: none;
}

.dashboard-container {
  padding: 12px;
  background-color: #f5f7fa;
  min-height: 90vh;
  
  // 确保容器本身也不显示滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.top-section {
  margin-bottom: -10px;
  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.bottom-section {
  margin-bottom: 20px;
  margin-top: 0;
  
  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;
}


// 统计卡片
.stat-card {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  height: 100px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .stat-icon {
    font-size: 32px;
    margin-right: 15px;
    width: 50px;
    text-align: center;
  }

  .stat-content {
    flex: 1;
    
    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
    
    scrollbar-width: none;
    -ms-overflow-style: none;

    .stat-title {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  &.device-card .stat-value { color: #333; }
  &.product-card .stat-value { color: #333; }
  &.online-device-card .stat-value { color: #333; }
  &.monitor-card .stat-value { color: #333; }
  &.alert-card .stat-value { color: #333; }
  &.event-card .stat-value { color: #333; }
  &.maintenance-card .stat-value { color: #333; }
  &.expiry-card .stat-value { color: #333; }
}

// 设备分类卡片
.device-overview-card {
  background: #fff;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  .info-header {
    margin-bottom: 15px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  }

  .info-header {
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .device-count {
    display: flex;
    align-items: center;
    gap: 20px;
    
    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
    
    scrollbar-width: none;
    -ms-overflow-style: none;

    .pie-chart {
      width: 156px;
      height: 156px;
      flex-shrink: 0;
    }

    .data-rank {
      flex: 1;
      
      // 隐藏滚动条
      &::-webkit-scrollbar {
        display: none;
      }
      
      scrollbar-width: none;
      -ms-overflow-style: none;

      .rank-item {
        margin-bottom: 15px;

        .rank-data {
          .rank-name {
            display: flex;
            align-items: center;
            margin-bottom: 8px;

            .rank-index {
              width: 20px;
              height: 20px;
              background: #0be8fc;
              color: #000;
              font-size: 12px;
              font-weight: bold;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 10px;
            }

            .rank-label {
              color: #333;
              margin-right: 10px;
              flex: 1;
            }

            div:last-child {
              color: #0be8fc;
              font-weight: bold;
            }
          }

          .rank-line {
            height: 6px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 3px;
            overflow: hidden;

            .process-line {
              height: 100%;
              border-radius: 3px;
              transition: width 0.3s ease;

              &.color0 {
                background: linear-gradient(90deg, rgba(11, 232, 252, 0.8), rgba(11, 232, 252, 1));
              }
              &.color1 {
                background: linear-gradient(90deg, rgba(255, 228, 120, 0.8), rgba(255, 228, 120, 1));
              }
              &.color2 {
                background: linear-gradient(90deg, rgba(255, 208, 21, 0.8), rgba(255, 208, 21, 1));
              }
              &.color3 {
                background: linear-gradient(90deg, rgba(255, 141, 21, 0.8), rgba(255, 141, 21, 1));
              }
              &.color4 {
                background: linear-gradient(90deg, rgba(255, 100, 21, 0.8), rgba(255, 100, 21, 1));
              }
            }
          }
        }
      }
    }
  }

  // 紧凑版本
  &.device-overview-compact {
    padding: 20px;
    margin-bottom: 20px;

    .info-header {
      margin-bottom: 12px;

      h3 {
        font-size: 15px;
      }
    }

    .device-count {
      gap: 15px;

      .pie-chart {
        width: 130px;
        height: 130px;
      }

      .data-rank {
        .rank-item {
          margin-bottom: 12px;

          .rank-data {
            .rank-name {
              margin-bottom: 6px;

              .rank-index {
                width: 18px;
                height: 18px;
                font-size: 11px;
                margin-right: 8px;
              }

              .rank-label {
                font-size: 13px;
                margin-right: 8px;
              }
            }

            .rank-line {
              height: 5px;

              .process-line {
                height: 100%;
              }
            }
          }
        }
      }
    }
  }
}


// 地图相关样式已移至 MapComponent

// 信息卡片
.info-card {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .info-header {
    margin-bottom: 15px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

      .info-content {
        // 隐藏滚动条
        &::-webkit-scrollbar {
          display: none;
        }
        
        scrollbar-width: none;
        -ms-overflow-style: none;
        
      .info-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: all 0.2s ease;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding-left: 10px;
          padding-right: 10px;
          margin-left: -10px;
          margin-right: -10px;
          transform: translateX(5px); // 添加悬停时的轻微移动效果
        }

        .info-tag {
          margin-right: 12px; // 增加标签右边距
          flex-shrink: 0;
        }

        .info-text {
          flex: 1;
          font-size: 14px;
          color: #333;
          line-height: 1.5; // 增加行高
          margin-right: 10px; // 添加右边距
        }

        .info-date {
          font-size: 12px;
          color: #999;
          flex-shrink: 0;
          white-space: nowrap; // 防止日期换行
        }
      }
    }

  // 紧凑版本
  &.info-card-compact {
    padding: 15px;
    margin-bottom: 20px;
    height: 220px; // 设置高度与左边两行统计卡片总高度一致
    display: flex;
    flex-direction: column;

    .info-header {
      margin-bottom: 15px; // 增加头部底部间距

      h3 {
        font-size: 15px;
      }
    }

    .info-content {
      flex: 1; // 让内容区域占满剩余空间
      overflow-y: auto; // 添加垂直滚动条
      
      // 隐藏滚动条
      &::-webkit-scrollbar {
        display: none;
      }
      
      // 兼容Firefox
      scrollbar-width: none;
      
      // 兼容IE
      -ms-overflow-style: none;
      
      .info-item {
        padding: 10px 0; // 增加每个项目的上下间距

        .info-text {
          font-size: 13px;
        }

        .info-date {
          font-size: 11px;
        }
      }
    }
  }
}

// MQTT卡片
.mqtt-card {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  height: 400px;
  max-height: 400px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: 0;
  
  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .mqtt-chart {
    height: 100%;
    width: 100%;
    
    // 隐藏图表容器的滚动条
    &::-webkit-scrollbar {
      display: none;
    }
    
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
}

// 图表卡片样式
.chart-card {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 20px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .info-header {
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .chart-container {
    height: 328px;
    
    .line-chart {
      width: 100%;
      height: 100%;
    }
    
    .bar-chart {
      width: 100%;
      height: 100%;
    }
  }
}

.charts-section {
  margin-top: 20px;
}

// 数据日志卡片样式
.log-card {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 20px;
  height: 400px;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .info-header {
    margin-bottom: 15px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .log-content {
    flex: 1;
    overflow-y: auto;
    
    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
    
    scrollbar-width: none;
    -ms-overflow-style: none;

    .log-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.2s ease;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding-left: 10px;
        padding-right: 10px;
        margin-left: -10px;
        margin-right: -10px;
        transform: translateX(3px);
      }

      .log-icon {
        margin-right: 12px;
        font-size: 16px;
        flex-shrink: 0;
      }

      .log-info {
        flex: 1;
        margin-right: 10px;

        .log-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .log-desc {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }
      }

      .log-time {
        font-size: 11px;
        color: #999;
        flex-shrink: 0;
        white-space: nowrap;
      }

      // 不同类型的状态样式
      &.online {
        .log-icon {
          color: #67C23A;
        }
        .log-title {
          color: #67C23A;
        }
      }

      &.offline {
        .log-icon {
          color: #F56C6C;
        }
        .log-title {
          color: #F56C6C;
        }
      }

      &.error {
        .log-icon {
          color: #F56C6C;
        }
        .log-title {
          color: #F56C6C;
        }
      }

      &.warning {
        .log-icon {
          color: #E6A23C;
        }
        .log-title {
          color: #E6A23C;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-container {
    padding: 15px;
  }

  .stat-card {
    height: 90px;
    padding: 15px;

    .stat-icon {
      font-size: 28px;
      margin-right: 12px;
      width: 40px;
    }

    .stat-content {
      .stat-title {
        font-size: 12px;
        margin-bottom: 6px;
      }

      .stat-value {
        font-size: 14px;
      }
    }
  }

  .device-overview-card {
    padding: 20px;

         .info-header h3 {
       font-size: 15px;
     }

    .device-count {
      gap: 15px;

      .pie-chart {
        width: 130px;
        height: 130px;
      }

      .data-rank {
        .rank-item {
          margin-bottom: 12px;

          .rank-data {
            .rank-name {
              margin-bottom: 6px;

              .rank-index {
                width: 18px;
                height: 18px;
                font-size: 11px;
                margin-right: 8px;
              }

              .rank-label {
                font-size: 13px;
                margin-right: 8px;
              }
            }

            .rank-line {
              height: 5px;

              .process-line {
                height: 100%;
              }
            }
          }
        }
      }
    }
  }


}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }

  .top-section,
  .bottom-section {
    margin-bottom: 15px;
  }

  .stat-card {
    height: 80px;
    padding: 12px;
    margin-bottom: 15px;

    .stat-icon {
      font-size: 24px;
      margin-right: 10px;
      width: 35px;
    }

    .stat-content {
      .stat-title {
        font-size: 11px;
        margin-bottom: 5px;
      }

      .stat-value {
        font-size: 13px;
      }
    }
  }

  .device-overview-card {
    padding: 15px;
    margin-bottom: 15px;

         .info-header h3 {
       font-size: 14px;
     }

    .device-count {
      gap: 10px;

      .pie-chart {
        width: 100px;
        height: 100px;
      }

      .data-rank {
        .rank-item {
          margin-bottom: 10px;

          .rank-data {
            .rank-name {
              margin-bottom: 5px;

              .rank-index {
                width: 12px;
                height: 12px;
                font-size: 8px;
                margin-right: 6px;
              }

              .rank-label {
                font-size: 12px;
                margin-right: 6px;
              }
            }

            .rank-line {
              height: 4px;

              .process-line {
                height: 100%;
              }
            }
          }
        }
      }
    }
  }

  // .map-card 样式已移至 MapComponent

  .info-card,
  .mqtt-card {
    margin-bottom: 15px;
    
    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
    
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .mqtt-card {
    height: 200px;
  }

  .chart-card {
    padding: 15px;
    margin-bottom: 15px;

    .info-header h3 {
      font-size: 14px;
    }

    .chart-container {
      height: 160px;
    }
  }

  .charts-section {
    margin-top: 15px;
  }

  .log-card {
    height: 300px;
    padding: 15px;

    .log-content .log-item {
      padding: 10px 0;

      .log-icon {
        font-size: 14px;
        margin-right: 10px;
      }

      .log-info {
        .log-title {
          font-size: 13px;
        }

        .log-desc {
          font-size: 11px;
        }
      }

      .log-time {
        font-size: 10px;
      }
    }
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 8px;
  }

  .top-section,
  .bottom-section {
    margin-bottom: 10px;
  }

  .stat-card {
    height: 70px;
    padding: 10px;
    margin-bottom: 10px;

    .stat-icon {
      font-size: 20px;
      margin-right: 8px;
      width: 30px;
    }

    .stat-content {
      .stat-title {
        font-size: 10px;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 12px;
      }
    }
  }

  .device-overview-card {
    padding: 12px;
    margin-bottom: 10px;
    
    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
    
    scrollbar-width: none;
    -ms-overflow-style: none;

         .info-header h3 {
       font-size: 13px;
     }

    .device-count {
      gap: 8px;
      
      // 隐藏滚动条
      &::-webkit-scrollbar {
        display: none;
      }
      
      scrollbar-width: none;
      -ms-overflow-style: none;

      .pie-chart {
        width: 80px;
        height: 80px;
      }

      .data-rank {
        .rank-item {
          margin-bottom: 8px;

          .rank-data {
            .rank-name {
              margin-bottom: 4px;

              .rank-index {
                width: 10px;
                height: 10px;
                font-size: 6px;
                margin-right: 4px;
              }

              .rank-label {
                font-size: 11px;
                margin-right: 4px;
              }
            }

            .rank-line {
              height: 3px;

              .process-line {
                height: 100%;
              }
            }
          }
        }
      }
    }
  }



  // .map-card 样式已移至 MapComponent (小屏幕)

  .info-card,
  .mqtt-card {
    margin-bottom: 10px;
    padding: 15px;
    
    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
    
    scrollbar-width: none;
    -ms-overflow-style: none;

    .info-header h3 {
      font-size: 15px;
    }

    .info-content .info-item {
      padding: 10px 0;

      .info-text {
        font-size: 13px;
      }

      .info-date {
        font-size: 11px;
      }
    }
  }

  .mqtt-card {
    height: 200px;
  }

  // 图表卡片样式
  .chart-card {
    background: #fff;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 20px;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .info-header {
      margin-bottom: 15px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .chart-container {
      height: 200px;
      
      .line-chart {
        width: 100%;
        height: 100%;
      }
    }
  }

  .charts-section {
    margin-top: 20px;
  }

  .log-card {
    height: 240px;
    padding: 12px;

    .log-content .log-item {
      padding: 8px 0;

      .log-icon {
        font-size: 12px;
        margin-right: 8px;
      }

      .log-info {
        .log-title {
          font-size: 12px;
        }

        .log-desc {
          font-size: 10px;
        }
      }

      .log-time {
        font-size: 9px;
      }
    }
  }
}
</style>
