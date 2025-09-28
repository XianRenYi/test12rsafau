<template>
  <LayoutPanel title="主变电负荷电流变化">
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>
<script setup lang="ts">
import LayoutPanel from './LayoutPanel.vue'
import { nextTick, onMounted } from 'vue'
import { sampleSize, range } from 'lodash'
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
