export default {
    methods: {
        // 校验端口号
        portCheck (rule, value, callback) {
            const regex = /^\d+$/
            if (!regex.test(value)) {
                callback(new Error('请输入数字!'))
            } else {
                const tempNum = parseInt(value)
                if (tempNum < 1 || tempNum > 65535) {
                    callback(new Error('请输入正确的端口号1-65535!'))
                } else {
                    callback()
                }
            }
        },

        // 校验标题，用户名--支持汉字、英文、数字或者下划线
        validationName (rule, value, callback) {
            var targ = /^[A-Za-z0-9\u4e00-\u9fa5_]+$/
            if (!targ.test(value)) {
                callback(new Error('标题只支持汉字、英文、数字或者下划线'))
            }
            callback()
        },

        // 校验手机号
        validationPhoneNumber (rule, value, callback) {
            if (value.trim() === '') {
                callback(new Error('请输入手机号码'))
            } else if (!(/^1[3456789]\d{9}$/.test(value))) {
                callback(new Error('您输入手机号码不正确'))
            } else {
                callback()
            }
        }
    }
}
