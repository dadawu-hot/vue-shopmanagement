<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 警告 -->
            <el-alert title="注意：只允许第三级分类设置相关参数" type="warning" :closable="false" show-icon></el-alert>
            <!-- 选择商品分类 -->
            <el-row class="catpar">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 级联选择框 -->
                    <el-cascader
                        v-model="selectedKeys"
                        :options="catsList"
                        :props="{ expandTrigger: 'hover' ,value:'cat_id',label:'cat_name',children:'children'}"
                        @change="parentCatsChange"
                        :clearable='true'
                        >
                    </el-cascader>
                </el-col>
            </el-row>
             <!-- tab 导航 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数面板 -->
                <el-tab-pane label="动态参数" name="many">
                     <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDatadialogVisible=true">添加参数</el-button>
                     <!-- 动态参数 表格 -->
                     <el-table :data="manyTabData" border stripe>
                         <!-- 展开项 -->
                         <el-table-column type="expand">
                            <template v-slot='scope'>
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i"  closable @close='handleClose(i,scope.row)'>{{item}}</el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                    >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>

                         </el-table-column>
                         <el-table-column type="index"></el-table-column>
                         <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                         <el-table-column label="操作" >
                            <template v-slot="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditData(scope.row)">编辑</el-button>
                                <el-button type="warning" icon="el-icon-delete" size="mini" @click="deleteData(scope.row)">删除</el-button>
                            </template>
                         </el-table-column>
                     </el-table>
                </el-tab-pane>
                   
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDatadialogVisible=true">添加属性</el-button>
                    <el-table :data="onlyTabData" border stripe>
                          <el-table-column type="expand">
                            <template v-slot='scope'>
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i"  closable @close='handleClose(i,scope.row)'>{{item}}</el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                    >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>

                         </el-table-column>
                         <el-table-column type="index"></el-table-column>
                         <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                         <el-table-column label="操作" >
                            <template v-slot="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditData(scope.row)">编辑</el-button>
                                <el-button type="warning" icon="el-icon-delete" size="mini" @click="deleteData(scope.row)">删除</el-button>
                            </template>
                         </el-table-column>
                     </el-table>
                </el-tab-pane>
                    
            </el-tabs>
        </el-card>
        <!-- 添加参数对话框 (静态和动态公用)-->
        <el-dialog
            :title="titleText"
            :visible.sync="addDatadialogVisible"
            width="50%"
            @close="addDataFormClose"

            >
            <el-form :model="addDataList" :rules="addDataFormRules" ref="addDataFormRef" label-width="100px" >
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addDataList.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDatadialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addManyData">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改参数对话框 -->
        <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editiDatadialogVisible"
            width="50%"
            @close="editDataFormClose"

            >
            <el-form :model="editDataList" :rules="editDataFormRules" ref="editDataFormRef" label-width="100px" >
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editDataList.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editiDatadialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editManyData">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return {
            catsList:[],
            // 级联选择框双向绑定的id
            selectedKeys:[],
            // 被激活的页签的名称
            activeName:'many',
            manyTabData:[],
            onlyTabData:[],
            // 添加动态参数对话框
            addDatadialogVisible:false,
            addDataList:{
                attr_name:''
            },
            addDataFormRules:{
                attr_name:[{ required: true, message: '请输入参数名称', trigger: 'blur' }]
            },
            // 修改参数对话框
            editiDatadialogVisible:false,
            editDataList:{
                
            },
            editDataFormRules:{
                attr_name:[{ required: true, message: '请输入参数名称', trigger: 'blur' }]
            },
            // 展开项数据
            expandList:['大戴女士','小琪琪','客服','你回复'],
   

        }
    },
    created(){
        this.getCatsData();
    },
    methods:{
        async getCatsData(){
            const {data:res} = await this.$http.get('categories');
            if(res.meta.status!==200){
                return this.$message.error('获取所有分类商品失败！')
            }
            this.catsList = res.data
            console.log(this.catsList)

        },
        async getParamsData(){
             if (this.selectedKeys.length!==3){
                this.selectedKeys=[];
                this.manyTabData=[];
                this.onlyTabData=[]
                return 
            }
            //级联选择的时候就获取面板的数据
            const {data:res} = await this.$http.get(`categories/${this.cateID}/attributes`,{params:{sel:this.activeName}})
            if(res.meta.status!==200){
                return this.$message.error('获取面板信息失败')
            }
            console.log(res.data)
            res.data.forEach(item=>{
                item.attr_vals= item.attr_vals ? item.attr_vals.split(' '):[]
                // 每一行数据都有自己的输入值
                item.inputVisible = false
                item.inputValue = ''
            })

            // 静态和动态不同的数据存在不同的数组，用来渲染表格
            if(this.activeName === 'many'){
                this.manyTabData = res.data
            }else{
                this.onlyTabData = res.data
            }
           
        },
        // 级联选择框变化触发的方法
        parentCatsChange(){
           this.getParamsData();
        },
        // tab 点击事件处理函数
        handleTabClick(){
            // console.log(this.activeName)
            // 获取对应的参数，展示相应的面板
            this.getParamsData();
        },
        // 关闭添加动态参数对话框
        addDataFormClose(){
            this.$refs.addDataFormRef.resetFields()
        },
        // 提交添加属性表单
        addManyData(){
            this.$refs.addDataFormRef.validate(async valid=>{
                if(!valid)return 
                const {data:res} = await this.$http.post(`categories/${this.cateID}/attributes`,
                {attr_name:this.addDataList.attr_name,attr_sel:this.activeName})
                console.log(res)
                if(res.meta.status!==201){
                    return this.$message.error('添加参数失败')
                }
                this.$message.success('添加参数成功')
                this.getParamsData();
                this.addDatadialogVisible=false;
            })
            
        },
        //点击按钮显示修改对话框
        async showEditData(row){
            const {data:res} = await this.$http.get(`categories/${this.cateID}/attributes/${row.attr_id}`,{params:{attr_sel:this.activeName}})
            if(res.meta.status!==200){
                return this.$message.error('获取参数信息失败')
            }
            this.editDataList = res.data
            this.editiDatadialogVisible=true;
            
        },
        editDataFormClose(){
            this.$refs.editDataFormRef.resetFields()
        },
        editManyData(){
             this.$refs.editDataFormRef.validate(async valid=>{
                if(!valid)return 
                const {data:res} = await this.$http.put(`categories/${this.cateID}/attributes/${this.editDataList.attr_id}`,
                {attr_name:this.editDataList.attr_name,attr_sel:this.activeName});
                if(res.meta.status!==200){
                    return this.$message.error('修改参数信息失败')
                }
                console.log(res)
                this.$message.success('修改参数成功')
                this.getParamsData();
                this.editiDatadialogVisible=false

            })
        },
        // 删除按钮
        async deleteData(row){
            const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch (err=>err);
            if (confirmResult !== 'confirm'){
                return this.$message.info('已经取消删除！')
            }else{
                const {data:res}  = await this.$http.delete(`categories/${this.cateID}/attributes/${row.attr_id}`)
                if(res.meta.status!==200){
                    return this.$message.error('删除参数信息失败')
                }
                this.getParamsData();
                this.$message.success('删除参数成功')
                
            }
        },
        // 删除参数可选项
        handleClose(i,row){
            row.attr_vals.splice(i,1);
            this.saveAttrvals(row);

        },
        async saveAttrvals(row){
             // 发起请求，保存参数
            const {data:res} = await this.$http.put(`categories/${this.cateID}/attributes/${row.attr_id}`,
            {attr_name:row.attr_name,attr_sel:row.attr_sel,attr_vals:row.attr_vals.join(' ')})
            console.log(res.data)
            if (res.meta.status!==200){
                return this.$message.error('添加参数失败')
            }
            this.$message.success('添加参数成功')
        },
        // 动态可编辑标签
        handleInputConfirm(row){
            // this.inputValue ? this.inputValue.trim() : ''
            console.log(row.inputValue)
            if(row.inputValue.trim().length === 0){
                row.inputValue = ''
                row.inputVisible = false;
                return
            }
            console.log('ok')
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false;
            // 发起请求，保存参数
            this.saveAttrvals(row);

        },
        showInput(row){
            row.inputVisible=true;
            // $nextTick 当页面元素重新渲染后，才会指定回调函数中的代码
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
        });
        }
    },
    // 计算属性
    computed:{
        // 如果按钮需要被禁用，返回true
        isBtnDisable(){
            if(this.selectedKeys.length!==3){
                return true
            }else{
                return false
            }
        },
        // 计算当前选中的三级分类的ID(api 参数)
        cateID(){
            if(this.selectedKeys.length===3){
                return this.selectedKeys[2]
            }else{
                return null
            }

        },
        titleText(){
            if(this.activeName==='many'){
                return '动态参数'
            }else{
                return "静态参数"
            }
        }

    }
    
}
</script>
<style lang="less" scoped>

.catpar{
    margin: 15px 0;
}
.el-tag{
    margin-right: 10px;
}
.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }

</style>