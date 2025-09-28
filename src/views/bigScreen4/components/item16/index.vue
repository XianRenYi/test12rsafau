<template>
  <div class="project-intro">
    <!-- 优化后的项目简介 -->
    <div class="content showSpan17">
      <div class="containerNum">
        <span class="title">{{ showTitle }}</span>
        <!-- 显示名称 -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProjectIntro",
  data() {
    return {
      showTitle:
        "绍兴市芯联集成电路制造股份有限公司的气体在线监控系统，可24小时实时监测厂区内各生产点位的VOC气体浓度变化，并自动生成波动趋势曲线。数据异常时，系统立即触发联动响应：现场启动声光报警，同时监控平台发送报警信息给责任人。既保障了作业人员的生命安全，又能有效预防因气体泄露造成的财产损失。",
    };
  },
};
</script>

<style lang="scss" scoped>
.containerNum {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: column;
  align-content: flex-start;
}

.showSpan17 {
  text-indent: 2em;
  margin-bottom: 32px;
  font-size: 17px;
  font-family: MicrosoftYaHei;

  color: #fff;
  margin-left: 10px;
  background: linear-gradient(180deg, #fff, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.project-intro {
  padding: 12px;
  border-radius: 8px;
  color: #e6f7ff; // 文字颜色为浅蓝色

  .content p {
    text-indent: 2em;
    margin-bottom: 16px;
  }
  .content {
    line-height: 1.8;
    p {
      margin-bottom: 16px;
    }

    .feature-title {
      font-weight: 500;
      color: #1890ff;
      margin-top: 20px;
    }

    .features {
      list-style: none;
      padding-left: 0;
      margin-bottom: 20px;

      li {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .icon-monitor,
        .icon-alarm,
        .icon-sync {
          display: inline-block;
          width: 24px;
          height: 24px;
          margin-right: 8px;
          background-size: cover;

          &.icon-monitor {
            background-image: url("monitor-icon.png");
          }
          &.icon-alarm {
            background-image: url("alarm-icon.png");
          }
          &.icon-sync {
            background-image: url("sync-icon.png");
          }
        }

        span {
          flex: 1;
        }
      }
    }

    .highlight {
      color: #1890ff;
      font-size: 18px;
      text-align: center;
      margin-top: 24px;
      font-weight: 500;
    }

    strong {
      color: #e6f7ff;
      font-weight: 500;
    }
  }
}
</style>
