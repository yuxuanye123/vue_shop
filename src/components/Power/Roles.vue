<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/login' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" style="width: 100%" border stripe row-key="id">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item, i1) in scope.row.children" :key="item.id" :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag @close="deleteTag(scope.row, item)" closable> {{ item.authName }} </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row v-for="(item1, i2) in item.children" :key="item1.id" :class="['vcenter', i2 === 0 ? '' : 'bdtop']">
                  <el-col :span="6">
                    <el-tag @close="deleteTag(scope.row, item1)" closable> {{ item1.authName }} </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="item2 in item1.children" :key="item2.id" @close="deleteTag(scope.row, item2)" closable> {{ item2.authName }} </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditDialog(scope.row.id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoles(scope.row.id)">删除</el-button>
            <!-- 分配权限 -->
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 编辑对话框 -->
      <el-dialog title="编辑" :visible.sync="editRolesDialogVisible">
        <el-form :model="editRolesForm" ref="editRolesFormRef" :rules="editRolesFormRules" label-width="100px">
          <el-form-item label="角色名称">
            <el-input v-model="editRolesForm.roleName" disabled></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="editRolesDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editRoles">确定</el-button>
        </div>
      </el-dialog>

      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="addRolesDialogVisible" @close="resetAddForm">
        <el-form :model="addRolesForm" ref="addRolesFormRef" :rules="addRolesFormRules" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="addRolesDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addRoles">确定</el-button>
        </div>
      </el-dialog>

      <!-- 分配权限对话框 -->
      <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" @close="resetRightForm">
        <el-tree :data="rightList" :props="treeProps" ref="treeRef" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"></el-tree>
        <div slot="footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRight">确 定</el-button>
        </div>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [],
      rightList: [],
      setRightDialogVisible: false,
      editRolesDialogVisible: false,
      addRolesDialogVisible: false,
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [105, 116],
      roleID: '',
      editRolesForm: {},
      editRolesFormRules: {
        roleDesc: [
          { required: true, message: '请填写角色描述', trigger: 'blur' }
        ]
      },
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      addRolesFormRules: {
        roleName: [
          { required: true, message: '请填写角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请填写角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rolesList = res.data
    },
    async deleteTag (role, right) {
      const confirmRes = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') return this.$message.info('删除取消')
      const { data: res } = await this.$http.delete('roles/' + role.id + '/rights/' + right.id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      role.children = res.data
      this.$message.success(res.meta.msg)
    },
    async showSetRightDialog (user) {
      this.roleID = user.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rightList = res.data
      this.getLeafKeys(user, this.defKeys)
      this.setRightDialogVisible = true
    },
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    resetRightForm () {
      this.defKeys = []
      this.$refs.setRightDialogRef.resetFields()
    },
    async addRight () {
      const arr = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idstr = arr.join(',')
      const { data: res } = await this.$http.post('roles/' + this.roleID + '/rights', {
        rids: idstr
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getUserList()
      this.setRightDialogVisible = false
    },
    async deleteRoles (id) {
      const confirmRes = await this.$confirm('是否要删除该角色', '删除角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('删除取消')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getUserList()
    },
    async openEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.editRolesForm = res.data
      this.editRolesDialogVisible = true
    },
    editRoles () {
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRolesForm.roleId, this.editRolesForm)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑失败')
        }
        this.getUserList()
        this.$message.success('编辑成功')
        this.editRolesDialogVisible = false
      })
    },
    addRoles () {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.getUserList()
        this.addRolesDialogVisible = false
        this.$message.success('添加成功')
      })
    },
    resetAddForm () {
      this.$refs.addRolesFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}

</style>
