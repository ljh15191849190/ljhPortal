<template lang="pug">
    div.pagecontant
        div
            div.lableList.nameFloat(v-for="(item, index) in tabItems" :key="item.tel") 
                span {{item.contact_name}}：
        div       
            div.lableList(v-for="(item, index) in tabItems" :key="item.tel")        
                span {{item.tel}}
        div.labletext(v-if="tabItems.length<=0") 暂无数据
</template>

<script>
    import HelpCenterApi from '@api/axios.helpcenter'
    export default {
        data () {
            return {
                tabItems: [],
                projectId: localStorage.getItem('tenant')
            }
        },
        methods: {
            /**
             * @description 电话列表
             */
            getList (query) {
                HelpCenterApi.getHelpPhoneList(this.projectId).then(res => {
                    if (res) {
                        this.tabItems = res
                    }
                })
            }
        },
        created () {
            this.getList()
        }
    }
</script>
<style lang="scss" scoped>
    .pagecontant{
        height: calc(100vh - 200px);
        overflow: auto;
        display:flex;
    }
    .lableList {
        margin-left:10px;
        margin-bottom: 5px
    }
    .nameFloat{
        text-align:right;
    }
    .labletext{
        height: 100%;
        width:100%;
        font-size: 13px;
        display:flex;
        align-items:center;
        justify-content:center;
    }
</style>
