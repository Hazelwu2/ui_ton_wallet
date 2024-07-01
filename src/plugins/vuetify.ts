import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const tonWalletTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#2196f3',
    'primary-darken-1': '#3700B3',
    secondary: '#cddc39',
    'secondary-darken-1': '#018786',
    error: '#e91e63',
    info: '#607d8b',
    success: '#4caf50',
    warning: '#ffc107',
    accent: '#00bcd4',
    'dark-text': '#302218',
    'light-text': '#989692'
  },
}


export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'tonWalletTheme',
    themes: {
      tonWalletTheme
    }
  }
})