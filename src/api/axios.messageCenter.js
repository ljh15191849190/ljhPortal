import axios from 'axios'
import {URL_V2} from './url'

class MessageCenterApi {
    // 获取添加策略的配置参数
    getStragetConf () {
        return axios({
            url: URL_V2 + '/msgs/strategy/conf',
            method: 'get'
        })
    }

    // 获取消息策略列表
    getMsgStrategyList (params) {
        return axios({
            url: URL_V2 + '/msgs/strategy/list?limit=' + params.size + '&page=' + params.index,
            method: 'get'
        })
    }

    // 获取消息模板列表
    getMsgTemplateList (typeId = '') {
        return axios({
            url: URL_V2 + '/msgs/template/list?type_id=' + typeId,
            method: 'get'
        })
    }

    // 启用/禁用消息策略
    handleSreategyStatus (data) {
        return axios({
            url: `${URL_V2}/msgs/strategy/enable`,
            method: 'post',
            data
        })
    }

    // 删除消息策略
    delSreategy (data) {
        return axios({
            url: `${URL_V2}/msgs/strategy/del`,
            method: 'post',
            data
        })
    }

    // 创建/修改消息策略
    saveMessageStrategy (data) {
        return axios({
            url: `${URL_V2}/msgs/strategy`,
            method: 'post',
            data
        })
    }

    // 修改消息模板
    saveModifyTemplate (data) {
        return axios({
            url: `${URL_V2}/msgs/template/update`,
            method: 'post',
            data
        })
    }
}

export default new MessageCenterApi()
