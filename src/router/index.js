import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login'
import Home from '../components/home'
import Welcome from '../components/welcome'
import Users from '../components/user/users'
import Rights from '../components/power/rights'
import Roles from '../components/power/roles'
import Cates from '../components/goods/cates'
import Params from '../components/goods/params'

// import { component } from 'vue/types/umd'

Vue.use(VueRouter)

// 路由规则
const routes = [
  {path:'/', redirect:'/login'},
  {path:'/login', component: Login},
  { 
    path:'/home',
    component: Home ,
    redirect:'/welcome',
    children:[{path: '/welcome', component: Welcome},
    {path:'/users', component: Users},
    {path:'/rights', component: Rights},
    {path:'/roles', component: Roles},
    {path:'/categories', component: Cates},
    {path:'/params', component: Params},

  ]
  },

  
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
