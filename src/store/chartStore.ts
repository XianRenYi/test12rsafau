import { defineStore } from 'pinia'

export const useChartStore = defineStore('chartStore', {
  state: () => ({
    selectedCharts: [] as any[],
    selectedDeviceId: null as string | null,
    latestTimePoint: '' as string, // 新增字段：最新时间点
    allChartData: [] as any[],     // 新增字段：所有图表数据
  }),
  actions: {
    toggleChartClear(){
      this.selectedCharts = [] as any[];
    },
    toggleChart(chart: any) {
      const index = this.selectedCharts.findIndex(c => c.name === chart.name)
      if (index > -1) {
        this.selectedCharts.splice(index, 1)
      } else {
        this.selectedCharts.push(chart)
      }
    },
    // 同步时间点和图表数据
    syncTimeAndChartData(timePoint: string, chartDataList: any[]) {
      this.latestTimePoint = timePoint
      this.allChartData = chartDataList
    }
  }
})