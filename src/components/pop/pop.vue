<template>
  <div>
    <teleport to="body">
      <div class="popWin" v-if="show">
        <div class="popWinBg" v-if="show"></div>
        <div class="popWinMain" ref="popWinMain" v-if="show">
          <div class="popWinMainInner">
            <!-- <bg></bg> -->
            <div class="titleBody" ref="titleBody" v-if="showInner">
              <span>{{ title }}</span>
            </div>
            <div class="popClose" ref="popClose" v-if="showInner" @click="getHide"></div>
            <div class="slot" v-if="showInner">
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import gsap from "gsap";
import bg from "./bg.vue";

export default {
  data() {
    return {
      show: false,
      showInner: false,
    };
  },
  components: { bg },
  props: {
    title: {
      type: String,
      default: "标题",
    },
  },
  methods: {
    getShow() {
      this.show = true;
      this.$nextTick(() => {
        gsap.to(this.$refs.popWinMain, {
          duration: 1,
          width: "1800px",
          onComplete: () => {
            this.showInner = true;
            this.$nextTick(() => {
              gsap.to(this.$refs.popClose, {
                transform: "rotateX(180deg)",
              });
              gsap.to(this.$refs.titleBody, {
                top: "-8px",
              });
            });
          },
        });
      });
    },
    getHide() {
      this.showInner = false;
      gsap.to(this.$refs.titleBody, {
        opacity: 0,
      });
      this.$nextTick(() => {
        gsap.to(this.$refs.popWinMain, {
          width: "0%",
          onComplete: () => {
            this.show = false;
          },
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.popWinBg {
  position: fixed;
  z-index: 8;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: initial;
}

.titleBody {
  overflow: auto; // 确保内容超出时可滚动
  height: 700px;
  max-height: 700px;
  font-size: 25px;
  background: url("./assets/titlebg.png") center center no-repeat;
  // background-size: 100% 100%;
  //width: 40%;
  margin: auto;
  height: 79px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;
  top: -50px;
  opacity: 1;
  z-index: 0;

  span {
    font-size: 25px;
    font-family: PangMenZhengDao;
    font-weight: 400;
    color: #ffffff;
    line-height: 32px;
    text-shadow: 0px 2px 3px rgba(17, 20, 22, 0.31);
  }
}

.popWin {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;
  position: fixed;
  z-index: 10;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  pointer-events: none;
}

.popWinMainInner {
  pointer-events: initial;
  position: relative;
  width: calc(100% - 20px);
  height: calc(100% - 0px);
  background: url("./assets/popbg.png") no-repeat;
  background-size: 100% 100%;
}

.popWinMain {
  pointer-events: initial;
  position: relative;
  overflow: hidden;
  width: 1300px;
  max-width: 1300px;
  height: 700px;
  max-height: 700px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;
  z-index: 100;

  .slot {
    position: absolute;
    top: 65px;
    left: 30px;
    width: calc(100% - 60px);
    height: calc(100% - 100px);
    //background: red;
  }
}

.popClose {
  position: absolute;
  right: 10px;
  top: 10px;
  background: url("./assets/icon_close.png") no-repeat;
  width: 64px;
  height: 64px;
  background-size: 100% 100%;
  cursor: pointer;
  z-index: 1;
}
</style>
