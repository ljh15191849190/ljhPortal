<template lang='pug'>
    #c-animate(:class="{'no-animation': !animation}")
</template>
<script>
    /* eslint-disable */
    export default {
        props: ['title', 'animation'],
        data () {
            return {}
        },
        methods: {
            initialize () {
                // 修改particles源码造成个别设备卡顿的问题
                // 解决方法：修改particles源码，改由cdn形式引入
                require('../../cdn/particles')
                let self = this
                particlesJS('c-animate', {
                    selector: self.$el.className,
                    'particles': {
                        'fps_limit': 30,
                        'number': {
                            'value': 275,
                            'density': {
                                'enable': true,
                                'value_area': 2000
                            }
                        },
                        'color': {
                            'value': '#ffffff'
                        },
                        'shape': {
                            'type': ['circle', 'triangle', 'circle'],
                            'stroke': {
                                'width': 5,
                                'color': '#fff' // 节点边框颜色
                            },
                            'polygon': {
                                'nb_sides': 5
                            },
                            'image': {
                                'src': 'img/github.svg',
                                'width': 10,
                                'height': 10
                            }
                        },
                        'opacity': {
                            'value': 2,
                            'random': true,
                            'anim': {
                                'enable': true,
                                'speed': 1,
                                'opacity_min': 0.1,
                                'sync': true
                            }
                        },
                        'size': {
                            'value': 12,
                            'random': true,
                            'anim': {
                                'enable': false,
                                'speed': 45,
                                'size_min': 0.1,
                                'sync': false
                            }
                        },
                        'line_linked': {
                            'enable': true,
                            'distance': 200,
                            'color': '#ffffff', // 线条颜色
                            'opacity': 0.7,
                            'width': 1
                        },
                        'move': {
                            'enable': true,
                            'speed': 1.2,
                            'direction': 'top-bottom-right',
                            'random': false,
                            'straight': false,
                            'out_mode': 'out',
                            'bounce': false,
                            'attract': {
                                'enable': false,
                                'rotateX': 1200,
                                'rotateY': 1200
                            }
                        }
                    },
                    'interactivity': {
                        'detect_on': 'canvas',
                        'events': {
                            'onhover': {
                                'enable': true,
                                'mode': 'grab'
                            },
                            'onclick': {
                                'enable': true,
                                'mode': 'push'
                            },
                            'resize': true
                        },
                        'modes': {
                            'grab': {
                                'distance': 140,
                                'line_linked': {
                                    'opacity': 1
                                }
                            },
                            'bubble': {
                                'distance': 400,
                                'size': 1,
                                'duration': 2,
                                'opacity': 1,
                                'speed': 3
                            },
                            'repulse': {
                                'distance': 100,
                                'duration': 0.4
                            },
                            'push': {
                                'particles_nb': 4
                            },
                            'remove': {
                                'particles_nb': 2
                            }
                        }
                    },
                    'retina_detect': true
                })
            },

            destroyAnimation () {
                // UCMP3-4461【光大环境】运行一段时间后，页面整体响应会变慢
                // 销毁 particlesJS
                if (pJSDom && pJSDom.length > 0) {
                    pJSDom.forEach(pJSDomItem => {
                        pJSDomItem.pJS.fn.vendors.destroypJS();
                    })
                }
                window.pJSDom = []
            }
        },

        mounted () {
            if (this.animation) this.initialize()
        },

        watch: {
            animation (val) {
                if (!val) this.destroyAnimation()
                else this.initialize()
            }
        },

        beforeDestroy () {
            this.destroyAnimation()
        }
    }
</script>
<style lang='scss' scoped>

</style>
