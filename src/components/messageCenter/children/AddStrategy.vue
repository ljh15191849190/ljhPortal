<template lang="pug">
    div.full-content
        el-form.form-height(ref="form" :model="params" :rules="rules")
            div.top-bar
                el-button.small-btn(type="text" @click="backToList" icon="el-icon-back") 返回列表
                div.input-group
                    el-form-item(prop="title" label="策略名称：" label-position="left" label-width="120px")
                        el-input.normal-query-widget(v-model="params.title" size="small" required placeholder="请输入策略名称")
            div.add-wizards.d-flex.justify-content-between
                div.each-wizard(v-for="(item, index) in wizards" :key="index")
                    div.wizard-name {{item.title}}
                    div.wizard-item
                        //- step 1 选择应用配置
                        div(v-if="index === 0")
                            el-tree(
                            ref="firstTree"
                            :data="item.treeData"
                            :props="defaultProps"
                            show-checkbox
                            default-expand-all
                            :default-checked-keys="defaultCheckOrgs"
                            node-key="id"
                            @check="handleCheckChange")
                        //- step 2 接收人
                        div(v-else-if="index === 1")
                            el-checkbox-group(v-model="params.accept_role_list")
                                el-checkbox.block-box(v-for="role in item.datas.acceptRole" :key="role.id" :label="role.id") {{role.label}}
                            el-button.advance-btn(v-if="item.datas.advancedOptions" type="text" @click="changeAdvances()") 添加接收人
                                i.el-icon--right(:class="expendAdvanced ? 'el-icon-arrow-down' : 'el-icon-arrow-up'")
                            el-select(
                            v-show="expendAdvanced"
                            v-model="params.accept_user_list"
                            placeholder="输入登录名/姓名搜索"
                            multiple
                            filterable
                            remote
                            reserve-keyword
                            value-key="id"
                            :remote-method="remoteUserList"
                            :loading="userLoading"
                            size="small")
                                el-option(v-for="item in userList" :key="item.id" :label="item.name" :value="item")
                                    span {{item.name}}
                                    span(v-if="item.org_name") ({{item.org_name}})
                        //- step 3 周期
                        div(v-else-if="index === 2")
                            el-radio-group.full-width(v-model="params.strategy_period_type")
                                el-radio.block-box(v-for="(frequency, index) in item.datas.noticeTimes" :key="frequency.value" :label="frequency.value") {{frequency.label}}
                            el-radio-group.full-width(v-model="params.send_ahead_date")
                                el-radio.block-box.padding-left(v-for="(timeRange, index) in item.datas.period" :key="timeRange.value" :label="timeRange.value" :disabled="!params.strategy_period_type") {{timeRange.label}}
                        //- step 4 消息类型
                        div(v-else-if="index === 3")
                            el-checkbox-group(v-model="params.support_message_types")
                                el-checkbox.block-box(v-for="role in item.datas" :key="role.type" :label="role.type") {{role.label}}
                        div(v-else)
        div.bot-btns
            el-button(size="small" type="default" @click="backToList") 返回
            el-button(
            size="small" type="primary" @click="saveStrategy()"
            :disabled="!(checkedNodes.length && (params.accept_role_list.length || params.accept_user_list.length) && params.strategy_period_type && params.support_message_types.length)") 保存
</template>
<script>
    /**
     * @description 添加策略页面
     */

    import MessageCenterApi from '@api/axios.messageCenter'
    import UserApi from '@api/axios.users'
    import ValidationRules from '@mixins/validationRules'

    export default {
        mixins: [ValidationRules],
        props: ['isEdit', 'strategyObj'],
        data () {
            return {
                strategyName: '',
                defaultProps: {
                    id: 'id',
                    label: 'label',
                    children: 'children'
                },
                defaultCheckOrgs: [],
                wizards: [
                    {
                        title: '服务/应用配置',
                        treeData: []
                    },
                    {
                        title: '选择接收人',
                        datas: {}
                    },
                    {
                        title: '周期',
                        datas: {
                            hasDelayTime: false,
                            period: []
                        }
                    },
                    {
                        title: '类型',
                        datas: [
                            {type: 0, label: '邮件'},
                            {type: 1, label: '短信'},
                            {type: 2, label: '站内消息'}
                        ]
                    }
                ],
                params: {
                    strategy_app_id: '',  // 应用ID -- statis/add
                    strategy_app_name: '', // 应用名称 -- /统计分析/建议增加配置
                    title: '', // 策略名称
                    strategy_period_type: '',
                    strategy_period_type_name: '', // 策略周期类型 --单次
                    accept_role_list: [],  // 接收人角色 [ 申请人， 审批人， 责任人 ]
                    accept_user_list: [],  // 高级选项- 人员列表
                    send_ahead_date: 0, // 周期延迟时长 --1天前/7天前····
                    support_message_types: [] // 消息发送类型 -- 短信/邮件/站内消息
                },
                sendParams: [],
                stepTwoDatas: {
                    advancedOptions: true,
                    acceptRole: []
                },
                stepThreeDatas: {
                    hasDelayTime: false,
                    noticeTimes: [
                        {
                            value: 1, label: '单次'
                        }
                    ],
                    period: []
                },
                expendAdvanced: false,
                checkedNodes: [],
                rules: {
                    title: [
                        {
                            required: true,
                            message: '请输入消息标题',
                            trigger: ['blur', 'change']
                        },
                        {
                            validator: this.validationName,
                            trigger: ['blur', 'change']
                        },
                        {
                            max: 64,
                            message: '长度不能超过64位',
                            trigger: ['blur', 'change']
                        }
                    ]
                },
                projectId: localStorage.getItem('tenant'),
                userLoading: false,
                userList: []
            }
        },
        created () {
            MessageCenterApi.getStragetConf().then(res => {
                this.wizards[0].treeData = res

                this.wizards[0].treeData.forEach(node => {
                    node.childIds = []
                    node.children.forEach(childNode => {
                        node.childIds.push(childNode.id)
                    })

                    if (this.isEdit) {
                        // 编辑条件下禁用选择框
                        if (node.childIds.indexOf(this.strategyObj.select_strategy_app_id) !== -1) {
                            this.handleDisabled(node, false)
                        } else {
                            this.handleDisabled(node, true)
                        }
                    } else {
                        this.handleDisabled(node, false)
                    }
                })

                if (this.isEdit) {
                    // 如果是编辑状态的话需要对初始值进行赋值
                    this.defaultCheckOrgs.push(this.strategyObj.select_strategy_app_id)
                    let findNode = this.wizards[0].treeData.find(node => node.id === this.strategyObj.select_strategy_app_id)
                    let fatherNode = this.wizards[0].treeData.find(node => node.childIds.indexOf(this.strategyObj.select_strategy_app_id) > -1)
                    this.wizards[2].datas.period = fatherNode.period

                    if (!findNode) {
                        this.wizards[0].treeData.forEach(item => {
                            if (item.children && !findNode) {
                                findNode = item.children.find(node => node.id === this.strategyObj.select_strategy_app_id)
                            }
                        })
                    }

                    this.checkedNodes.push(findNode)

                    // UCMP3-789根据后台返回到配置对配置参数进行更新
                    this.initMoreConf(fatherNode)

                    this.initConf(this.strategyObj)
                } else {
                    // UCMP3-789根据后台返回到配置对配置参数进行更新
                    this.initMoreConf(res[0])
                }
            })
        },
        methods: {
            backToList () {
                this.$emit('changeState', {
                    is_add: false,
                    is_reload: false
                })
            },
            // 选择应用配置
            handleCheckChange (data, checked) {
                this.wizards[0].treeData.forEach(node => {
                    if ((node.id === data.parentId || (data.children && data.id === node.id)) || !checked.checkedNodes.length) {
                        this.handleDisabled(node, false)
                        if (!checked.checkedNodes.length) {
                            this.wizards[1].datas = JSON.parse(JSON.stringify(this.stepTwoDatas))
                            this.wizards[2].datas = {...{}, ...this.stepThreeDatas}
                        } else {
                            this.wizards[1].datas = JSON.parse(JSON.stringify(node))
                            this.wizards[2].datas.period = node.period
                            this.wizards[2].datas.hasDelayTime = node.hasDelayTime
                            this.wizards[2].datas.noticeTimes = node.noticeTimes
                        }
                    } else {
                        this.handleDisabled(node, true)
                    }
                })
                this.checkedNodes = checked.checkedNodes
            },
            // 递归处理构建策略对应的应用ID
            buildServerId (node, serverIdArr = []) {
                // 策略对应的应用id
                serverIdArr.unshift(node)
                if (node.hasOwnProperty('parentId')) {
                    let parentNode = null
                    parentNode = this.wizards[0].treeData.find(item => item.id === node.parentId)
                    if (parentNode) {
                        // 子节点的父节点在树结构的第一层，不用再次深层查找
                        serverIdArr = this.buildServerId(parentNode, serverIdArr)
                    } else {
                        // 查找children集合中是否有所需的父节点
                        this.wizards[0].treeData.forEach(item => {
                            if (item.hasOwnProperty('children')) {
                                parentNode = item.children.find(_item => _item.id === node.parentId)
                                if (parentNode) {
                                    serverIdArr = this.buildServerId(parentNode, serverIdArr)
                                }
                            }
                        })
                    }
                }
                return serverIdArr
            },
            // 处理树结构的置灰状态
            handleDisabled (node, flag) {
                this.$set(node, 'disabled', flag)
                if (node.children) {
                    node.children.forEach(child => {
                        this.$set(child, 'disabled', flag)
                        if (child.children) {
                            this.handleDisabled(child, flag)
                        }
                    })
                }
            },
            changeAdvances () {
                let flag = !this.expendAdvanced
                this.$set(this, 'expendAdvanced', flag)
            },
            saveStrategy () {
                this.$refs.form.validate().then(validated => {
                    if (validated) {
                        // 构建保存策略时的对象数组
                        let sendParams = []
                        this.checkedNodes.forEach(item => {
                            if (!item.hasOwnProperty('children') && this.buildServerId(item).length) {
                                sendParams.push(this.buildServerId(item))
                            }
                        })

                        sendParams.forEach(itemConf => {
                            let paramItem = JSON.parse(JSON.stringify(this.params))
                            let app_ids = []
                            let app_labels = []
                            itemConf.forEach(item_node => {
                                app_ids.push(item_node.value)
                                app_labels.push(item_node.label)
                                // 根据页面中勾选的
                                if (item_node.hasOwnProperty('tempalte_list')) {
                                    let templateList = item_node.tempalte_list.filter(item => paramItem.support_message_types.indexOf(item.type_id) > -1)
                                    paramItem.support_message_types = templateList.map(item => item.type_id)
                                    paramItem.select_template_ids = templateList.map(item => item.id)
                                }
                            })
                            paramItem.strategy_app_id = app_ids.join('/')
                            paramItem.strategy_app_name = app_labels.join('/')
                            paramItem.strategy_period_type_name = this.wizards[2].datas.noticeTimes.find(item => item.value === paramItem.strategy_period_type).label
                            paramItem.project_id = this.projectId
                            paramItem.select_strategy_app_id = itemConf[itemConf.length - 1].id
                            paramItem.accept_user_list = paramItem.accept_user_list.map(item => item.id)

                            // 修改时需要传入ID
                            if (this.isEdit && paramItem.select_strategy_app_id === this.strategyObj.select_strategy_app_id) {
                                paramItem.id = this.strategyObj.id
                            }
                            this.sendParams.push(paramItem)
                        })
                        MessageCenterApi.saveMessageStrategy(this.sendParams).then(res => {
                            this.$emit('changeState', {
                                is_add: false,
                                is_reload: true
                            })
                        })
                    }
                }, () => {
                })
            },
            initConf (obj) {
                this.params.title = obj.title
                this.params.accept_role_list = obj.accept_role_list ? obj.accept_role_list.map(role => role.id) : []
                this.params.strategy_period_type = obj.strategy_period_type
                this.params.support_message_types = obj.support_message_type_ids
                this.params.select_template_ids = obj.select_template_ids
                this.params.send_ahead_date = obj.send_ahead_date
                this.params.accept_user_list = []

                this.getSelectedUser(obj.accept_user_list)
            },

            // 获取接收人列表
            getSelectedUser (ids) {
                if (!ids.length) {
                    this.params.accept_user_list = []
                    this.userList = []

                    this.expendAdvanced = !!this.params.accept_user_list.length
                } else {
                    let params = {
                        page_idx: 1,
                        limit: 99999,
                        user_ids: ids.join(',')
                    }
                    UserApi.getUserListWithPagination(params).then(res => {
                        this.params.accept_user_list = res.users
                        this.userList = res.users // userList赋值是为了初始化显示

                        this.expendAdvanced = !!this.params.accept_user_list.length
                    })
                }
            },

            // 根据第一步选择的节点初始化第二、三步的配置
            initMoreConf (node) {
                Object.keys(this.stepTwoDatas).forEach(key => {
                    this.$set(this.wizards[1].datas, key, node[key])
                })
                // UCMP3-3295【消息策略】添加消息策略，勾选了服务/应用配置后再去勾选，选择接收人选项会出现变化
                // 保存第一个服务的接收人信息
                this.stepTwoDatas.acceptRole = node.acceptRole

                Object.keys(this.stepThreeDatas).forEach(key => {
                    this.$set(this.wizards[2].datas, key, node[key])
                })
            },

            remoteUserList (query) {
                if (query !== '') {
                    this.userLoading = true

                    let param = {
                        page_idx: 1,
                        limit: 99999,
                        name: query
                    }
                    UserApi.getUserListWithPagination(param).then(res => {
                        this.userLoading = false
                        this.userList = res.users
                    })
                } else {
                    this.userList = []
                }
            }
        },
        components: {}
    }
</script>
<style lang="scss" scoped>
    .full-width {
        width: 100%;
        .block-box.padding-left {
            padding-left: 15px;
        }
    }

    .form-height {
        height: calc(100% - 45px);
    }

    .small-btn {
        font-size: 12px;
        line-height: 25px;
    }

    .input-group {
        display: inline-block;
        margin-left: 20px;
        width: auto;
        .input-width {
            display: inline-block;
            width: 200px;
            margin-left: 10px;
        }
        .el-form-item {
            margin-bottom: 0;
        }
    }

    .add-wizards {
        border: 1px solid #ddd;
        height: calc(100% - 50px);
        padding: 10px 20px;
        .each-wizard {
            width: 25%;
            display: inline-block;
            &:not(:nth-child(1)) {
                border-left: 1px solid #ddd;
            }
            .wizard-name {
                padding: 5px 10px;
            }
            .wizard-item {
                height: calc(100% - 30px);
                overflow-y: auto;
                padding: 5px 10px;
                .advance-btn {
                    margin-left: 10px;
                }
            }
        }
    }

    .bot-btns {
        margin-top: 10px;
        float: right;
    }

    .block-box {
        display: block;
        width: 100%;
        margin: 10px;
    }
</style>

