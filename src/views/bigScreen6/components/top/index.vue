<template>
  <div class="headers">
    <sequence></sequence>
    <div class="headersLeft wow fadeInLeft" data-wow-delay="1s">
      
     <dayTime></dayTime>
    </div>
    <div class="headerTitle wow flipInX"  style="    margin: -43px;"  data-wow-delay="1s">
      <p>{{title}}</p>
    </div>
    <div class="headersRight wow fadeInRight">
      <!-- <dayTime></dayTime> -->
     <!-- <span>控制台</span> -->

     <span class="arrow - icon" style="      margin-right: 0px;  padding-top: 10px;" @click="retunnBack()">   
      <svg t="1752480891830" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="32149" width="16" height="16"><path d="M179.2 240.57856a30.72 30.72 0 0 0 0 61.44h204.8a30.72 30.72 0 0 0 0-61.44H179.2zM179.2 394.17856a30.72 30.72 0 0 0 0 61.44h153.6a30.72 30.72 0 0 0 0-61.44H179.2zM179.2 547.77856a30.72 30.72 0 0 0 0 61.44h153.6a30.72 30.72 0 1 0 0-61.44H179.2z" p-id="32150" fill="#2dafe9"></path><path d="M686.08 245.69856a30.72 30.72 0 0 1 30.72-30.72c63.49312 0 104.28416 32.56832 127.95904 68.08064 22.55872 33.8432 30.76096 71.76704 30.76096 90.63936a30.72 30.72 0 0 1-30.72 30.72h-128a30.72 30.72 0 0 1-30.72-30.72v-128z m61.44 35.26144v62.01856h59.27424a128.96256 128.96256 0 0 0-13.15328-25.84064c-10.34752-15.51872-24.88832-29.3376-46.12096-36.17792z" p-id="32151" fill="#2dafe9"></path><path d="M628.28544 281.1392a30.72 30.72 0 0 0-15.3856-59.47904C522.49088 245.04832 455.68 327.13216 455.68 424.9088c0 115.93728 93.98272 209.92 209.92 209.92 98.73408 0 181.48352-68.13696 203.91936-159.91808a30.72 30.72 0 1 0-59.67872-14.592c-15.872 64.9216-74.4704 113.07008-144.24064 113.07008-82.00192 0-148.48-66.47808-148.48-148.48 0-69.08416 47.2064-127.21664 111.16544-143.75936z" p-id="32152" fill="#2dafe9"></path><path d="M35.77856 157.1328c0-49.95584 40.4992-90.45504 90.45504-90.45504h776.53504c49.95584 0 90.44992 40.4992 90.44992 90.45504v537.6c0 49.95584-40.49408 90.45504-90.44992 90.45504H126.2336c-49.95584 0-90.45504-40.4992-90.45504-90.45504v-537.6z m90.45504-29.01504a29.01504 29.01504 0 0 0-29.01504 29.01504v537.6a29.01504 29.01504 0 0 0 29.01504 29.01504h776.53504a29.01504 29.01504 0 0 0 29.00992-29.01504v-537.6a29.01504 29.01504 0 0 0-29.00992-29.01504H126.2336z" p-id="32153" fill="#2dafe9"></path><path d="M240.57856 932.3008a30.72 30.72 0 0 1 30.72-30.72h477.87008a30.72 30.72 0 0 1 0 61.44H271.29856a30.72 30.72 0 0 1-30.72-30.72z" p-id="32154" fill="#2dafe9"></path></svg>
       
    </span>
    
     <span class="arrow - icon" style="     margin-right: -20px;   padding-top: 10px;" @click="logout()">   
      <svg t="1752480145139" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17449" width="16" height="16"><path d="M950.784 406.016c-8.192-34.304-20.48-67.072-35.84-97.792s-34.816-59.904-57.856-87.04-49.152-51.2-77.312-72.704c-14.848-10.752-30.72-14.848-48.128-12.288s-31.232 11.264-41.984 25.6-14.848 30.208-12.288 47.616 11.264 31.744 25.6 42.496c42.496 31.232 75.264 69.12 97.792 114.176s33.792 93.696 33.792 145.408c0 44.544-8.192 86.528-25.6 125.952-16.896 39.424-39.936 73.728-69.632 102.912s-64 52.736-103.424 69.632-81.92 25.6-126.464 25.6-86.528-8.704-126.464-25.6-73.728-40.448-103.424-69.632c-29.184-29.184-52.736-63.488-70.144-102.912s-26.112-81.408-26.112-125.952c0-52.736 12.288-102.4 36.352-148.992 24.576-46.592 58.368-85.504 102.4-115.712 14.848-10.24 24.064-24.064 26.624-41.472 3.072-17.408-0.512-33.792-10.752-48.64-10.24-14.336-24.064-23.04-41.472-25.6-17.408-3.072-33.792 0.512-48.64 10.752-30.208 21.504-57.344 46.08-81.408 73.216-24.064 27.136-44.032 56.832-60.928 88.576-15.36 31.232-28.16 65.024-36.864 100.352s-13.312 71.168-13.312 107.52c0 62.464 11.776 121.344 35.84 176.128s56.32 102.912 97.28 143.36c40.96 40.96 89.088 73.216 143.872 96.768 55.296 24.064 114.176 35.84 177.152 35.84 62.464 0 120.832-11.776 176.128-35.84s103.424-56.32 144.384-96.768c41.472-40.96 73.728-88.576 97.28-143.36s35.328-113.664 35.328-176.128c1.024-35.84-3.584-70.656-11.776-105.472z m-437.248 133.12c16.384 0 30.72-5.632 42.496-17.408s17.92-26.112 17.92-42.496V116.736c0-16.384-5.632-30.72-17.92-43.008-11.776-11.776-26.112-17.92-42.496-17.92-17.408 0-31.744 6.144-43.52 17.92s-17.92 26.624-17.92 43.008v362.496c0 16.384 5.632 30.72 17.92 42.496 11.776 11.776 26.112 17.408 43.52 17.408z" fill="#2dafe9" p-id="17450"></path></svg>
     
    </span>

     

   </div>
  </div>
</template>

<script>
import sequence from "./sequence/index.vue";
import dayTime from "./dayTime.vue";
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()

export default {
  name: "pageTop",
  components: {sequence, dayTime},
  data() {
    return {
     
    }
  },
  props: {
    title: {
      type: String,
      default() {
        return '';
      }
    }
  },
  mounted() {

  },
  methods: {

    retunnBack()  {
    // router.push({
    // path: '/index'
    // });

    this.$router.push({
      path: '/index'
    });

  },

  logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
     
        userStore.logOut().then(() => {
      location.href = '/index';
    })


    this.$router.push({
      path: '/login?redirect=/index'
    });


      }).catch(() => {
        // 用户点击取消，什么也不做
      });
    }

  }
}
</script>

<style lang="scss" scoped>

.butTop {
  position: absolute;
  right: 152px;
  top: 53px;
  border: 1px solid #2dafe9;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 2px;
  border-radius: 5px;
  transition: all 0.3s ease; /* 添加过渡效果 */
  box-shadow: inset 0 0 10px rgba(45, 175, 233, 1); /* 内发光效果 */
}

.butTop:hover {
  background-color: rgba(45, 175, 233, 0.2); /* 背景颜色变化 */
  border-color: #00bfff; /* 边框颜色变化 */
  box-shadow: inset 0 0 15px rgba(45, 175, 233, 1), 0 0 10px rgba(45, 175, 233, 0.5); /* 内发光增强 + 外发光效果 */
  transform: scale(1.05); /* 轻微放大 */
}

.butTopTwo {
  position: absolute;
  right: 252px;
  top: 53px;
  border: 1px solid #2dafe9;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 2px;
  border-radius: 5px;
  transition: all 0.3s ease; /* 添加过渡效果 */
  box-shadow: inset 0 0 10px rgba(45, 175, 233, 1); /* 内发光效果 */
}

.butTopTwo:hover {
  background-color: rgba(45, 175, 233, 0.2); /* 背景颜色变化 */
  border-color: #00bfff; /* 边框颜色变化 */
  box-shadow: inset 0 0 15px rgba(45, 175, 233, 1), 0 0 10px rgba(45, 175, 233, 0.5); /* 内发光增强 + 外发光效果 */
  transform: scale(1.05); /* 轻微放大 */
}


.headers {
  width: 100%;
  height: 300px;
  position: fixed;
  top: 0;
  left: 0;
  background: url("./assets/topbg.png") top center no-repeat;
  background-size: 100% 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: nowrap;
  flex-direction: row;
  align-content: flex-start;

  .headersLeft {
    width: calc(30% - 40px);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    align-content: flex-start;
    padding-top: 23px;
    padding-left: 40px;

    .weather {
      margin-left: 40px;

      span {
        font-size: 14px;
        font-family: MicrosoftYaHei;
        font-weight: 400;
        color: #FE8510;
        opacity: 0.8;
        margin-left: 4px;
      }

      img {
        width: 14px;
        height: 13px;
      }
    }

    .temperature {
      font-size: 14px;
      font-family: MicrosoftYaHei;
      font-weight: 400;
      color: #45BEFF;
      opacity: 0.8;
      margin-left: 15px;
    }

    .address {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
      align-content: flex-start;

      span {
        font-size: 14px;
        font-family: MicrosoftYaHei;
        font-weight: 400;
        color: #45BEFF;
        margin-left: 6px;
      }

      img {
        width: 13px;
        height: 14px;
      }
    }
  }

  .headerTitle {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    align-content: flex-start;
    padding-top: 10px;

    p {
      color: #f9fffd;
      font-size: 40px;
      text-align: center;
      font-family: PangMenZhengDao;
      font-weight: 700;
      text-shadow: 0px 0.02604rem 0.10417rem #09d7f1;
      letter-spacing: .01563rem;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      flex-direction: row;
    }
  }
 
 

  .select-wrapper {
    position: relative;
    display: inline - block;
  }
  
  .display-text {
    font-size: 16px;
    color: #ffffff;
  }
  
  .arrow-icon {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 12px;
    color: #ffffff;
  }
  
  select {
    opacity: 0;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  .headersRight {
    width: calc(30% - 38px);
    padding-right: 38px;
    height: 24px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
    align-content: flex-start;
    color: #fff;
    font-size: 16px;
    margin-top: 20px;

    .userhead {
      width: 23px;
      height: 22px;
    }

    .suoxiao {
      width: 18px;
      height: 18px;
    }

    span {
      font-size: 16px;
      font-family: PingFang;
      font-weight: 500;
      color: #01AAFF;
      margin-left: 10px;
      margin-right: 14px;
    }
  }
}
</style>
