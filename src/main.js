import { createApp } from 'vue'
import './utils/flexible'
import App from './App'
import router from './router'
import { createPinia } from 'pinia'
import Cookies from 'js-cookie'
import ElementPlus from 'element-plus'
import './fonts/icomoon/style.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import locale from 'element-plus/es/locale/lang/zh-cn'
import * as echarts from 'echarts';

import '@/assets/styles/index.scss' // global css

import store from './store'
import directive from './directive' // directive

import '@/assets/css/main.scss'
import '@/assets/css/tailwind.css'
import {registerEcharts} from "@/plugins/echarts"
import {VueSeamlessScroll} from '@meruem117/vue-seamless-scroll'


// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'
import DataVVue3 from '@kjgl77/datav-vue3'
import './permission' // permission control

import { useDict } from '@/utils/dict'
import { parseTime, resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi'

// 全局报警弹窗插件
import AlarmModalPlugin from '@/plugins/alarmModal'

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 字典标签组件
import DictTag from '@/components/DictTag'

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels
app.config.globalProperties.$echarts = echarts


// 全局组件挂载
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)

app.use(VueSeamlessScroll)
app.use(router)
app.use(store)
app.use(plugins)
app.use(DataVVue3)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)
registerEcharts(app)
app.use(createPinia())
directive(app)

// 使用全局报警弹窗插件
app.use(AlarmModalPlugin, {
  showTriggerButton: false // 不显示触发按钮
})

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  // 支持 large、default、small
  size: Cookies.get('size') || 'default'
})

app.mount('#app')
