<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索框 -->
                <el-row>
                    <el-col>
                        <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable @clear="getOrderList">
                            <el-button slot="append" icon="el-icon-search" @change="getOrderList"></el-button>
                        </el-input>
                    </el-col>
                </el-row>
                <el-table border stripe :data="ordersList">
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column label="订单编号" prop="order_number"></el-table-column>
                    <el-table-column label="订单价格" prop="order_price" width="100px"></el-table-column>
                    <el-table-column label="是否付款"  width="150px">
                        <template v-slot="scope">
                            
                            <el-tag type="warning" v-if="scope.row.pay_status ==='0'">未付款</el-tag>
                            <el-tag type="success" v-else>未付款</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="是否发货" prop="is_send" width="100px"></el-table-column>
                    <el-table-column label="下单时间" prop="role_name">
                        <template v-slot="scope">
                            {{scope.row.create_time|dataFormat}}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template v-slot="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.order_id)"></el-button>
                            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                        </template>

                    </el-table-column>
                </el-table>
                <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[10, 15, 20, 30]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
                </el-pagination>

        </el-card>
<!-- 修改信息对话框 -->
    <el-dialog
        title="物流进度"
        :visible.sync="editDialogVisible"
        width="50%"  @close="editFormClose"
       >
        <el-form ref="editFormRef" :model="editForm" label-width="100px" :rules="editFormRules">
            <el-form-item label="省市区/县" prop="addresss1">
                <el-cascader
                    style="width:100%"
                    v-model="editForm.addresss1"
                    :options="cityDate"
                    :props="{ expandTrigger: 'hover'  }"
                   >
                </el-cascader>
            </el-form-item>
             <el-form-item label="详细地址" prop="addresss2">
                <el-input v-model="editForm.addresss2" ></el-input>
            </el-form-item>
             
        </el-form>
         <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editLocation">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    
    <el-dialog
        title="物流进度"
        :visible.sync="progressDialogVisible"
        width="50%"  @close="editFormClose"
       >
        <el-form ref="editFormRef" :model="editForm" label-width="100px" :rules="editFormRules">
            
    
            <el-timeline >
                <el-timeline-item
                v-for="(activity, index) in pregressInfo"
                :key="index"
                :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
             
        </el-form>
        
    </el-dialog>
    </div>
</template>
<script>
import cityDate1 from './citydata.js'
export default {
    data(){
        return {
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10,


            },
            total:0,
            ordersList:[],
            editDialogVisible : false,
            editForm:{
                addresss1:[],
                addresss2:''
            },
            editFormRules:{
                addresss1:[{ required: true, message: '请选择', trigger: 'blur' },],
                addresss2:[{ required: true, message: '请输入详细地址', trigger: 'blur' },]
            },
            cityDate:cityDate1,
            progressDialogVisible:false,
            pregressInfo:[
                    {
                    "time": "2018-05-10 09:39:00",
                    "ftime": "2018-05-10 09:39:00",
                    "context": "已签收,感谢使用顺丰,期待再次为您服务",
                    "location": ""
                    },
                    {
                    "time": "2018-05-10 08:23:00",
                    "ftime": "2018-05-10 08:23:00",
                    "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
                    "location": ""
                    },
                    {
                    "time": "2018-05-10 07:32:00",
                    "ftime": "2018-05-10 07:32:00",
                    "context": "快件到达 [北京海淀育新小区营业点]",
                    "location": ""
                    },
                    {
                    "time": "2018-05-10 02:03:00",
                    "ftime": "2018-05-10 02:03:00",
                    "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
                    "location": ""
                    }
            ],

        }
    },
    created(){
        this.getOrderList();
    },
    methods:{
        async getOrderList(){
            const {data:res}= await this.$http.get('orders',{params:this.queryInfo})
            if (res.meta.status!==200){
                return this.$message.error('获取订单列表失败')
            }
            this.ordersList = res.data.goods
            this.total  = res.data.total
        },
        handleSizeChange(newsize){
            this.queryInfo.pagesize = newsize
            this.getOrderList();
        },
        handleCurrentChange(newcurre){
            this.queryInfo.pagenum = newcurre;
            this.getOrderList();
        },
        // 编辑地址
        showEditDialog(order_id){
            this.editDialogVisible = true
        },
        editLocation(){

        },
        editFormClose(){
            this.$refs.editFormRef.resetFields();
        },
        async showProgressBox(){
           
            // const {data:res} = await this.$http.get('kuaidi/1106975712662')
            // if(res.meta.status!==200){
            //     return this.$message('获取物流信息失败')
            // }
            // this.pregressInfo = res.data
            this.progressDialogVisible = true
            console.log(this.pregressInfo)


        }
        
    }
}
</script>
<style lang="less" scoped>
.input-with-select {
    width: 300px;
    margin: 15px 0;
}
</style>