import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login'
import Home from '../components/home'

Vue.use(VueRouter)

// 路由规则
const routes = [
  {path:'/',redirect:'/login'},
  {path:'/login',component:Login},
  {path:'/home',component:Home}
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫；登录后才能访问其他页面
router.beforeEach((to,from,next)=>{
  // to:将要访问的路劲；from:从哪个路劲跳转；next:函数，表示放行
  if (to.path === '/login') return next();
  // 获取token
  const tokenstr = window.sessionStorage.getItem('token');
  if (!tokenstr) return next('/login');
  next();
})


export default router
