import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';
import { vi } from 'element-plus/es/locale/index.mjs';

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  locale: {
    locale: 'vi',
    messages: {
      vi: {
        ...vi,
        dataFooter: {
          itemsPerPageText: 'Số mục mỗi trang',
          pageText: '{0}-{1} / {2}'
        },
        noDataText: 'Không có dữ liệu để hiển thị...',
      }
    },
    fallback: 'en',
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
    },
  },
});

export default vuetify; 