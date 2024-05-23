import i18n from 'i18n';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18n.configure({
  locales: ['en', 'ar'],
  directory: path.join(__dirname, 'locales'), 
  defaultLocale: 'en', 
  cookie: 'lang',
  queryParameter: 'lang', 
  directoryPermissions: '755',
  autoReload: true,
  updateFiles: false,
  api: {
    __: 'translate',
    __n: 'translateN'
  }
});

export default i18n;
