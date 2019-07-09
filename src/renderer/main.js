import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import iView from 'iview'
import locale from 'iview/dist/locale/zh-CN'
import 'iview/dist/styles/iview.css'

import '@/js/jquery-slim'
import '@/js/autoTestRunner'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(iView, {locale})

// 开启debug模式
Vue.config.debug = true

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
