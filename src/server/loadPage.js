/* eslint-disable */
class Load {
    loadScript (script) {
        return new Promise((reslove, rejected) => {
            // 直接 document.head.appendChild(script) 是不会生效的，需要重新创建一个
            const newScript = document.createElement('script')
            // 获取 inline script
            newScript.innerHTML = script.innerHTML
            // 存在 src 属性的话
            const src = script.getAttribute('src')
            if (src) newScript.setAttribute('src', src)

            // script 加载完成和错误处理
            newScript.onload = () => reslove();
            newScript.onerror = err => rejected();
            document.head.appendChild(newScript);
            document.head.removeChild(newScript);
            if (!src) {
                // 如果是 inline script 执行是同步的
                reslove();
            }
        })
    }

    setHTMLWithScript (container, rawHTML) {
        container.innerHTML = rawHTML
        const scripts = container.querySelectorAll('script')
        let that = this
        return Array.prototype.slice.apply(scripts).reduce(
            (chain, script) => {
                return chain.then(
                    () => {
                        that.loadScript(script)
                    })
            }, Promise.resolve())
    }
}

export default new Load()
