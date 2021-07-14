<template>
<!-- 结构 -->

    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登路表单区域 -->
            <el-form ref="loginFormRef" class="login_form" :model="loginForm" :rules="loginFromRules">
                <!-- USER -->
                <el-form-item prop='username'>
                    <el-input  prefix-icon="iconfont icon-user" v-model="loginForm.username" ></el-input>
                </el-form-item>
                <!-- PASSWORD -->
                <el-form-item prop='password'>
                    <el-input type="password" prefix-icon="iconfont icon-3702mima" v-model="loginForm.password"></el-input>
                </el-form-item>
                <!-- BUTTON -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登陆</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>

</template>

<script>
// 行为
export default {
    data(){
        return {
            loginForm:{
                username:'admin',
                password:'123456'
            },
            // 表单的验证规则对象
            loginFromRules:{
                username:[
                    { required: true, message: '请输入登录名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
            }
        }
    },
    methods:{
        // 表单重置按钮
        resetLoginForm(){
            console.log(this);
            this.$refs.loginFormRef.resetFields();
        },
        login(){
             this.$refs.loginFormRef.validate(async valid=>{
                //  console.log(valid);
                 if(!valid) return;
                 const {data:res} = await this.$http.post('login',this.loginForm);
                 console.log(res);//promise对象
                 // 登录失败，消息提示element ui message
                 if(res.meta.status !== 200){
                   return this.$message.error('登陆失败');
                 }else {
                     this.$message.success('登陆成功');
                    //将登陆成功之后的token保存到客户端的seeeionStorage;项目中除了登陆之外的其他API，必须在登陆哦之后才能访问
                            //token 只能在当前网站打开期间生效，所以将token保存在sessionStorage
                            // 后台路由地址：/home
                            // token 在res data中
                     window.sessionStorage.setItem('token',res.data.token);
                     // 页面跳转
                     this.$router.push('/home');
                 }

             });
        }
    }
}
</script>
<style lang="less" scoped>
/* // 样式；lang:语法；scoped指令，控制样式生成，表示只在当前组件内生效；防止组件之间的样式冲突 */
.login_container {
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    background-color: #2b4b6b;
    height: 100%;
   
}
.login_box {
    margin: 0 auto;
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;

}
.avatar_box {
    height: 130px;
    width: 130px;
    background-color: #fff;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    margin: 0 auto;
    margin-top:-65px;
    img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }

}
.btns {
    display: flex;
    justify-content: flex-end;
}
.login_form {
    margin-top: 25px;
    padding:0 20px ;
}
</style>