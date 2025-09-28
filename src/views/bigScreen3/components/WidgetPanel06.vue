<template></template>

<style lang="scss" scoped>
@keyframes row-out {
  from {
    top: 0;
  }
  to {
    top: -36px;
  }
}
.wrap {
  height: 100%;
  overflow: hidden;
}
.item-list {
  display: flex;
  flex-direction: column;
  grid-gap: 8px;
  height: 670px;

  // overflow: hidden;
  &.scroll {
    position: relative;
    animation: row-out 1s linear forwards;
    .row:first-child {
      opacity: 0;
      transition: opacity 1s;
    }
  }
  .item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 5px;
    font-size: 16px;
    .item-circle {
      position: absolute;
      left: 10px;
      width: 5px;
      height: 10px;
    }
    .item-name {
      width: 50%;
      padding-left: 15px;
    }
    .item-type {
      width: 30%;
    }
    .item-time {
      width: 20%;
      text-align: end;
    }
  }
}
</style>
