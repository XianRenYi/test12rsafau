import { defineStore } from "pinia";

export interface DeviceLocation {
  id: string;
  lat: number;
  lng: number;
}

export const useDeviceMapStore = defineStore("deviceMap", {
  state: () => ({
    selectedDevice: null as DeviceLocation | null,
  }),
  actions: {
    setSelectedDevice(device: DeviceLocation | null) {
      debugger
      this.selectedDevice = device;
    },
  },
});