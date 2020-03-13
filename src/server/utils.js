import router from '@/router'

class Utils {
    constructor () {
        this.checkNameAlert = '由汉字，英文字母，数字和下划线组成'
    }

    tokenExpired () {
        router.push('/login')
        //UCMP3-1679【总览】用户选择的图表退出后重新登录，不能记录用户之前的选择图表。
        //问题原因：总览数据存在localStorage，不能清除
        localStorage.removeItem('authenticationToken')
        localStorage.removeItem('tenant')
        localStorage.removeItem('token2tenant')
        localStorage.removeItem('ucmp_license')
        localStorage.removeItem('cmdb_license')
        localStorage.removeItem('atomflow_license')
        sessionStorage.clear()
    }

    goEmpty () {
        router.push('/content/empty')
    }

    requestFullScreen () {
        /* eslint-disable */
        let docElm = document.documentElement
        if (docElm.requestFullscreen)
            docElm.requestFullscreen()
        else if (docElm.msRequestFullscreen) {
            docElm = document.body
            docElm.msRequestFullscreen()
        } else if (docElm.mozRequestFullScreen)
            docElm.mozRequestFullScreen()
        else if (docElm.webkitRequestFullScreen)
            docElm.webkitRequestFullScreen()
    }

    /**
     * @description 表格数据自排序
     * @param data 表格list
     * @param key 排序key
     * @param asc 默认升序 顺序( _ , number, zh, en)
     * @returns {Array} 排序好的data
     */
    sortTable (data, key, asc = true) {
        if (!key) {
            console.error('sortTable 排序时请输入要排序的 key 值')
            return data
        }
        data.sort((pre, next) => {
            const preKey = pre[key] ? pre[key].toString().toUpperCase() : ''
            const nextKey = next[key] ? next[key].toString().toUpperCase() : ''

            // if (preKey < nextKey) return asc ? -1 : 1
            // if (preKey > nextKey) return asc ? 1 : -1
            // return 0

            // UCMP-802【租户】租户界面，租户中文名称没有排序
            return asc ? preKey.localeCompare(nextKey, 'zh') : nextKey.localeCompare(preKey, 'zh')
        })

        return data
    }

    formatDate (date, formateStr = 'yyyy-MM-dd hh:mm:ss') {
        let timestrap = typeof date === 'number' ? date : date - '0'
        timestrap = new Date(timestrap)
        const o = {
            'M+': timestrap.getMonth() + 1,                    //月份
            'd+': timestrap.getDate(),                         //日
            'h+': timestrap.getHours(),                        //小时
            'm+': timestrap.getMinutes(),                      //分
            's+': timestrap.getSeconds(),                      //秒
            'q+': Math.floor((timestrap.getMonth() + 3) / 3),  //季度
            'S': timestrap.getMilliseconds()                   //毫秒
        }
        if (/(y+)/.test(formateStr))
            formateStr = formateStr.replace(RegExp.$1, (timestrap.getFullYear() + '').substr(4 - RegExp.$1.length))
        for (let k in o) {
            if (new RegExp('(' + k + ')').test(formateStr))
                formateStr = formateStr.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        }
        return formateStr
    }

    checkName (name) {
        let regex = /^[\u4e00-\u9fa5\w]+$/
        return regex.test(name)
    }

    logoUrl (imgName) {
        let logoUrl = '/gd/v2/sys/logo'
        return logoUrl + '/' + imgName
    }
}

export default new Utils()
