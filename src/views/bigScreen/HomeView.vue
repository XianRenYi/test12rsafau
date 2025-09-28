<script setup lang="ts">
import { ref } from "vue";
import { RouterView } from "vue-router";
import ScaleScreen from "@/components/scale-screen";
import Headers from "../bigScreen/header.vue";
import Setting from "../bigScreen/setting.vue";
import { useSettingStore } from "@/store/setting/setting";
import { storeToRefs } from "pinia";
import MessageContent from "@/components/Plugins/MessageContent";

const settingStore = useSettingStore();
const { isScale } = storeToRefs(settingStore);
const wrapperStyle = {};
</script>
<!-- 1920 1080 -->
<template>
  <scale-screen
    width="2560"
    height="1440"
    :delay="500"
    :fullScreen="false"
    :boxStyle="{
      background: '#03050C',
      overflow: isScale ? 'hidden' : 'auto',
    }"
    :wrapperStyle="wrapperStyle"
    :autoScale="isScale"
  >
    <div class="content_wrap">
      <Headers />
      <RouterView />
      <MessageContent />
    </div>
  </scale-screen>
  <Setting />
</template>
<style lang="scss" scoped>
.content_wrap {
  padding: 0 20px; /* 默认边距 */
}

/* 在小屏幕上减少边距 */
@media (max-width: 1200px) {
  .content_wrap {
    padding: 0 10px;
  }
}

/* 在非常小的屏幕上使用更小的边距 */
@media (max-width: 768px) {
  .content_wrap {
    padding: 0 5px;
  }
}
</style>
