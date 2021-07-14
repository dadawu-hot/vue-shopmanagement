import Vue from 'vue'
// import { Button } from 'element-ui'
// import { Form ,FormItem}  from 'element-ui'
// import { Input } from 'element-ui'
// //弹框提示组件
// import {Message} from 'element-ui'

// 导入合并在一起
import {  Button, Form ,FormItem,Input,Message}  from 'element-ui'


Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 弹框组件挂载到vue 原型上，通过this访问
Vue.prototype.$message = Message

