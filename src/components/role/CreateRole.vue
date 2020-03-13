<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="closeModal")
        el-steps(:active="activeStep" finish-status="success" simple)
            el-step(v-for="step in formSteps" :key="step.id" :title="step.title")
        el-card.margin-top(shadow="never")
            el-form(ref="userForm" :model="userForm" size="small" :rules="rules")
                // 基本信息
                el-form-item(label="产品模块" prop="platform_name" v-if="!activeStep" label-width="80px")
                    el-select.normal-form-select-width(v-model="userForm.platform_name" :disabled="isEdit")
                        el-option(v-for="item in appAvailable" :label="item.label" :key="item.id" :value="item.prop")
                el-form-item(label="角色名称" prop="name" v-if="!activeStep" label-width="80px")
                    el-input(v-model="userForm.name" v-loading="loading" :maxlength="20" placeholder="请输入角色名称，至少两位")
                el-form-item(label="角色描述" prop="comments" v-if="!activeStep" label-width="80px")
                    el-input(v-model="userForm.comments" type="textarea" :maxlength="200" placeholder="请输入角色描述")

                // 权限
                el-form-item(prop="role_data" v-if="activeStep === 1")
                    el-radio-group(v-model="userForm.role_data")
                        el-radio(v-for="(label, key) in privileges" :key="key" :label="key" border) {{ label }}

                // 菜单目录
                el-form-item(v-if="activeStep === 2")
                    el-row
                        el-col(:span="12")
                            el-tree(
                            ref="menuTree"
                            :data="showMenuList"
                            show-checkbox
                            node-key="id"
                            :expand-on-click-node="false"
                            :default-checked-keys="userForm.menus"
                            :props="menuTreeProp"
                            :render-content="renderContent"
                            @node-click="nodeClick"
                            @check-change="checkChange"
                            @check="getCheckedKeys")
                                span(slot-scope="{node, data}")
                                    span(style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;")
                                        span {{node.label}}
                        el-col(:span="10")
                            el-tree(
                            ref="buttonTree"
                            :data="buttonLists"
                            show-checkbox
                            default-expand-all
                            node-key="button_code"
                            :expand-on-click-node="false"
                            :default-checked-keys="checkedbuttons"
                            @check="getCheckedbuttonKeys")
                                span(slot-scope="{node, data}")
                                    span(style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;")
                                        span {{data.button_name}}
        div.dialog-footer(slot="footer")
            el-button(@click="closeModal" size="small") 取消
            el-button(@click="previous" v-if="activeStep" size="small") 上一步
            el-button(@click="next" v-if="activeStep < 2" size="small") 下一步
            el-button(@click="submit" v-if="activeStep === 2 && IsSee !== 'see'" type="primary" :loading="isSaving" size="small") 保存
</template>
<script>
    /**
     * @description 增加/修改角色
     */
    import RoleApi from '@api/axios.role'
    import MenuApi from '@api/axios.menu'
    import {mapGetters} from 'vuex'

    export default {
        props: ['isEdit', 'roleId', 'roleName', 'visible', 'IsSee'],
        data () {
            return {
                menuRoleButtons: {},
                buttonList: [],
                projectId: localStorage.getItem('tenant'),
                loading: false,
                userForm: {
                    name: '',
                    role_data: null,
                    menus: [],
                    platform_name: '',
                    comments: ''
                },
                originData: {},
                rules: {
                    platform_name: [
                        {required: true, message: '请选择产品模块', trigger: 'blur'}
                    ],
                    name: [
                        {required: true, message: '请输入角色名称', trigger: 'blur'},
                        {min: 2, message: '请输入至少两位字符', trigger: 'blur'},
                        {validator: this.isExistRole, trigger: 'blur'}
                    ],
                    role_data: [
                        {required: true, message: '请选择权限类型', trigger: 'blur'}
                    ]
                },
                isSaving: false,
                activeStep: 0,
                formSteps: [
                    {id: 0, title: '基本信息'},
                    {id: 1, title: '权限类型'},
                    {id: 2, title: '系统菜单'}
                ],
                privileges: [],
                menuList: [],
                menuTreeProp: {
                    children: 'subMenus',
                    label: 'title'
                }
            }
        },
        methods: {
            queryRoleById (roleId) {
                RoleApi.getRoleByRoleId(roleId).then(res => {
                    this.originData = JSON.parse(JSON.stringify(res))
                    this.userForm = res
                    this.userForm.menus = []

                    MenuApi.getMenuByRole(roleId).then(res => {
                        this.userForm.menus = res.map(item => item.id)
                        //默认赋值
                        res.map(item => {
                            this.$set(this.menuRoleButtons, item.id, item.button)
                        })
                        console.log(this.menuRoleButtons)

                        // 先注释
                        // let buttons = res.map(item => item.button)
                        // // console.log(buttons)
                        // buttons.map(item => {
                        //     this.menuRoleButtons.push(...item)
                        // })
                    })
                })
            },
            /**
             * 关闭模态框
             * */
            closeModal () {
                this.$emit('closeDialog')
            },
            /**
             * @description 判断重复
             */
            isExistRole (rule, value, callback) {
                this.loading = true
                // 验证
                const regex = /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5\w]+$/
                if (!regex.test(value)) {
                    callback(new Error('由至少两位的汉字，英文字母，数字和下划线组成，首字母为汉字或字母'))
                }

                let roleName = this.userForm.name
                if (roleName !== this.originData.name) {
                    RoleApi.checkRoleName(roleName).then(res => {
                        this.loading = false
                        if (res.role_id) {
                            callback(new Error('该角色已经存在，请重新输入'))
                        } else {
                            callback()
                        }
                    }, err => {
                        console.log(err)
                        this.loading = false
                    })
                } else {
                    this.loading = false
                    callback()
                }
            },
            submit () {
                this.isSaving = true
                let arr = []
                for (let key in this.menuRoleButtons) {
                    this.menuRoleButtons[key].forEach(item => {
                        arr.push(key + '&' + item.button_code)
                    })
                }
                this.$refs.userForm.validate(valid => {
                    if (valid) {
                        if (this.isEdit) {
                            let payload = JSON.parse(JSON.stringify(this.originData))
                            payload.name = this.userForm.name
                            payload.role_menus = this.payloadMenus
                            payload.comments = this.userForm.comments
                            payload.role_data = this.userForm.role_data
                            payload.role_model_menu = [{
                                module_id: this.platformId,
                                sub_menu: [...arr, ...this.userForm.menus]
                            }]
                            console.log(payload)
                            RoleApi.updateRole(payload).then(res => {
                                this.$notify({
                                    type: 'success',
                                    message: this.title + '成功'
                                })

                                this.isSaving = false
                                this.$emit('updateRole')
                            }).catch(e => {
                                this.isSaving = false
                            })
                        } else {
                            let payload = {
                                name: this.userForm.name,
                                role_data: this.userForm.role_data,
                                role_ctl: {},
                                comments: this.userForm.comments,
                                platform_name: this.userForm.platform_name,
                                role_model_menu: [{
                                    module_id: this.platformId,
                                    sub_menu: [...arr, ...this.userForm.menus]
                                }]
                            }
                            RoleApi.createRole(payload).then(res => {
                                this.$notify({
                                    type: 'success',
                                    message: '创建角色成功'
                                })

                                this.isSaving = false
                                this.$emit('updateRole')
                            }).catch(e => {
                                this.isSaving = false
                            })
                        }
                    } else this.isSaving = false
                })
            },
            next () {
                this.$refs.userForm.validate(valid => {
                    if (!valid) {
                        return
                    }

                    this.activeStep++

                    if (this.activeStep === 1) {
                        this.initAuthority()
                    }

                    if (this.activeStep === 2) {
                        this.initMenuTree()
                    }
                })
            },

            previous () {
                this.activeStep--
            },

            initAuthority () {
                RoleApi.getPlatformRoleListByOperator(this.userForm.platform_name).then(res => {
                    this.privileges = res
                })
            },

            initMenuTree () {
                MenuApi.getMenu({
                    project_id: this.projectId,
                    platform: this.userForm.platform_name,
                    all: '1'
                }).then(res => {
                    if (res) {
                        this.menuList = res
                        // this.buttonList = res.map(item => {
                        //     return item.subButton
                        // })
                    }
                })
            },

            getCheckedKeys (node, treeChecked) {
                if (node && node.subButton) {
                    this.buttonList = node.subButton
                }
                // 点击就保存一次所有节点，以防止上一步操作丢失勾选
                this.userForm.menus = this.$refs.menuTree.getCheckedKeys()
            },
            //改变勾选状态
            checkChange (data, tag) {
                // console.log(data, tag)
                if (tag === false) {
                    // delete this.menuRoleButtons[data.id]
                    this.$set(this.menuRoleButtons, data.id, [])
                    this.$refs.buttonTree.setCheckedKeys([])
                }
            },
            nodeClick (data, node) {
                if (data && data.subButton) {
                    this.buttonList = data.subButton
                }
            },
            //按钮测
            getCheckedbuttonKeys (node, treeChecked) {
                // console.log(node, treeChecked)
                if (node.parent_menu_id) {
                    this.$set(this.menuRoleButtons, node.parent_menu_id, this.$refs.buttonTree.getCheckedNodes())
                } else {
                    this.$set(this.menuRoleButtons, node.children[0].parent_menu_id, this.$refs.buttonTree.getCheckedNodes())
                }
                for (let key in this.menuRoleButtons) {
                    if (key === node.parent_menu_id) {
                        this.menuRoleButtons[key] = this.$refs.buttonTree.getCheckedNodes() //赋值勾选按钮
                    }
                }
            },
            renderContent (h, { node, data, store }) {
                return (
                     <span class="custom-tree-node">
                        <span>{node.label} </span>
                    </span>

                )
            }
    
        },
        // watch: {
        //     menuRoleButtons: {
        //         deep: true,
        //         handler () {
        //             for (let key in this.menuRoleButtons) {
        //                 this.menuRoleButtons[key].forEach(item => {
        //                     this.checkedbuttons.push(item.button_code)
        //                 })
        //             }
        //         }
        //     }
        // },
        computed: {
            //过滤总览菜单
            showMenuList () {
                console.log(this.menuList)
                let newMenuList = this.menuList.map(item => {
                    if (item.url === 'dashboard') {
                        item.subMenus = []
                    }
                    return item
                })
                return newMenuList
            },
            buttonLists () {
                return [{id: 1, button_name: '按钮名称', children: this.buttonList}]
            },
            checkedbuttons () {
                let arr = []
                for (let key in this.menuRoleButtons) {
                    this.menuRoleButtons[key].forEach(item => {
                        arr.push(item.button_code)
                    })
                }
                return arr
                //
                // let array = []
                // arr.map(item => {
                //     array = array.concat(item)
                // })
                // //  console.log(array)
                // return array.map(item => item.button_code)
            },
            title () {
                return this.isEdit ? `修改角色【${this.roleName}】` : '创建角色'
            },

            platformId () {
                let selectedApp
                if (this.userForm.platform_name) {
                    selectedApp = this.apps.find(app => app.prop === this.userForm.platform_name)
                }
                return selectedApp ? selectedApp.id : ''
            },

            appAvailable () {
                // 过滤掉App center
                return this.apps.filter(item => item.prop !== 'appcenter')
            },

            ...mapGetters([
                'apps'
            ])
        },
        created () {
            if (this.roleId && this.roleId !== 'add') {
                this.queryRoleById(this.roleId)
            }
        },
        components: {}
    }
</script>
<style lang="scss" scoped>
    .el-radio {
        margin-left: 10px;
    }
</style>
