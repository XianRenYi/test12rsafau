<template>
  <LayoutPanel title="故障对比">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import { nextTick, onMounted } from 'vue'
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
