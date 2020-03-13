import axios from 'axios'
import {URL_V2} from './url'

class Configuration {
    /**
     * 基本配置
     */
    getSystemConfig () {
        return axios({
            url: URL_V2 + '/sys/conf',
            method: 'get'
        })
    }

    updateSystemConfig (data) {
        return axios({
            url: URL_V2 + '/sys/conf/save',
            method: 'post',
            data
        })
    }

    // 上传logo
    uploadLogo (data) {
        return axios({
            url: URL_V2 + '/sys/file',
            method: 'post',
            data
        })
    }

    /**
     * 认证
     */
    // 获取认证信息
    getLdap () {
        return axios({
            url: URL_V2 + '/sys/ldap',
            method: 'get'
        })
    }

    // 测试认证信息
    testLdap (data) {
        return axios({
            url: URL_V2 + '/sys/ldap/test',
            method: 'post',
            data
        })
    }

    // 创建/修改认证信息
    createLdap (data) {
        return axios({
            url: URL_V2 + '/sys/ldap',
            method: 'post',
            data
        })
    }

    /**
     * 邮件
     */
    // 获取邮件配置
    getEmailConfig () {
        return axios({
            url: URL_V2 + '/msgs/email',
            method: 'get'
        })
    }

    // 测试邮件配置
    testSendEmail (data) {
        return axios({
            url: URL_V2 + '/msgs/email/test',
            method: 'post',
            data
        })
    }

    // 保存邮件配置
    updateEmail (data) {
        return axios({
            url: URL_V2 + '/msgs/email/conf',
            method: 'post',
            data
        })
    }

    /**
     * 短信
     */
    // 创建/更新短信配置
    updateNoteConf (data) {
        return axios({
            url: URL_V2 + '/msgs/sms_conf',
            method: 'post',
            data
        })
    }

    // 获取短信配置
    getNoteConf () {
        return axios({
            url: URL_V2 + '/msgs/sms_conf',
            method: 'get'
        })
    }

    /**
     * 授权
     */
    getLicense (id) {
        return axios({
            url: URL_V2 + '/sys/license?module_id=' + id,
            method: 'get'
        })
    }

    updateLicense (data) {
        return axios({
            url: URL_V2 + '/sys/license',
            method: 'post',
            data
        })
    }
    // 组织机构保存
    saveOrg (data) {
        return axios({
            url: URL_V2 + '/user/tag/sync',
            method: 'post',
            data
        })
    }

    deleteOrg (data) {
        return axios({
            url: URL_V2 + '/user/tag',
            method: 'DELETE',
            data
        })
    }

    getOrgList () {
        return axios({
            url: URL_V2 + '/user/tag',
            method: 'get'
        })
    }
}

export default new Configuration()
