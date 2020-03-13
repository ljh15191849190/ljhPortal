import axios from 'axios'
import {URL_V2} from './url'

class NoticeApi {
    // 获取全部站内消息接口
    getNoticeList (pagination, type = '') {
        return axios({
            url: URL_V2 + '/msgs/notice?type=' + type + '&limit=' + pagination.size + '&page=' + pagination.index,
            method: 'get'
        })
    }

    // 发布站内消息接口
    publishNotice (data) {
        return axios({
            url: URL_V2 + '/msgs/notice',
            method: 'post',
            data
        })
    }

    // 标记站内消息已读
    readNotice (data) {
        return axios({
            url: URL_V2 + '/msgs/notice/read',
            method: 'post',
            data
        })
    }

    // 删除站内消息
    deleteNotice (data) {
        return axios({
            url: URL_V2 + '/msgs/notice/del',
            method: 'delete',
            data
        })
    }

    // 未读列表 只显示近20个
    getNotReadList () {
        return axios({
            url: URL_V2 + '/msgs/notice/notread?type=&limit=20&page=1',
            method: 'get'
        })
    }
}

export default new NoticeApi()
