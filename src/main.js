import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标样式表
import './assets/fonts/iconfont.css'
import axios from 'axios'

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

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
