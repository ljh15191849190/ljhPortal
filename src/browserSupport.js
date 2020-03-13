/**
 * @description detect current browser name and version to determine whether support it or not
 */
let ua = window.navigator.userAgent
let ret = {
  name: '',
  version: ''
}

if (/Firefox/g.test(ua)) {
  ua = ua.split(' ')
  ret.name = 'Firefox'
  ret.version = ua[ua.length - 1].split('/')[1]
} else if (/MSIE/g.test(ua) || /Trident.*rv\:11\./g.test(ua)) {
  ua = ua.split(';')
  ret.name = 'IE'
  ret.version = ua[1].split(' ')[2]
} else if (/Opera/g.test(ua)) {
  ua = ua.split(' ')
  ret.name = 'Opera'
  ret.version = ua[ua.length - 1].split('/')[1]
} else if (/Chrome/g.test(ua)) {
  ret.name = 'Chrome'
  ret.version = ua[ua.length - 2].split('/')[1]

  if (ret.version === undefined) {
    ret.name = 'Chrome'
    ret.version = ua.substr(ua.lastIndexOf('Chrome/') + 7, 2)
  }
} else if (/^apple\s+/i.test(navigator.vendor)) {
  ua = ua.split(' ')
  ret.name = 'Safair'
  ret.version = ua[ua.length - 2].split('/')[1]
} else {
  ua = ua.split(' ')
  ret.name = '未知浏览器'
}

// eslint-disable-next-line
if (ret.name === 'Chrome' && ret.version < 42 || ret.name === 'Firefox' && ret.version < 38 || ret.name === 'IE' && ret.version < 10) {
  document.getElementsByClassName('browser-support')[0].style.display = 'block'
  localStorage.setItem('browserSupport', 'false')
} else localStorage.setItem('browserSupport', 'true')
