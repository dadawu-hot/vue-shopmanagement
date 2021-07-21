<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 栈一行一列的添加按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCatsdialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格数据 -->
            <tree-table :data="catesList" 
                :columns="columns"
                :selection-type='false'
                :expand-type='false'
                show-index
                index-text='#'
                border 
                stripe
                class="treetable">
                 <!-- 模板，是否有效 -->
                 <template v-slot:isok="scope" >
                     <i class="el-icon-success" style="color:lightgreen"  v-if="scope.row.cat_deleted === false"></i>
                     <i class="el-icon-error" style="color:red"  v-else></i>
                 </template>
                  <!-- 模板，排序 -->
                 <template v-slot:order="scope" >
                     <el-tag size='mini' v-if='scope.row.cat_level===0'>一级</el-tag>
                     <el-tag size='mini' type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
                     <el-tag size='mini' type="warning" v-else>三级</el-tag>
                 </template>
                 <!-- 模板，操作 -->
                 <template v-slot:opt="scope" >
                     <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCatsDialog(scope.row)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCats(scope.row)">删除</el-button>
                 </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum"
                :page-sizes="[3, 5, 10, 15]"
                :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
          
        </el-card>
      <!-- 添加分类对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCatsdialogVisible"
            width="50%"
            @close="addCatsFormClose"

            >
            <el-form :model="addCatsForm" :rules="addCatsFormRules" ref="addCatsFormRef" label-width="100px" >
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCatsForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类" >
                    <!-- 级联菜单option：数据源 -->
                     <el-cascader
                        v-model="selectedKeys"
                        :options="parentCatsList"
                        :props="{ expandTrigger: 'hover' ,value:'cat_id',label:'cat_name',children:'children',checkStrictly:true}"
                        @change="parentCatsChange"
                        :clearable='true'
                        >
                     </el-cascader>
                </el-form-item>

               
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCatsdialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCats">确 定</el-button>
            </span>
        </el-dialog>
      <!--修改分类对话框  -->
      <el-dialog
            title="修改分类"
            :visible.sync="editCatsdialogVisible"
            width="50%"
            >
            <el-form :model="editCatsList" :rules="editCatsFormRules" ref="editCatsFormRef" label-width="100px" >
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editCatsList.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCatsdialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCats">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return {
            // 查询条件
            querInfo:{
                type:3,
                pagenum:1,
                pagesize:5

            },
            // 商品分类的列表
            catesList:[],
            total:0,
            // 为table指定列的定义
            columns:[
                {label:'分类名称',prop:'cat_name'},
                // 模板列，作用域插槽
                {label:'是否有效',type:'template',template:'isok'},
                {label:'排序',type:'template',template:'order'},
                {label:'操纵',type:'template',template:'opt'}
            ],
            //添加分配对话框
            addCatsdialogVisible:false,
            addCatsForm:{
                 cat_name:'',
                //  父级分类名称
                 cat_pid:0,
                 cat_level:0,
                 
            },
            // 添加分类表单的验证规则
            addCatsFormRules:{
                  cat_name:[{ required: true, message: '请输入分类名称', trigger: 'blur' }],
            },
            // 父级分类列表
            parentCatsList:[],
            // 选中的父级分类的id数组
            selectedKeys:[],
            // 修改分类对话框
            editCatsdialogVisible:false,
            editCatsFormRules:{
                cat_name:[{ required: true, message: '请输入分类名称', trigger: 'blur' }],
            },
            editCatsList:{
                cat_name:'',
                cat_id:0,
            }


        }
    },
    created(){
        this.getCatesList();
    },
    methods:{
        // 获取商品分类数据
        async getCatesList(){
            const {data:res} = await this.$http.get('categories',{params:this.querInfo});
            if(res.meta.status !==200){
                return this.$message.error('获取所有分类商品失败');

            }
            this.catesList = res.data.result;
            this.total = res.data.total;
            console.log(this.catesList)
        },
        // 监听pagesize 改变
        handleSizeChange(newsize){
            this.querInfo.pagesize = newsize;
            this.getCatesList();
        },
        // 监听pagenum 改变
        handleCurrentChange(newpagenum){
            this.querInfo.pagenum = newpagenum;
            this.getCatesList();
        },
        // 点击按钮显示添加分类对话框
        showAddCatsdialog(){
            this.getParentCatsList();
            this.addCatsdialogVisible = true;
        },
        // 获取父级分类数据列表(前两级)
        async getParentCatsList(){
            const {data:res} = await this.$http.get('categories',{params:{type:2}})
            if(res.meta.status!==200){
                return this.$message.error('获取所有父级分类列表失败');
            }
            console.log(res.data)
            this.parentCatsList=res.data;
        },
        // 级联选择项发生变化，触发
        parentCatsChange(){
            // 如果selectedKeys数组中的length 大于0 ，表示选中父级分类，=0表示没有选择任何分类
            if (this.selectedKeys.length>0){
                this.addCatsForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1];
                this.addCatsForm.cat_level = this.selectedKeys.length 
                return 
            }
            else {
                 this.addCatsForm.cat_pid = 0;
                this.addCatsForm.cat_level =0
            }
        },
        // 点击确定，添加数据请求
        addCats(){
            // 预验证
            this.$refs.addCatsFormRef.validate(async valid=>{
                if(!valid)return
                const {data:res} = await this.$http.post('categories',this.addCatsForm)
                if (res.meta.status!==201){
                    return this.$message.error('添加分类失败')
                }
                this.$message.success('添加分类成功')
               
                this.getCatesList();
                this.addCatsdialogVisible  =false;
            })
            
            
            // console.log(this.addCatsForm) 

        },
        // 关闭弹窗，清空数据
        addCatsFormClose(){
            this.$refs.addCatsFormRef.resetFields();
            this.selectedKeys=[]
            this.addCatsForm.cat_level = 0;
            this.addCatsForm.cat_pid = 0;
        },
        // 显示修改谈话框
        showEditCatsDialog(rows){
            this.editCatsList.cat_name = rows.cat_name;
            this.editCatsList.cat_id = rows.cat_id;
            this.editCatsdialogVisible = true;
            console.log(rows)
        },
        // 提交修改内容
        async editCats(){
            const {data:res} = await this.$http.put('categories/'+this.editCatsList.cat_id,{cat_name:this.editCatsList.cat_name})
            if(res.meta.status!==200){
                return this.$message.error('编辑类别失败')
            }
            this.$message.success('编辑类别成功')
            this.editCatsdialogVisible=false;
            this.getCatesList();
        },
        // 根据id删除
        async deleteCats(rows){
            const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch (err=>err);
            if (confirmResult !== 'confirm'){
                return this.$message.info('已经取消删除！')
            }else{
                const {data:res} = await this.$http.delete('categories/'+rows.cat_id);
                if(res.meta.status!==200){
                    return this.$message.error("删除失败")
                }
                this.$message.success('删除成功')
                this.getCatesList();

            }
        }

    }
}
</script>
<style lang="less" scoped>
    .treetable{
        margin-top: 20px ;
    }
    .el-cascader {
        width: 100%;
    }
</style>