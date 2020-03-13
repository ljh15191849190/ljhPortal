<template lang="pug">
    div.portal-non-left-nav.search-result
        div.title 搜索结果
        div.content.overflow-y-auto
            el-col.margin-bottom(:span="16")
                el-input.search-input(v-model.trim="search.text")
                    el-select.input-select-prepend(slot="prepend" v-model="search.appId")
                        el-option(v-for="item in customMenus" :key="item.id" :label="item.appName" :value="item.id")
                    el-button(type="primary" slot="append" @click="handleSearch") 查询

                div.list-wrap
                    div.list-item(v-for="(item, navbar) in resultArray" :key="navbar")
                        p.font-section.margin-bottom(v-html="item.title")
                        p.desc-colorription.desc-color(v-html="item.description")
                        p.font-page-from.info-color {{item.pageFrom}}

                el-pagination(
                background
                @current-change="handleCurrentChange"
                :current-page.sync="pagination.index"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pagination.size"
                layout="sizes, prev, pager, next"
                :page-count="pagination.count")
            el-col.right-part(:span="8")
                div.font-section.padding-bottom.border-bottom 产品推荐
                div
                    div.desc-colorription.product-item(v-for="(item, navbar) in products" :key="navbar") {{item.label}}
</template>

<script>
    /**
     * @description 搜索结果
     */
    import {mapGetters} from 'vuex'

    export default {
        name: 'SearchResult',
        data () {
            return {
                breadcrumbItems: [{prop: '', label: '搜索结果'}],
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20
                },
                resultArray: [],
                search: {
                    text: this.$route.params.searchText,
                    appId: this.$route.params.appId
                },
                products: [
                    {value: '0', label: '对象存储OSS'},
                    {value: '1', label: '云数据库RDS'},
                    {value: '2', label: '云解析'},
                    {value: '3', label: 'CA证书服务'},
                    {value: '4', label: 'CDN'},
                    {value: '5', label: '访问控制'},
                    {value: '6', label: '专有网络VPC'},
                    {value: '7', label: '弹性公网IP'},
                    {value: '8', label: '负载均衡'},
                    {value: '9', label: '服务器安全（安博士）'}
                ]
            }
        },
        created () {
            const originData = [
                {
                    title: '云虚拟主机',
                    description: '独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右,' +
                    '独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右,独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右,独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右',
                    pageFrom: '运营管理 > 服务发布 > 添加服务'
                }, {
                    title: '云虚拟主机',
                    description: '独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右.................',
                    pageFrom: '运营管理 > 服务发布 > 添加服务'
                }, {
                    title: '云虚拟主机',
                    description: '独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右.................',
                    pageFrom: '运营管理 > 服务发布 > 添加服务'
                }, {
                    title: '云虚拟主机',
                    description: '独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右.................',
                    pageFrom: '运营管理 > 服务发布 > 添加服务'
                }, {
                    title: '云虚拟主机',
                    description: '独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右.................',
                    pageFrom: '运营管理 > 服务发布 > 添加服务'
                }, {
                    title: '云虚拟主机',
                    description: '独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右.................',
                    pageFrom: '运营管理 > 服务发布 > 添加服务'
                }, {
                    title: '云虚拟主机',
                    description: '独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右.................',
                    pageFrom: '运营管理 > 服务发布 > 添加服务'
                }, {
                    title: '云虚拟主机',
                    description: '独享版虚拟主机默认的带宽服务是1M，带宽峰值为120kb/s左右.................',
                    pageFrom: '运营管理 > 服务发布 > 添加服务'
                }
            ]

            // this.search.text = this.searchText
            this.resultArray = this.initResult(originData, this.search.text)
        },
        computed: {
            // searchText () {
            //     return this.$route.params.searchText || ''
            // },
            ...mapGetters([
                'customMenus'
            ])
        },
        // watch: {
        //     searchText (val) {
        //         this.search.text = val
        //     }
        // },
        methods: {
            handleCurrentChange () {
            },
            initResult (data, keyword) {
                const reg = new RegExp(keyword, 'g')
                data.forEach(item => {
                    item.title = item.title.replace(reg, `<span class="">${keyword}</span>`)
                    item.description = item.description.replace(reg, `<span class="">${keyword}</span>`)
                    console.log(item.title.replace(reg, '1'))
                })
                return data
            },
            handleSearch () {
                console.log(this.search.text)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .container-flud {
        padding: 0 10%;
    }

    .font-section {
        font-size: 16px;
    }

    .font-description {
        font-size: 14px;
        padding-bottom: 10px;
    }

    .font-page-from {
        font-size: 12px;
    }

    .list-wrap {
        margin-top: 30px;
        margin-bottom: 50px;

        .list-item {
            margin-bottom: 30px;
            cursor: pointer;
        }
    }

    .right-part {
        padding-top: 75px;
        padding-left: 110px;

        .product-item:first-child {
            padding-top: 20px;
        }

        .product-item {
            margin-bottom: 30px;
            cursor: pointer;
        }
    }

</style>