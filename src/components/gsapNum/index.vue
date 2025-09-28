<template>
  <div v-if="show" class="gsapNum numcardItem1">
    <!-- 动态绑定 color 到 style -->
    <span class="gsapNum" ref="number" :style="{ color: color }">{{ formattedNumber }}</span>
  </div>
</template>

<script>
import { gsap } from 'gsap';

export default {
  data() {
    return {
      rawNumber: 0, // 更改为rawNumber，存储实际数字值
      show: true,
      showComma: false, // 是否显示千分位逗号
      decimalPlaces: 0, // 存储最终值的小数位数
    };
  },
  props: {
    number: {
      type: [Number, String],
      default() {
        return 0;
      },
    },
    comma: { // 通过props控制是否显示千分位
      type: Boolean,
      default: false
    },
    delay: {
      type: [Number, String],
      default() {
        return 0;
      },
    },
    color: { // 新增 color 属性
      type: String,
      default: '#FFFFFF' // 默认颜色
    }
  },
  computed: {
    formattedNumber() {
      // 如果是整数，直接显示整数；否则保留传入的小数位数
      const numberFormat = this.decimalPlaces === 0 ? this.rawNumber : parseFloat(this.rawNumber).toFixed(this.decimalPlaces);
      // 如果需要显示千分位逗号，则格式化数字
      if (this.showComma) {
        return numberFormat.toLocaleString();
      }
      return numberFormat;
    },
    currentNumber: {
      get() {
        return this.rawNumber;
      },
      set(value) {
        this.rawNumber = value;
      }
    }
  },
  watch: {
    number(newVal) {
      if (this.show) {
        this.$nextTick(() => {
          this.currentNumber = 0;
          this.decimalPlaces = (newVal.toString().split('.')[1] || '').length; // 更新小数位数
          this.animateNumber(this.currentNumber, newVal);
        });
      }
    },
    show() {
      this.$nextTick(() => {
        this.currentNumber = 0;
        this.decimalPlaces = (this.number.toString().split('.')[1] || '').length; // 更新小数位数
        this.animateNumber(this.currentNumber, this.number);
      });
    },
    comma(newVal) {
      this.showComma = newVal; // 设置是否显示千分位
    }
  },
  methods: {
    animateNumber(start, end) {
      gsap.to(this, {
        currentNumber: end,
        duration: 2,
        delay: parseFloat(this.delay),
        ease: 'power1.out',
        onUpdate: () => {
          // 根据最终值的小数位数格式化当前值
          this.currentNumber = this.decimalPlaces === 0 ? Math.round(this.currentNumber) : parseFloat(this.currentNumber).toFixed(this.decimalPlaces);
        },
      });
    },
  },
  mounted() {
    this.showComma = this.comma; // 初始化时根据props设置是否显示千分位
    this.decimalPlaces = (this.number.toString().split('.')[1] || '').length; // 初始化小数位数
    if (this.show) {
      this.currentNumber = 0;
      this.animateNumber(this.currentNumber, this.number);
    }
  },
};
</script>

<style lang="scss" scoped>
.numcardItem1 {
  .gsapNum {
    width: auto !important;
    font-size: 17px;
    font-family: MicrosoftYaHei;
    font-weight: 700;
    animation: slideUp 1s forwards;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
