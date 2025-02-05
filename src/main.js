import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'

const app = createApp(App)

const i18n = createI18n({
    'en-US': {
        currency: {
          style: 'currency', currency: 'USD', notation: 'standard'
        },
        decimal: {
          style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
        },
        percent: {
          style: 'percent', useGrouping: false
        }
      },
      'ja-JP': {
        currency: {
          style: 'currency', currency: 'JPY', useGrouping: true, currencyDisplay: 'symbol'
        },
        decimal: {
          style: 'decimal', minimumSignificantDigits: 3, maximumSignificantDigits: 5
        },
        percent: {
          style: 'percent', useGrouping: false
        }
      }
})

app.use(router).use(i18n)

app.mount('#app')
