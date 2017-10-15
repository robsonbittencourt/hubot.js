'use strict';

const path = require('path');

const i18n = require('i18next');
const backend = require('i18next-sync-fs-backend');

exports.t = t;
exports.changeLanguage = changeLanguage;
exports.addResourceBundle = addResourceBundle;

const localesPath = path.join(__dirname, '../..', 'locales', '{{lng}}/{{ns}}.json');

const initOptions = {
  debug: false,
  initImmediate: false,
  lng: 'en-US',
  fallbackLng: 'en-US',
  backend: {
    loadPath: localesPath
  }
};

i18n.use(backend)
  .init(initOptions);

function t(key, vars) {
  if (i18n.exists(key)) {
    return vars ? i18n.t(key, vars) : i18n.t(key);
  }

  return key;
}

function changeLanguage(locale) {
  if (locale) {
    i18n.changeLanguage(locale);
  }
}

function addResourceBundle(lng, ns, resources) {
  i18n.addResourceBundle(lng, ns, resources);
}
