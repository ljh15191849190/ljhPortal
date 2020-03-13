import axios from 'axios'
import { URL_V2 } from './url'

class HelpCenterApi {
  // 获取电话
  getHelpPhoneList () {
    return axios({
      url: URL_V2 + '/sys/support/tel',
      method: 'get'
    })
  }

  // 新增电话
  addHelpPhoneList (data) {
    return axios({
      url: URL_V2 + '/sys/support/tel/create',
      method: 'post',
      data
    })
  }
  // 删除电话
  deleteHelpPhoneList (data) {
    return axios({
      url: URL_V2 + '/sys/support/tel/del',
      method: 'post',
      data: { id: data }
    })
  }
  // 删除手册
  deleteDownLoadList (data) {
    return axios({
      url: URL_V2 + '/sys/support/manual/delete',
      method: 'post',
      data: { manual_name: data }
    })
  }
  // get下载列表
  getdownLoadList (type = '') {
      let url = URL_V2 + '/sys/support/manual' + (type ? '?type=' + type : '')
    return axios({
      url,
      method: 'get'
    })
  }
  // 下载
  downLoad (manual_name) {
    return axios({
      url: URL_V2 + '/sys/support/manual/download',
      method: 'get',
      params: {
        manual_name: manual_name
      }
    })
  }
  // 上传
  uploadfile (data) {
    return axios({
      url: URL_V2 + '/sys/file',
      method: 'post',
      data
    })
  }
  // 上传文件保存
  savefile (data) {
    return axios({
      url: URL_V2 + '/sys/support/manual/save',
      method: 'post',
      data
    })
  }
}

export default new HelpCenterApi()
