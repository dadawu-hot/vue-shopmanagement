<template>
  <!-- 头部区域 -->
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="iscollapse ? '64px':'200px'">
          <div class="toggle" @click="toggleColl" >
              |||
          </div>
          <!-- 侧边栏菜单区 -->
        <el-menu  background-color="#333744" text-color="#fff" active-text-color="skyblue" unique-opened :collapse="iscollapse"
        :collapse-transition='false' :router="true" :default-active="activePath">
            <!-- 1级菜单 -->
            <el-submenu :index="item.id + ' '" v-for="item in menuList" :key="item.id">
                <!-- 1级菜单模板 -->
                <template slot="title">
                    <!-- 图标 -->
                    <i :class="iconObj[item.id]"></i>
                    <!-- 文本 -->
                    <span>{{item.authName}}</span>
                </template>
                <!-- 2级菜单 -->
                <el-menu-item :index="'/'+ subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavStatus('/'+ subItem.path)" >
                    <template slot="title">
                    <!-- 图标 -->
                        <i class="el-icon-menu"></i>
                        <!-- 文本 -->
                        <span>{{subItem.authName}}</span>
                    </template>
                </el-menu-item> 
            </el-submenu>
            
        </el-menu>
     </el-aside>
      <!-- 主体 -->
      <el-main>
           <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
    data(){
        return {
            menuList :[],
            iconObj :{
                '125':'iconfont icon-users',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao'
            },
            //是否折叠
            iscollapse:false,
            //被激活的链接地址
            activePath :'',
        }
    },

    created(){
            this.getMenuList();
            this.activePath = window.sessionStorage.getItem('activePath');
        },
    methods: {
        logout() {
        window.sessionStorage.removeItem("token");
        this.$router.push("/login");
        },
        // 获取所有菜单
        async getMenuList(){
            const {data:res} = await this.$http.get('menus');
            if (res.meta.status !==200 )return this.$message.error(res.meta.msg);
            this.menuList = res.data;
            
            console.log(res);
        },
        toggleColl (){
            this.iscollapse=!this.iscollapse;
        },
        // 保存链接地址
        saveNavStatus(index){
            this.activePath = index;
            window.sessionStorage.setItem('activePath',index);
        }
    },
    };
</script>
<style lange='less' scoped>
    .home-container {
    height: 100%;
    }
    .el-header {
    display: flex;
    justify-content: space-between;
    background-color: #373d41;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    }
    .el-header div {
    display: flex;
    justify-content: center;
    align-items: center;
    }
    .el-header span {
    margin-left: 10px;
    }
    .el-aside {
    background-color: #333744;
    }
    .el-main {
    background-color: #eaedf1;
    }
    .el-menu {
        border-right: 0;
    }
    .iconfont {
        margin-right: 5px;
    }
    .toggle {
        background-color: #4a5064;
        text-align: center;
        font-size: 10px;
        color: #fff;
        line-height: 24px;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
</style>