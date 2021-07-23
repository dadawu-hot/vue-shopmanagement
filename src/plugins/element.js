import Vue from 'vue'
// import { Button } from 'element-ui'
// import { Form ,FormItem}  from 'element-ui'
// import { Input } from 'element-ui'
// //弹框提示组件
// import {Message} from 'element-ui'

// 导入合并在一起
import {  Button, Form ,FormItem,Input,Message,Container,Aside,Main,Header,
Menu,
Submenu,
Card,
MenuItem,
Breadcrumb,
BreadcrumbItem,
Row,
Col,
Table,
TableColumn,
Switch,
Tooltip,
Pagination,
Dialog,
MessageBox,
Tag,
Tree,
Select,
Option,
Cascader,
Alert,
Tabs,
TabPane,
Steps,
Step,
CheckboxGroup,
Checkbox,
Upload
}  from 'element-ui'


Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

Vue.use(Container)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Header)

Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)

Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)

Vue.use(Card)
Vue.use(Row)
Vue.use(Col)

Vue.use(Table)
Vue.use(TableColumn)

Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)

Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)

Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)

Vue.use(Steps)
Vue.use(Step)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(Upload)




// 弹框组件挂载到vue 原型上，通过this访问
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm

