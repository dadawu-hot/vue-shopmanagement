import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标样式表
import './assets/fonts/iconfont.css'
// 导入依赖
import axios from 'axios'
// 导入TreeTable插件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本框编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本框编辑器对应样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 全局注册
Vue.use(VueQuillEditor)


//组件绑定，挂载原型属性
//配置请求路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
//请求拦截器
axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})
Vue.prototype.$http = axios


Vue.config.productionTip = false

// 全局注册时间格式过滤器
Vue.filter('dataFormat',function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth()+1+'').padStart(2,'0')
  const d = (dt.getDate()+'').padStart(2,'0')

  const hh =(dt.getHours()+'').padStart(2,'0')
  const mm =(dt.getMinutes()+'').padStart(2,'0')
  const ss =(dt.getSeconds()+'').padStart(2,'0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 全局注册为可用组件

Vue.component('tree-table',TreeTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
