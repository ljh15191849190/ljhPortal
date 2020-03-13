import axios from 'axios'

class LoadPage {
    loadContent () {
        return axios({
            url: 'static/dist/index.html',
            method: 'get'
        })
    }
}

export default new LoadPage()
