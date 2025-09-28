<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// 响应式数据
const scale = ref<number>(1)
const containerStyle = ref<Record<string, string>>({})
const isFullscreen = ref<boolean>(false)
const resizeTimer = ref<NodeJS.Timeout | null>(null)

// 设计稿尺寸常量
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

// 防抖处理窗口大小变化
const debounceResize = (callback: () => void, delay: number = 100) => {
  if (resizeTimer.value) {
    clearTimeout(resizeTimer.value)
  }
  resizeTimer.value = setTimeout(callback, delay)
}

// 处理窗口大小变化
const handleResize = () => {
  try {
    const windowWidth = document.documentElement.clientWidth
    const windowHeight = document.documentElement.clientHeight
    
    // 防止除零错误
    if (windowWidth <= 0 || windowHeight <= 0) {
      console.warn('Invalid window dimensions:', { windowWidth, windowHeight })
      return
    }

    if (isFullscreen.value) {
      // 全屏模式：使用更激进的缩放策略
      const widthRatio = windowWidth / DESIGN_WIDTH
      const heightRatio = windowHeight / DESIGN_HEIGHT
      scale.value = Math.min(widthRatio, heightRatio)

      containerStyle.value = {
        transform: `scale(${scale.value})`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: '0',
        left: '0',
        width: `${DESIGN_WIDTH}px`,
        height: `${DESIGN_HEIGHT}px`,
      }
    } else {
      // 非全屏模式：居中显示
      scale.value = 1
      containerStyle.value = {
        transform: 'translate(-50%, -50%) scale(1)',
        transformOrigin: 'center center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        height: '100%',
      }
    }
  } catch (error) {
    console.error('Error in handleResize:', error)
  }
}

// 处理全屏状态变化
const handleFullscreenChange = () => {
  try {
    isFullscreen.value = !!document.fullscreenElement
    nextTick(() => {
      handleResize()
    })
  } catch (error) {
    console.error('Error in handleFullscreenChange:', error)
  }
}

// 添加事件监听器
const addEventListeners = () => {
  window.addEventListener('resize', () => debounceResize(handleResize))
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
}

// 移除事件监听器
const removeEventListeners = () => {
  window.removeEventListener('resize', () => debounceResize(handleResize))
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
}

// 生命周期钩子
onMounted(() => {
  addEventListeners()
  nextTick(() => {
    handleResize()
  })
})

onUnmounted(() => {
  removeEventListeners()
  if (resizeTimer.value) {
    clearTimeout(resizeTimer.value)
  }
})
</script>
<template>
  <div 
    class="home-view-container"
    :style="containerStyle"
    :class="{ 'fullscreen-mode': isFullscreen }"
  >
    <div class="content-wrapper">
      <RouterView />
      <MessageContent />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 基础样式重置
:root {
  overflow: hidden;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

// 主容器样式
.home-view-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
  
  // 全屏模式样式
  &.fullscreen-mode {
    .content-wrapper {
      width: 1920px;
      height: 1080px;
    }
  }
  
  // 非全屏模式样式
  &:not(.fullscreen-mode) {
    display: flex;
    align-items: center;
    justify-content: center;
    
    .content-wrapper {
      width: 100%;
      height: 100%;
      max-width: 1920px;
      max-height: 1080px;
    }
  }
}

// 内容包装器
.content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  
  // 确保子元素正确显示
  > * {
    width: 100%;
    height: 100%;
  }
}

// 响应式设计
@media (max-width: 1920px) {
  .home-view-container:not(.fullscreen-mode) {
    .content-wrapper {
      transform: scale(calc(100vw / 1920));
      transform-origin: top left;
    }
  }
}

@media (max-height: 1080px) {
  .home-view-container:not(.fullscreen-mode) {
    .content-wrapper {
      transform: scale(calc(100vh / 1080));
      transform-origin: top left;
    }
  }
}

// 小屏幕适配
@media (max-width: 768px) {
  .home-view-container {
    .content-wrapper {
      transform: scale(0.5);
      transform-origin: top left;
    }
  }
}

// 性能优化
.home-view-container {
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}

// 平滑过渡
.content-wrapper {
  transition: transform 0.3s ease-in-out;
}

// 防止文本选择
.home-view-container {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
