export default [
    {
        prop: 'name',
        label: '登录名',
        width: '260',
        link: true
    },
    {
        prop: 'realname',
        label: '姓名'
    },
    {
        prop: 'email',
        label: '邮箱'
    },
    {
        prop: 'status',
        label: '状态'
    },
    {
        prop: 'phone',
        label: '手机号码'
    },
    {
        prop: 'org_name',
        label: '组织机构'
    }
]

// UCMP3-6286 使用AD的客户多处以下两列
export const AD_COLUMNS = [
    {
        prop: 'extension_data',
        label: '用户注册密码'
    },
    {
        prop: 'set_tag',
        label: '是否写入AD'
    }
]
