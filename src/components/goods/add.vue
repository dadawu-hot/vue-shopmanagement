<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
             <!-- 警告栏 -->
            <el-alert
                title="添加商品信息"
                type="info"
                center
                :closable="false"
                show-icon>
            </el-alert>
            <!-- 步骤条 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品照片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px" label-position="top">
                <!-- 左侧Tab导航栏 v-model绑定name -->
                <el-tabs :tab-position="'left'"  v-model="activeIndex" :before-leave='beforeTabLeave' @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                             <el-cascader
                                v-model="addForm.goods_cat"
                                :options="catsList"
                                :props="{ expandTrigger: 'hover' ,value:'cat_id',label:'cat_name',children:'children'}"
                                @change="parentCatsChange"
                                :clearable='true'
                                >
                            </el-cascader>
                        </el-form-item>

                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="(item) in  manyTabData" :key="item.attr_name" >
                             <!-- 复选框 -->
                             <el-checkbox-group v-model="item.attr_vals" >
                                <el-checkbox border :label="cb" v-for="(cb,i) in item.attr_vals" :key='i'></el-checkbox>
                               
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                         <el-form-item :label="item.attr_name" v-for="(item) in  onlyTabData" :key="item.attr_id" >
                             <!-- 输入框 -->
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品照片" name="3">
                        <!-- 商场商品图片 -->
                        <!-- action：图片上传后台地址  -->
                        <el-upload
                            action='http://127.0.0.1:8888/api/private/v1/upload'
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :headers="headersObj"
                            :on-success="handleSuccess"
                            list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本框 -->
                        <quill-editor
                            ref="myQuillEditor"
                            v-model="addForm.goods_introduce"
                        />
                        <el-button type="primary" class="addbtn" @click="addFromData">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览对话框 -->
        <el-dialog
            title="图片预览"
            :visible.sync="previewDialogVisible"
            width="50%"
           >
            <span>
                <img :src="previewPath" alt="" class="previewImg">
            </span>
        </el-dialog>
    </div>
</template>
<script>
 import _ from "lodash";
export default {
   
    data(){
        return{
            activeIndex:'0',
            addForm:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                // 商品所属的分类数组
                goods_cat:[],
                pics:[],
                // 商品详情
                goods_introduce:'',
                attrs:[]

            },
            addFormrules:{
                goods_name:[  { required: true, message: '请输入商品名称', trigger: 'blur' },],
                goods_price:[  { required: true, message: '请输入商品价格', trigger: 'blur' },],
                goods_weight:[  { required: true, message: '请输入商品重量', trigger: 'blur' },],
                goods_number:[  { required: true, message: '请输入商品数量', trigger: 'blur' },],
                goods_cat:[{ required: true, message: '请选择商品分类', trigger: 'blur' },]

            },
            // 商品分类列表
            catsList:[],
            // 动态参数列表
            manyTabData:[],
            onlyTabData:[],
            //图片上传组件的header请求头对象
            headersObj:{
                Authorization:window.sessionStorage.getItem('token')
            },
            previewPath:'',
            previewDialogVisible:false
        }
    },
    created(){
        this.getCatsList();
    },
    computed:{
        cateId(){
            if(this.addForm.goods_cat.length===3){
                return this.addForm.goods_cat[2]
            }
            return null
        }
    },
    methods:{
        async getCatsList(){
            const {data:res} = await this.$http.get('categories');
            if(res.meta.status!==200){
                return this.$message.error('获取类别信息失败')
            }
            this.catsList = res.data
            console.log(this.catsList)
        },
        // 级联选择器选中项变化会触发的函数
        parentCatsChange(){
            console.log(this.addForm.goods_cat)
        },
        // tab发生切换触发这个事件
        beforeTabLeave(activeName,oldActiveName){
            // 即将进入标签页名字
            console.log(activeName)
            // 即将离开的标签页名字
            console.log(oldActiveName)
            if(oldActiveName==='0' && this.addForm.goods_cat.length!==3)
            {
                this.$message.error("请先选择商品分类")
                 // 阻止标签页切换
                return false
            }
           
            

        },
        async tabClicked(){
            console.log(this.activeIndex)
            if(this.activeIndex==='1'){
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,
                {params:{sel:'many'}})
                if (res.meta.status!==200){
                    return this.$message.error('获取参数信息失败')
                }
                res.data.forEach(item=>{
                    item.attr_vals = item.attr_vals.length===0 ? []:item.attr_vals.split(' ')
                })
                this.manyTabData = res.data
                console.log(this.manyTabData)
            }else if(this.activeIndex==='2'){
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,
                {params:{sel:'only'}})
                if (res.meta.status!==200){
                    return this.$message.error('获取参数信息失败')
                }
                this.onlyTabData = res.data
            }
        },
        // 处理图片预览
        handlePreview(file){
            console.log(file)
            this.previewPath = file.response.data.url
            this.previewDialogVisible = true
        },
        // 处理图片移除
        handleRemove(file){
             const filepath = file.response.data.tmp_path;
             const indexi = this.addForm.pics.findIndex(x=>
                 x.pic === filepath
             )
             this.addForm.pics.splice(indexi,1)
             console.log(this.addForm)
        },
        // 监听图片上传成功事件
        handleSuccess(response){
            console.log(response)
            // 图片信息对象
            const picinfo = {pic: response.data.tmp_path}
            
            this.addForm.pics.push(picinfo)

        },
        // 最后提交所有信息
        addFromData(){
            this.$refs.addFormRef.validate( async valid=>{
                if(!valid){
                    return this.$message.error("请添加必要的表单项目")
                }
                // 添加
                // 深拷贝addForm对象，做处理
               const form =  _.cloneDeep(this.addForm)
               form.goods_cat = form.goods_cat.join(',')
               this.manyTabData.forEach(item=>{
                    const newinfo = {attr_id:item.attr_id,attr_value:item.attr_vals.join(' ')}
                    this.addForm.attrs.push(newinfo)
                })
                this.onlyTabData.forEach(item=>{
                    const newinfo = {attr_id:item.attr_id,attr_value:item.attr_vals}
                    this.addForm.attrs.push(newinfo)
                })
                console.log(this.addForm)
                form.attrs = this.addForm.attrs
                form.goods_number = form.goods_number - 0
                form.goods_price = form.goods_price -0
                form.goods_weight = form.goods_weight -0
                console.log(form)
                const {data:res} = await this.$http.post('goods',form)
                console.log(res.data)
                if(res.meta.status!==201){
                    return this.$message.error('添加商品失败')
                }
                this.$message.success('添加成功')
                this.$router.push('/goods')
                
            })
        }

    }

}
</script>
<style lang="less" scoped>
.el-checkbox{
    margin: 0 5px 0 0 !important;
    
}
.previewImg {
    width: 100%;
}
.addbtn{
    margin-top: 20px;
}
</style>