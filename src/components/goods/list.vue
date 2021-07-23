<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 搜索框 -->
            <el-row>
                <el-col>
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>  
                <el-table-column label="创建时间" prop="add_time" width="140px" >
                     <template v-slot='scope'>
                         {{scope.row.add_time | dataFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template v-slot='scope'>
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEdieDialog(scope.row.goods_id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>

            </el-table>
            <!-- 分页导航 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[8, 20, 30, 40]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            background>
            </el-pagination>
    
        </el-card>
        
    </div>
</template>
<script>
export default {
    data(){
        return {
            // 请求参数
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:8,
            },
            total:0,
            goodsList:[]
        }
    },
    created(){
        this.getGoodsList();
    },
    methods:{
        async getGoodsList(){
            const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
            if(res.meta.status!==200){
                return this.$message.error('获取商品列表失败')
            }
            console.log(res.data)
            this.goodsList = res.data.goods;
            this.total = res.data.total
        },
        // 监听页码数
        handleSizeChange(newsize){
            this.queryInfo.pagesize = newsize;
            this.getGoodsList();
        },
        // 监听每页显示数
        handleCurrentChange(newsize){
            this.queryInfo.pagenum = newsize;
            this.getGoodsList();
        },
        // 修改弹框
        showEdieDialog(goodsId){
            console.log('编辑'+goodsId)
        },
        // 通过id删除商品
        async removeGoodsById(goodsId){
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch (err=>err)
            // 如果用户点击确定删除，则confirmResult 返回的是字符串 confirm；点击删除 返回字符串cancle
            // console.log(confirmResult);
            if (confirmResult !== 'confirm'){
                return this.$message.info('已经取消删除！')
            }else{
                const {data:res} = await this.$http.delete('goods/'+goodsId)
                if(res.meta.status!==200){
                    return this.$message.error('删除商品列表失败')
                }
                this.$message.success('删除商品成功')
                this.getGoodsList();
            }
           
        },
        // 添加商品页面
        goAddPage(){
            this.$router.push('/goods/add')
        }
    }
}
</script>
<style lang="less" scoped>
.input-with-select {
    width: 300px;
    margin-right: 20px;
}
</style>