/**
* @Author: 858834013@qq.com
* @Name: monitorEnter
* @Date: 2022-07-09
* @Desc: 监听回车
*/
<template>
  <div>
  </div>
</template>
<script>
export default {
  name: "monitorEnter",
  mounted() {
    window.addEventListener('keydown', this.keyDown);
  },
  //销毁事件
  destroyed() {
    window.removeEventListener('keydown', this.keyDown, false);
  },
  methods: {
    keyDown(e) {
      var that = this;
      if (e.keyCode == 13) {
        that.$emit('monitorEnter', 0)
      }
    },
  }
}
</script>
