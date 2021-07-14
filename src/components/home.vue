<template>
    <div>
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>
<script>
export default {
    methods:{
        logout(){
            window.sessionStorage.removeItem('token');
            this.$router.push('/login');
        }
    }
}
</script>
<style lange='less' scoped>

</style>