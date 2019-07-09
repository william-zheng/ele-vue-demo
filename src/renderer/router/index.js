import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  esModule: false,
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/examples',
      component: require('@/components/iview-examples').default,
      children: [{
        path: '/split',
        component: require('@/routers/split.vue').default
      },
      {
        path: '/layout',
        component: require('@/routers/layout.vue').default
      },
      {
        path: '/affix',
        component: require('@/routers/affix.vue').default
      },
      {
        path: '/anchor',
        component: require('@/routers/anchor.vue').default
      },
      {
        path: '/grid',
        component: require('@/routers/grid.vue').default
      },
      {
        path: '/button',
        component: require('@/routers/button.vue').default
      },
      {
        path: '/input',
        component: require('@/routers/input.vue').default
      },
      {
        path: '/radio',
        component: require('@/routers/radio.vue').default
      },
      {
        path: '/checkbox',
        component: require('@/routers/checkbox.vue').default
      },
      {
        path: '/steps',
        component: require('@/routers/steps.vue').default
      },
      {
        path: '/timeline',
        component: require('@/routers/timeline.vue').default
      },
      {
        path: '/switch',
        component: require('@/routers/switch.vue').default
      },
      {
        path: '/alert',
        component: require('@/routers/alert.vue').default
      },
      {
        path: '/badge',
        component: require('@/routers/badge.vue').default
      },
      {
        path: '/tag',
        component: require('@/routers/tag.vue').default
      },
      {
        path: '/input-number',
        component: require('@/routers/input-number.vue').default
      },
      {
        path: '/upload',
        component: require('@/routers/upload.vue').default
      },
      {
        path: '/progress',
        component: require('@/routers/progress.vue').default
      },
      {
        path: '/collapse',
        component: require('@/routers/collapse.vue').default
      },
      {
        path: '/carousel',
        component: require('@/routers/carousel.vue').default
      },
      {
        path: '/card',
        component: require('@/routers/card.vue').default
      },
      {
        path: '/tree',
        component: require('@/routers/tree.vue').default
      },
      {
        path: '/rate',
        component: require('@/routers/rate.vue').default
      },
      {
        path: '/circle',
        component: require('@/routers/circle.vue').default
      },
      {
        path: '/tabs',
        component: require('@/routers/tabs.vue').default
      },
      {
        path: '/tooltip',
        component: require('@/routers/tooltip.vue').default
      },
      {
        path: '/poptip',
        component: require('@/routers/poptip.vue').default
      },
      {
        path: '/slider',
        component: require('@/routers/slider.vue').default
      },
      {
        path: '/dropdown',
        component: require('@/routers/dropdown.vue').default
      },
      {
        path: '/breadcrumb',
        component: require('@/routers/breadcrumb.vue').default
      },
      {
        path: '/menu',
        component: require('@/routers/menu.vue').default
      },
      {
        path: '/spin',
        component: require('@/routers/spin.vue').default
      },
      {
        path: '/cascader',
        component: require('@/routers/cascader.vue').default
      },
      {
        path: '/select',
        component: require('@/routers/select.vue').default
      },
      {
        path: '/backtop',
        component: require('@/routers/back-top.vue').default
      },
      {
        path: '/page',
        component: require('@/routers/page.vue').default
      },
      {
        path: '/transfer',
        component: require('@/routers/transfer.vue').default
      },
      {
        path: '/date',
        component: require('@/routers/date.vue').default
      },
      {
        path: '/form',
        component: require('@/routers/form.vue').default
      },
      {
        path: '/table',
        component: require('@/routers/table.vue').default
      },
      {
        path: '/loading-bar',
        component: require('@/routers/loading-bar.vue').default
      },
      {
        path: '/modal',
        component: require('@/routers/modal.vue').default
      },
      {
        path: '/message',
        component: require('@/routers/message.vue').default
      },
      {
        path: '/notice',
        component: require('@/routers/notice.vue').default
      },
      {
        path: '/avatar',
        component: require('@/routers/avatar.vue').default
      },
      {
        path: '/color-picker',
        component: require('@/routers/color-picker.vue').default
      },
      {
        path: '/auto-complete',
        component: require('@/routers/auto-complete.vue').default
      },
      {
        path: '/scroll',
        component: require('@/routers/scroll.vue').default
      },
      {
        path: '/divider',
        component: require('@/routers/divider.vue').default
      },
      {
        path: '/time',
        component: require('@/routers/time.vue').default
      },
      {
        path: '/cell',
        component: require('@/routers/cell.vue').default
      },
      {
        path: '/drawer',
        component: require('@/routers/drawer.vue').default
      },
      {
        path: '/icon',
        component: require('@/routers/icon.vue').default
      },
      {
        path: '/list',
        component: require('@/routers/list.vue').default
      }]
    }
  ]
})
