<template lang="pug">
    el-form.normal-form-width(ref="normalForm"  label-width="140px")
        el-form-item(label="授权版本")
        el-form-item(label="授权截至日期")
        el-form-item(label="CPU核数")
        el-form-item(label="已使用核数")
        el-form-item(label="公有云费用")
        el-form-item(label="已产生费用")
        el-form-item(label="费用比例(%)")
        el-form-item(label="用户数")
        el-form-item(label="已有用户数")
        el-form-item(label="组织名称")
        el-form-item(label="授权码")
        el-form-item
            el-button(@click="submitForm" type="primary" size="small") 更新授权码
</template>
<script>
    export default {
        data () {
            return {}
        },
        methods: {}
    }
</script>
<style lang="scss" scoped>
    .normal-form-width {
        width: 500px;
    }
</style>
