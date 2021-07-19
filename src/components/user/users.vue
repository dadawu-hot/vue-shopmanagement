<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 一行两列布局 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <!-- 搜索与添加 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query"  clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
         <!-- 作用域插槽 -->
          <template v-slot="scope">
            <!-- {{ scope.row }} -->
            <el-switch v-model="scope.row.mg_state" @change="userStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="" width="180px">
            <!-- 自定义按钮 -->
            <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEdieDialog(scope.row.id)"></el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                <el-tooltip   content="分配角色" placement="top" effect="dark" :enterable="false">
                    <el-button type="warning" icon="el-icon-setting" size="mini" @click="setUserRoles(scope.row)"></el-button>
                </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页导航 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 3, 4]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    
    <!-- 添加用户的对话框 -->
    <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"  @close='addDialogClose'>
        <!-- 内容主体区 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" >
            <el-form-item label="用户名" prop="username">
                <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改用户信息对话框 -->
    <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"  @close="editFormClose"
       >
        <el-form ref="editFormRef" :model="editForm" label-width="70px" :rules="editFormRules">
            <el-form-item label="用户名">
                <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
             <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email" ></el-input>
            </el-form-item>
             <el-form-item label="手机号" prop="mobile">
                <el-input v-model="editForm.mobile" ></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
        title="分配角色"
        :visible.sync="setUserRolesDialogVisible"
        width="50%"  
        @close="restInfo">
        <!-- 内容主体区 -->
        <div ref="reloInfoRef">
            <p>当前用户：{{userinfo.username}}</p>
             <p>当前角色：{{userinfo.role_name}}</p>
             <p>分配新角色
                 <el-select v-model="selectId" placeholder="请选择">
                    <el-option
                    v-for="item in rolelist"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id">
                    </el-option>
                 </el-select>
             </p>
        </div>
         <span slot="footer" class="dialog-footer">
            <el-button @click="setUserRolesDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleInfo">确定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
       // 自定义校验规则
        var checkEmail = (rule,value,cb)=>{
            const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
            if (regEmail.test(value)){
                return cb()
            }
            cb(new Error('请输入合法的邮箱'))
        };
        var checkMobile = (rule,value,cb)=>{
            const regMobile = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
            if (regMobile.test(value)){
                return cb()
            }
            cb(new Error('请输入合法的手机号'))
        };
    return {
      // 用户列表的参数，请求时
      queryInfo: {
        // 搜索关键字
        query: "",
        pagenum: 1,
        //每页显示多少调
        pagesize: 2,
      },
      userList: [],
      total: 0,
    //   控制对话框的显示和隐藏
      addDialogVisible:false,
    //   添加表单数据
      addForm:{
          username:"",
          password:'',
          email:'',
          mobile:''
      },
      // 表单验证规则
      addFormRules:{
          username:[
              { required: true, message: '请输入用户名称', trigger: 'blur' },
              { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password:[
               { required: true, message: '请输入密码', trigger: 'blur' },
               { min: 6, max: 15, message: '长度在 6 到 15个字符', trigger: 'blur' }
          ],
          email:[
              { required: true, message: '请输入邮箱', trigger: 'blur'  },
              {validator:checkEmail}
          ],
          mobile:[
              { required: true, message: '请输入邮箱', trigger: 'blur' },
              {validator:checkMobile}
          ]
      },
        
     
      // 控制修改用户弹框
      editDialogVisible:false,
      // 根据id查询的用户信息对象
      editForm :{},
      // 修改表单规则
      editFormRules:{
          email:[
              { required: true, message: '请输入邮箱', trigger: 'blur'  },
              {validator:checkEmail}
          ],
          mobile:[
              { required: true, message: '请输入邮箱', trigger: 'blur' },
              {validator:checkMobile}
          ]
      },
      // 分配角色对话框
      setUserRolesDialogVisible:false,
      userinfo :{},
    //   所有角色列表
      rolelist:[],
      selectId:""
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败！");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听pagesize改变(每页显示多少条)
    handleSizeChange(newSize){
        console.log(newSize)
        this.queryInfo.pagesize = newSize;
        // 再请求一下数据
        this.getUserList()
    },
    // 监听页码值改变
    handleCurrentChange(newPage){
        console.log(newPage)
        this.queryInfo.pagenum = newPage;
        this.getUserList();
    },
    // 监听开关改变
    async userStatusChange(userinfo){
        console.log(userinfo)
        const {data:res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        console.log(res)
        if (res.meta.status !== 200){
            userinfo.mg_state =! userinfo.mg_state;
            return this.$message.error('更新用户状态失败！')
        }
        this.$message.success("更新状态成功！")
    },
    // 监听关闭对话框的重置事件
    addDialogClose(){
        this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加新用户
    addUser(){
         this.$refs.addFormRef.validate(async valid=>{
             // 表单验证失败，直接返回
             if (!valid) return
             // 验证成功
            const {data:res} = await this.$http.post('users',this.addForm);
            if (res.meta.status!==201) {
                return this.$message.error('添加用户失败')
            }
            this.$message.success('添加用户成功')
            // 隐藏弹框
            this.addDialogVisible = false;
            //  重新获取数据
            this.getUserList()
         })
    },
     // 监听关闭对话框的重置事件
    async showEdieDialog(id){
        console.log(id)
        const {data:res} = await this.$http.get('users/'+id);
        console.log(res)
        if(res.meta.status!==200){
            return this.$message.error('查询用户信息失败')
        }
        this.editForm = res.data;
        this.editDialogVisible = true;
    },
    // 监听关闭对话框的重置事件
    editFormClose(){
        this.$refs.editFormRef.resetFields()
    },
    // 修改信息并提交
    editUser(){
        this.$refs.editFormRef.validate(async valid=>{
            if(!valid) return 
            const {data:res} =await this.$http.put(`users/${this.editForm.id}`,{email:this.editForm.email,mobile:this.editForm.mobile})
            if(res.meta.status!==200){
                return this.$message.error('更新信息失败');
    
            }
            this.editDialogVisible  =false;
            this.getUserList();
            this.$message.success('更新信息成功')

        })
    },
    // 根据id删除用户
    async removeUserById(id){
        // 弹框询问
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch (err=>err)
        // 如果用户点击确定删除，则confirmResult 返回的是字符串 confirm；点击删除 返回字符串cancle
        // console.log(confirmResult);
        if (confirmResult !== 'confirm'){
            return this.$message.info('已经取消删除！')
        }else {
            const {data:res} = await this.$http.delete('users/'+id);
            if (res.meta.status !== 200){
                return this.$message.error('删除用户失败')
            }
            this.$message.success("删除用户成功");
            this.getUserList();
        }
    },
    // 管理角色对话框
    async setUserRoles(rowinfo){
        this.userinfo = rowinfo;
        // 在展示对话框之前获取所有角色列表，放在下拉列表框里
        const {data:res} = await this.$http.get('roles')
        if(res.meta.status!==200){
            return this.$message.error('获取角色列表失败')
        }
        this.rolelist = res.data
        console.log(this.rolelist)
        this.setUserRolesDialogVisible = true;
    },
    // 保存提交修改的角色
    async saveRoleInfo(){
        if(!this.selectId){
            return this.$message.error('请选择要分配的角色')
        }
        const {data:res} = await this.$http.put(`users/${this.userinfo.id}/role`,{rid:this.selectId})
        if(res.meta.status!==200){
            return this.$message.error('修改角色失败')
        }
        this.$message.success('修改角色成功')
        this.getUserList()
        this.setUserRolesDialogVisible = false

    },
    // 监听关闭对话框的重置事件
    restInfo(){
        this.selectId = '';
        this.userinfo = {}
    }
  },
};
</script>

<style lang="less" scoped>
</style>