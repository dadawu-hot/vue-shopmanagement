<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 栈一行一列的添加按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table :data="rolesList"  border stripe>
                <!-- 展开列 -->
                 <el-table-column type="expand">
                        <template v-slot="scope">
                            <!-- 权限页面渲染，栅格系统 -->
                            <el-row v-for="(item1,l) in scope.row.children" :key="item1.id" :class='["vcanter","bdbotton",l===0 ? "bdtop":""]'>
                                <!-- 一级权限 -->
                                <el-col :span="5" >
                                    <el-tag closable @close="removeById(scope.row,item1.id)">
                                         {{item1.authName}}
                                    </el-tag>
                                    <i class="el-icon-caret-right"></i>
                                   
                                </el-col>
                                <!-- 二级权限和三级 -->
                                <el-col :span="19">
                                    <el-row v-for="(item2,l) in item1.children" :key="item2.id" :class='[l===0 ? "":"bdtop","vcanter"]'>
                                        <el-col :span="6">
                                            <el-tag type="success"  closable @close="removeById(scope.row,item2.id)">
                                                {{item2.authName}}
                                            </el-tag >
                                             <i class="el-icon-caret-right"></i>
                                        </el-col>
                                        <el-col :span="18">
                                            <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeById(scope.row,item3.id)">
                                                {{item3.authName}}
                                            </el-tag>
                                        </el-col>
                                    </el-row>
                                </el-col>
                            </el-row>
                           
                        </template>
                 </el-table-column>
                <!-- 索引 -->
                 <el-table-column type="index"></el-table-column>
                 <el-table-column label="角色名称" prop="roleName"></el-table-column>
                 <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                 <el-table-column label="操作" prop="" width="320px">
                    <!-- 自定义按钮 -->
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEdieDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
                        <el-tooltip   content="分配角色" placement="top" effect="dark" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightsDialog(scope.row)">分配权限</el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 添加角色对话框 -->
        <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        @close="addDialogClose"
        width="50%" >
        <!-- 内容主体区 -->
        <el-form :model="addRolesForm" :rules="addFormRules" ref="addRolesFormRef" label-width="100px" >
            <el-form-item label="角色名称" prop="rolesname">
                <el-input v-model="addRolesForm.rolesname"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" >
                <el-input v-model="addRolesForm.rolesdesc"></el-input>
            </el-form-item>
        
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
        </el-dialog>   
        <!-- 编辑角色对话框 -->
        <el-dialog
        title="编辑角色"
        :visible.sync="edieDialogVisible"
        @close = "edieDialogClose"
        width="50%" >
        <!-- 内容主体区 -->
        <el-form :model="edieRolesForm"  ref="edieRolesFormRef" label-width="100px" >
            <el-form-item label="角色名称" prop="rolesname" disabled>
                <el-input v-model="edieRolesForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" >
                <el-input v-model="edieRolesForm.roleDesc"></el-input>
            </el-form-item>
        
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="edieDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="edieRoles">确 定</el-button>
        </span>
        </el-dialog> 
        <!-- 分配权限对话框 -->
         <el-dialog
            title="分配权限"
            :visible.sync="setRightsDialogVisible"
            @close = "deleteDefKey"
            width="50%" >
        <!-- 内容主体区 -->
          <!-- 树形组件 -->
            <el-tree :data="rightsDataList" :props="treeProps" show-checkbox node-key="id" default-expand-all
            :default-checked-keys="defkeys"
            ref="treeRef"
            ></el-tree>
            
           
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights ">确 定</el-button>
            </span>
         </el-dialog>   
    </div>
</template>
<script>
export default {
    data(){
        return {
            // 所有角色列表
            rolesList:[],
            // 添加数据
            addRolesForm :{
                rolesdesc:'',
                rolesname:''
            },
            // 添加角色规则
            addDialogVisible:false,
            addFormRules:{
                rolesname:[{ required: true, message: '请输入角色名称', trigger: 'blur' },],
                // rolesdesc:[{ required: true, message: '请输入角色描述', trigger: 'blur' }]
            },
            // 编辑角色
            edieDialogVisible:false,
           
            edieRolesForm:{},
            // 分配权限
            setRightsDialogVisible :false,
            rightsDataList:[],
            // 树形控件
            treeProps :{
                label:'authName',
                children:'children'
            },
            // 默认选中的节点ID数组(只需要三级权限id)
            defkeys:[],
            // 即将分配权限的id
            roleId :''

            
        }
    },
    created(){
        this.getRolesList()
    },
    methods:{
        async getRolesList(){
            const {data:res} = await this.$http.get("roles");
            
            if (res.meta.status !== 200){
                return this.$message.error('获取角色列表失败')
            }
            this.rolesList = res.data;
            console.log(this.rolesList)
            
        },
        
        // 监听关闭对话框的重置事件
        addDialogClose(){
            this.$refs.addRolesFormRef.resetFields()
        },
        // 添加并提交角色
        addRoles(){
            this.$refs.addRolesFormRef.validate(async valid=>{
                if (!valid){
                    return 
                }
                const {data:res} = await this.$http.post('roles',{roleName:this.addRolesForm.rolesname,roleDesc:this.addRolesForm.rolesdesc});
                console.log(res.data)
                if(res.meta.status!==201){
                    return this.$message.error('添加角色失败');
                }
                this.$message.success('添加角色成功');
                this.addDialogVisible = false
                this.getRolesList()
    
            });

        },
        //监听关闭对话框重置
        edieDialogClose(){
            this.$refs.edieRolesFormRef.resetFields()
        },
        // 显示修改对话框
        async showEdieDialog(roleId){
                console.log(roleId)
                const {data:res} = await this.$http.get('roles/'+roleId);
                if(res.meta.status!==200){
                    return this.$message.error('修改角色失败')
                }
                this.edieDialogVisible = true;
                this.edieRolesForm = res.data;
                // console.log(this.edieRolesForm)
            },
        // 修改提交对话框
        edieRoles(){
            this.$refs.edieRolesFormRef.validate(async valid=>{
                if (!valid)return
                const {data:res} = await this.$http.put('roles/'+this.edieRolesForm.roleId,{roleName:this.edieRolesForm.roleName,roleDesc:this.edieRolesForm.roleDesc})
                if(res.meta.status!=200){
                    return this.$message.error('修改角色信息失败');

                }
                this.$message.success('修改信息成功')
                this.edieDialogVisible = false;
                this.getRolesList();
                
            
            })
        },
        // 删除角色
        async removeRoleById(id){
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch (err=>err);
            if (confirmResult !== 'confirm'){
                return this.$message.info('已经取消删除！')
            }else{
                const {data:res} = await this.$http.delete('roles/'+id);
                if (res.meta.status!==200){
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getRolesList();
            }
        },
        // 删除三级权限
        async removeById(role,id){
             const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
             }).catch (err=>err);
             if (confirmResult !== 'confirm'){
                return this.$message.info('已经取消删除！')
            }else{
                const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${id}`);
                if(res.meta.status!==200){
                    return this.$message.error("删除权限失败")
                }
                this.$message.success('删除权限成功');
                // this.getRolesList();会造成列表刷新，展开项合起来
                role.children = res.data
            }
        },
        // 显示分配权限对话框
        async showSetRightsDialog(row){
            this.roleId = row.id;
            // 获取所有权限数据
            const {data:res} = await this.$http.get('rights/tree');
            if(res.meta.status!==200){
                return this.$message.error('获取权限数据失败')
            }
            this.getLeafKeys(row,this.defkeys)
            console.log(111+this.defkeys)
            this.setRightsDialogVisible = true;
            this.rightsDataList = res.data;
            // console.log(this.rightsDataList)
        },
        // 通过递归的形式，获取角色所有三级权限，保存至defkeys
        getLeafKeys(node,arr){
            if (!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item=>{
                this.getLeafKeys(item,arr)
            })
        },
        // 关闭分配权限弹框，清空defkeys数组
        deleteDefKey(){
            this.defkeys = [];
        },
        // 勾选为角色分配权限
        async allotRights(){
            const keys = [...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            console.log(keys);
            const idStr = keys.join(',');
            const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr});
            if (res.meta.status!==200){
                return this.$message.error('更新权限失败')
            }
            this.$message.success('更新权限成功');
            // this.getRolesList();
            
            this.getRolesList();
            this.setRightsDialogVisible=false;
        }
    }
}
</script>
<style lang="less" scoped>
    .el-tag{
        margin: 7px;
    }
    .bdtop {
        border-top: 1px solid #eee;
    }
    .bdbotton{
        border-bottom: 1px solid #eee;
    }
    .vcanter{
        display: flex;
        align-items: center;
    }
</style>