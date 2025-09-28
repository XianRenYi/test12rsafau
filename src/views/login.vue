<template>
  <div class="login">
     
    <div class="main">
   
    <div class="login-logo">
        <img src="../assets/images/loginTitle.jpg" alt="logo" />
      </div>
      <div class="container a-container">
        
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <!-- <h2 class="form_title title">{{ "账号登录" }}</h2> -->

          <el-form-item prop="username" class="custom-form-item">


            <el-input
              class="form__input"
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="账号"
            >
              <template #prefix
                ><svg-icon icon-class="user" class="el-input__icon input-icon"
              /></template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password" class="custom-form-item">
            <el-input
              class="form__input"
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="密码"
              @keyup.enter="handleLogin"
            >
              <template #prefix
                ><svg-icon icon-class="password" class="el-input__icon input-icon"
              /></template>
            </el-input>
          </el-form-item>

          <!-- <el-form-item prop="code" class="custom-form-item">
            <el-input
              class="form__input__code"
              v-model="loginForm.code"
              auto-complete="off"
              :placeholder="'验证码'"
              @keyup.enter="handleLogin"
            >
              <template #prefix
                ><svg-icon icon-class="auth" class="el-input__icon input-icon"
              /></template>
            </el-input>

            <div class="login-code">
              <img :src="codeUrl" @click="getCode" style="float: right" />
            </div>
          </el-form-item> -->

          <!-- <el-form-item :class="{ 'is-null': iscode }">
            <div class="remember">
              <el-checkbox v-model="loginForm.rememberMe" style="margin: 0; color: #000">
                {{ "记住密码" }}
              </el-checkbox>
            </div>
          </el-form-item> -->

          <el-button
            class="form__button button submit"
            v-if="!bindAccount"
            :loading="loading"
            type="primary"
            @click.prevent="handleLogin"
          >
            <span v-if="!loading">{{ "登 录" }}</span>
            <span v-else>{{ "登 录 中..." }}</span>
          </el-button>
        </el-form>
      </div>

      <div class="switch" id="switch-cnt" :class="{ 'is-gx': isGx, 'is-txr': isTxr }">
        <div :class="{ switch__circle: true, 'is-txr': isTxr }"></div>
        <div
          class="switch__container"
          id="switch-c1"
          :class="{ 'is-hidden': isC1Hidden }"
        >
          <!-- <button class="switch__button button switch-btn" @click="changeForm">{{  '短信登录' }}</button> -->
        </div>
        <div
          class="switch__container"
          id="switch-c2"
          :class="{ 'is-hidden': isC2Hidden }"
        >
          <div style="display: flex; align-items: center">
            <h2 class="switch__title title" style="margin-left: 10px"></h2>
          </div>
          <p class="switch__description description"></p>
          <img
            src="../assets/images/login7.jpeg"
            alt="logo"
            style="width: 220px; height: 220px"
          />
        </div>
      </div>
    </div>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>
        Copyright © 2025
        <a target="_blank" href="https://www.cn-senbe.com/"
          >申贝科学仪器（苏州）有限公司</a
        >
      </span>
      <!-- <a target="_blank" href="#">苏ICP备11085033号-5</a> -->
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from "@/store/modules/user";

const title = import.meta.env.VITE_APP_TITLE;
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: "",
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  // code: [{ required: true, trigger: "change", message: "请输入验证码" }],
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(false);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);

watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
  },
  { immediate: true }
);

function handleLogin() {
  proxy.$refs.loginRef.validate((valid) => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore
        .login(loginForm.value)
        .then(() => {
          const query = route.query;
          const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
            if (cur !== "redirect") {
              acc[cur] = query[cur];
            }
            return acc;
          }, {});
          router.push({ path: redirect.value || "/", query: otherQueryParams });
        })
        .catch(() => {
          loading.value = false;
          // 重新获取验证码
          if (captchaEnabled.value) {
            getCode();
          }
        });
    }
  });
}

function getCode() {
  getCodeImg().then((res) => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
  };
}

getCode();
getCookie();
</script>
<style lang="scss" scoped>
*,
*::after,
*::before {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
}
.el-form-item__content {
  margin: 20px;
}

.el-form-item__error {
  margin-top: 10px;
  margin-left: 200px;
}
.loginTitle{
  background: url("../assets/images/loginTitle.jpg");
}

  .login-logo {
    position: absolute;
    top: 2vh;
    left: 20%;
    transform: translateX(-50%);
    z-index: 232;
    display: flex;
    justify-content: center;
    width: 100%;
    
    img {
      max-height: 250px;
      max-width: 350px;
    }
  }
.login {
  height: 100%;
  overflow: auto;
  width: 100%;
  // height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  //background: url('../assets/images/bg.png');
  //background: linear-gradient(to right, #0f73ee 40%, #ffffffc6 40%), url('../assets/images/bg.png');
  background: repeating-linear-gradient(
      to bottom right,
      #cee3fc 20%,
      #a8c7ed87 50%,
      #ffffffe7 50%,
      #ffffffc2 80%
    ),
    url("../assets/images/bg.png");
  color: #a0a5a8;

  .main {
    position: relative;
    width: 1100px;
    // min-width: 1100px;
    // min-height: 600px;
    height: 600px;
    padding: 25px;
    background-color: #fff;
    box-shadow: 10px 0 10px #d0d5dd;
    border-radius: 12px;
    overflow: hidden;
  }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    width: 600px;
    height: 100%;
    padding: 25px;
    background-color: #fff;
    transition: 1.25s;
  }

  .form {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .username {
    position: relative;

    // margin-bottom: 1.5rem;
    .icon {
      position: absolute;
      top: 50%;
      left: 0.5rem;
      transform: translateY(-50%);
      color: #888;
    }

    .form__input {
      padding-left: 2rem;
      /* 确保输入框内文本不会被图标遮挡 */
    }
  }

  .is-null {
    margin-top: 20px;
  }

  .password {
    position: relative;

    .icon {
      position: absolute;
      top: 50%;
      color: #888;
    }

    .icon.left {
      left: 0.5rem;
      transform: translateY(-50%);
    }

    .icon.right {
      right: 0.5rem;
      transform: translateY(-50%);
    }

    .form__input {
      padding-left: 0rem;
      /* 确保输入框内文本不会被左侧图标遮挡 */
      padding-right: 2.5rem;
      /* 确保输入框内文本不会被右侧图标遮挡 */
    }
  }

  .check {
    position: relative;
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;

    // margin-bottom: 1.5rem;
    .icon {
      position: absolute;
      top: 50%;
      left: 0.5rem;
      transform: translateY(-50%);
      color: #888;
    }

    .form__input__code {
      padding-left: 0rem;
      padding-top: 20px;
      /* 确保输入框内文本不会被图标遮挡 */
    }
  }

  .remember {
    padding-top: 15px;
    width: 350px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .other_login {
    width: 350px;
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .other-opt {
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
  }

  .telphone {
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    position: relative;

    // margin-bottom: 1.5rem;
    .icon {
      position: absolute;
      top: 50%;
      left: 0.5rem;
      transform: translateY(-50%);
      color: #888;
    }

    .form__input__code {
      padding-left: 2rem;
      padding-top: 20px;
      /* 确保输入框内文本不会被图标遮挡 */
    }
  }

  .smscode {
    position: relative;

    // margin-bottom: 1.5rem;
    .icon {
      position: absolute;
      top: 50%;
      left: 0.5rem;
      transform: translateY(-50%);
      color: #888;
    }

    .form__input {
    }
  }

  .sendcode {
    width: 34%;
    float: right;
  }

  .form__icon {
    object-fit: contain;
    width: 30px;
    margin: 0 5px;
    opacity: 0.5;
    transition: 0.15s;
  }

  .form__icon:hover {
    opacity: 1;
    transition: 0.15s;
    cursor: pointer;
  }

  .form__input {
    width: 350px;
    height: 40px;
    margin: 4px 0;
    margin-top: 20px;
    padding-left: 0px;
    font-size: 13px;
    letter-spacing: 0.15px;
    border: none;
    outline: none;
    font-family: "Montserrat", sans-serif;
    background-color: #fff;
    transition: 0.25s ease;
    border-radius: 8px;
    box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #f9f9f9;
  }

  .form__input__code {
    width: 66%;
    height: 40px;
    margin: 4px 0;
    margin-top: 20px;
    padding-left: 0px;
    padding-right: 44px;
    font-size: 13px;
    letter-spacing: 0.15px;
    border: none;
    outline: none;
    font-family: "Montserrat", sans-serif;
    background-color: #fff;
  }

  .form__input:focus {
    box-shadow: inset 4px 4px 4px #d1d9e6, inset -4px -4px 4px #f9f9f9;
  }

  .form__input__code:focus {
    box-shadow: inset 4px 4px 4px #d1d9e6, inset -4px -4px 4px #f9f9f9;
  }

  .form__span {
    font-size: 15px;
    margin-top: 5px;
    margin-bottom: 12px;
    color: #0f73ee9e;
  }

  .form__link {
    display: none;
    color: #181818;
    font-size: 15px;
    margin-top: 25px;
    border-bottom: 1px solid #a0a5a8;
    line-height: 2;
  }

  .title {
    font-size: 34px;
    font-weight: 700;
    line-height: 3;
    color: #181818;
  }

  .description {
    font-size: 14px;
    letter-spacing: 0.25px;
    text-align: center;
    line-height: 1.6;
  }

  .button {
    width: 180px;
    height: 50px;
    border-radius: 25px;
    margin-top: 45px;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 1.15px;
    background-color: #0f73ee;
    color: #f9f9f9;
    box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #f9f9f9;
    border: none;
    outline: none;
  }

  /**/
  .a-container {
    z-index: 100;
    left: calc(100% - 600px);
  }

  .b-container {
    left: calc(100% - 600px);
    z-index: 0;
  }

  .switch {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 500px;
    padding: 50px;
    z-index: 200;
    transition: 1.25s;
    background-color: #fff;
    overflow: hidden;
  }

  .switch__circle {
    position: absolute;
    width: 450px;
    height: 450px;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: inset 8px 8px 12px #dde6f4, inset -8px -8px 12px #f9f9f9;
    bottom: -60%;
    left: -60%;
    transition: 1.25s;
  }

  .switch__circle--t {
    top: -30%;
    left: 60%;
    width: 300px;
    height: 300px;
  }

  .switch__container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: absolute;
    width: 400px;
    padding: 50px 55px;
    transition: 1.25s;
  }

  .switch__button {
    cursor: pointer;
  }

  .switch__button:hover {
    box-shadow: 6px 6px 10px #d1d9e6, -6px -6px 10px #f9f9f9;
    transform: scale(0.985);
    transition: 0.25s;
  }

  .switch__button:active,
  .switch__button:focus {
    box-shadow: 2px 2px 6px #d1d9e6, -2px -2px 6px #f9f9f9;
    transform: scale(0.97);
    transition: 0.25s;
  }

  /**/
  .is-txr {
    left: calc(100% - 500px);
    transition: 1.3s;
    transform-origin: left;
  }

  .is-txl {
    left: 0;
    transition: 1.25s;
    transform-origin: right;
  }

  .is-z200 {
    z-index: 200;
    transition: 1.25s;
  }

  .is-hidden {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    transition: 1.25s;
  }

  .is-gx {
    animation: is-gx 1.25s;
  }

  @keyframes is-gx {
    0%,
    10%,
    100% {
      width: 500px;
    }

    30%,
    50% {
      width: 550px;
    }
  }

  .tabs {
    width: 400px;
    border-bottom: none;
    // border: solid white 1px;
    box-shadow: none !important;
  }

  .tabs ::v-deep .el-tabs__nav {
    background-color: white;
    box-shadow: none !important;
    text-decoration: none;
    /* 设置导航栏背景颜色 */
  }

  /*去掉切换时el-tab-pane底部的蓝色下划线*/
  ::v-deep .el-tabs__active-bar {
    background-color: transparent !important;
  }

  /*去掉tabs底部的下划线*/
  ::v-deep .el-tabs__nav-wrap::after {
    position: static !important;
  }

  .tabs ::v-deep .el-tabs__item {
    font-size: 20px;
    /* 设置字体大小 */
    border: none;
    /* 去除默认边框 */
  }

  .bindAccountTitle {
    margin: 0px auto 30px auto;
    text-align: center;
    color: #333;
    font-size: 24px;
  }

  .tabs-login {
    margin: 20px auto 0 auto;
    z-index: 1000;
    max-width: 350px;
  }

  .login-form {
    margin: 10px 0 0 0;
    z-index: 1000;
    max-width: 350px;

    input {
      height: 38px;
      background-color: #f1f1f1;
      color: #666;
    }

    .input-icon {
      height: 39px;
      width: 14px;
      margin-left: 2px;
    }
  }

  .login-code {
    width: 34%;
    float: right;
    padding-top: 14px;
    img {
      cursor: pointer;
      vertical-align: middle;
      border-radius: 3px;
      height: 38px;
    }
  }

  .el-login-footer {
    height: 40px;
    line-height: 40px;
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    color: #333;
    font-family: Arial;
    font-size: 12px;
    letter-spacing: 1px;
  }

  .alert-box-wrap {
    border: 1px solid #f78e21;

    .alert-message-wrap {
      font-size: 14px;
      font-family: "微软雅黑";
      color: rgba(197, 41, 41, 0.856);
      margin-left: 10px;
    }
  }
}

@media (max-width: 1200px) {
  .main {
    transform: scale(0.9);

    .switch {
      width: 40%;
    }

    .container {
      width: 60%;
    }
  }
}

@media (max-width: 1000px) {
  .main {
    transform: scale(0.8);

    .switch {
      width: 40%;
    }

    .container {
      width: 60%;
    }
  }
}

@media (max-width: 800px) {
  .main {
    transform: scale(0.9);
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    height: 100vh;
    /* 设置容器高度为视口高度，实现垂直居中 */
    width: 600px;

    .a-container {
      position: absolute;
      z-index: 100;
      left: 50%;
      /* 将元素的左边缘移动到父容器的水平中心 */
      transform: translateX(-50%);
      /* 通过向左平移自身宽度的一半来实现水平居中 */
    }

    .b-container {
      position: absolute;
      z-index: 100;
      left: 50%;
      /* 将元素的左边缘移动到父容器的水平中心 */
      transform: translateX(-50%);
      /* 通过向左平移自身宽度的一半来实现水平居中 */
    }

    .switch {
      display: none;
    }

    .form__link {
      display: block;
      color: #181818;
      font-size: 15px;
      margin-top: 25px;
      border-bottom: 1px solid #a0a5a8;
      line-height: 2;
    }
  }
}

@media (max-width: 600px) {
  .login {
    background: repeating-linear-gradient(
        to bottom right,
        #cee3fc 20%,
        #a8c7ed87 50%,
        #ffffffe7 50%,
        #ffffffc2 80%
      ),
      url("../assets/images/login.png");

    .main {
      transform: scale(0.9);
      display: flex;
      justify-content: center;
      /* 水平居中 */
      align-items: center;
      /* 垂直居中 */
      height: 75vh;
      width: 100vh;
      box-shadow: 10px 0 10px #5c7aaa;

      .a-container {
        //background: linear-gradient(to bottom, #0f73ee 25%, #ffffff 25%);
        position: absolute;
        width: 100%;
        z-index: 100;
        left: 50%;
        /* 将元素的左边缘移动到父容器的水平中心 */
        transform: translateX(-50%);
        /* 通过向左平移自身宽度的一半来实现水平居中 */
      }

      .switch {
        display: none;
      }

      .b-container {
        position: absolute;
        z-index: 100;
        left: 50%;
        /* 将元素的左边缘移动到父容器的水平中心 */
        transform: translateX(-50%);
        /* 通过向左平移自身宽度的一半来实现水平居中 */
      }

      .form__link {
        display: block;
        color: #181818;
        font-size: 15px;
        margin-top: 25px;
        border-bottom: 1px solid #a0a5a8;
        line-height: 2;
      }
    }
  }
}
</style>
