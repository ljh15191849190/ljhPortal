<template lang="pug">
    div
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item 系统管理
            el-breadcrumb-item 菜单管理
        el-tabs.portal-content(v-model="activeTab" type="border-card")
            el-tab-pane(
                v-for="product in products"
                v-if="product"
                :key="product.id" 
                :label="product.module_name"
                :name="product.id"
                )
                MenuManager(v-if="product.id === activeTab" :treeData="activedMenus" :activeTab="activeTab")
</template>
<script>
/**
 * @description 菜单管理入口组件：产品模块tab页签
 */
import MenuApi from '@api/axios.menu'
import MenuManager from './MenuManager'

export default {
    beforeRouteEnter (to, from, next) {
        MenuApi.getPublicApps(0).then(
            apps => {
                if (apps.length) {
                    MenuApi.getMenusAccordToApp(apps[0].id).then(
                        allProductMenus => {
                            next(
                                vm => {
                                    vm.products = apps
                                    vm.allMenus = allProductMenus
                                    vm.activeTab = apps[0].id
                                }
                            )
                        }
                    )
                }
            }
        )
    },

    data () {
        return {
            activeTab: null,
            products: [],
            activedMenus: []
        }
    },

    methods: {
        getActivedMenus (id) {
            let root = JSON.parse(JSON.stringify(this.activedRootNodeData))

            MenuApi.getMenusAccordToApp(id).then(
                allProductMenus => {
                    root.subMenus = root.subMenus.concat(allProductMenus)
                    this.activedMenus = [root]
                }
            )
        }
    },

    computed: {
        activedRootNodeData () {
            let product = this.products.find(product => product.id === this.activeTab)
            let rst = { id: null, subMenus: [], title: null, menu_source: 'default' }
            if (product) rst.title = product.module_name

            return rst
        }
    },

    components: {
        MenuManager
    },

    watch: {
        activeTab (val) {
            this.getActivedMenus(val)
        }
    }
}
</script>
<style lang="scss" scoped>

</style>
