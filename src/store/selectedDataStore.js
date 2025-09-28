// src/stores/selectedDataStore.js
import { defineStore } from 'pinia'

export const useSelectedDataStore = defineStore('selectedData', {
  state: () => ({
    selectedData: null,
    vocWindowState: {
      visible: false,
      deviceIndex: null,
      deviceData: null
    },
    centerPoint: null, // 新增中心点状态
  }),
  actions: {
    setSelectedData(data) {
      this.selectedData = data
    },
    setVocWindowState(state) {
      this.vocWindowState = state
    },
    // 新增设置中心点的方法
    setCenterPoint(point) {
      this.centerPoint = point;
    },
  },
})