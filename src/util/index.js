import JSEncrypt from 'jsencrypt';
import React from 'react';
import update from 'immutability-helper';
import { get, capitalize, isString } from 'lodash';
import { Dialog } from 'ming-ui';
import 'src/pages/PageHeader/components/NetState/index.less';
import { LIGHT_COLOR, PUBLIC_KEY, APPLICATION_ICON } from './enum';
import { getPssId } from 'src/util/pssId';
import qs from 'querystring';
import { getUploadToken, getFileUploadToken } from 'src/api/qiniu';
const {dialog: {netState: {buyBtn}}} = window.private;

// 判断选项颜色是否为浅色系
export const isLightColor = (color = '') => _.includes(LIGHT_COLOR, color.toUpperCase());

export const getCurrentProject = id => {
  const projects = _.get(md, ['global', 'Account', 'projects']) || [];
  return _.find(projects, item => item.projectId === id) || {};
};

export const enumObj = obj => {
  _.keys(obj).forEach(key => (obj[obj[key]] = key));
  return obj;
};

export const encrypt = text => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(PUBLIC_KEY);
  return encrypt.encrypt(encodeURIComponent(text));
};

export const getAdvanceSetting = (data, key) => {
  const setting = get(data, ['advancedSetting']) || {};
  if (!key) return setting;
  let value = get(setting, key);
  try {
    return JSON.parse(value);
  } catch (error) {
    return '';
  }
};

// 更新advancedSetting数据
export const handleAdvancedSettingChange = (data, obj) => {
  return {
    ...data,
    advancedSetting: update(data.advancedSetting || {}, { $apply: item => ({ ...item, ...obj }) }),
  };
};

/**
 * 导入本目录下所有组件
 * @param {*} r
 */
export const exportAll = r => {
  const componentConfig = {};
  r.keys().forEach(item => {
    const key = item.match(/\/(\w*)\./)[1];
    const component = r(item);
    const capitalKey = capitalize(key);
    if (isString(component)) {
      componentConfig[capitalKey] = component;
    } else {
      componentConfig[capitalKey] = component.default || component[key];
    }
  });
  return componentConfig;
};

export const setItem = (key, value) => {
  if (!key || !value) return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const getItem = key => {
  try {
    const str = localStorage.getItem(key);
    return JSON.parse(str);
  } catch (error) {
    console.log(error);
  }
};

export const upgradeVersionDialog = options => {
  Dialog.confirm({
    className: 'upgradeVersionDialogBtn',
    title: '',
    description: (
      <div className="netStateWrap">
        <div className="imgWrap" />
        <div className="hint">{options.hint || _l('当前版本无法使用此功能')}</div>
        <div className="explain">{options.explainText || _l('请升级至付费版解锁开启')}</div>
      </div>
    ),
    noFooter: buyBtn,
    removeCancelBtn: true,
  });
};

export const formatNumberFromInput = value => {
  value = value
    .replace(/[^-\d.]/g, '')
    .replace(/^\./g, '')
    .replace(/^-/, '$#$')
    .replace(/-/g, '')
    .replace('$#$', '-')
    .replace(/^-\./, '-')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.');

  if (value === '.') {
    value = '';
  }
  return value;
};

/**
 * 应用图标
 * for chatlist, inbox
 */
export const applicationIcon = (type, size = 'middle') => {
  if (APPLICATION_ICON[type] === undefined) {
    throw new Error('type is not found in DICT');
  }
  const className = APPLICATION_ICON[type];
  return `<span class='${className} circle ${size}' data-date="${new Date().getDate()}"></span>`;
};

/**
 * 获取字符串字节数
 */
export const getStringBytes = self => {
  let strLength = 0;

  for (let i = 0; i < self.length; i++) {
    if (self.charAt(i) > '~') strLength += 2;
    else strLength += 1;
  }

  return strLength;
};

export const cutStringWithHtml = (self, len, rows) => {
  let str = '';
  let strLength = 0;
  let isA = false;
  let isPic = false;
  let isBr = false;
  let brCount = 0;
  for (let i = 0; i < self.length; i++) {
    let letter = self.substring(i, i + 1);
    let nextLetter = self.substring(i + 1, i + 2);
    let nextnextLetter = self.substring(i + 2, i + 3);

    if (letter == '<' && nextLetter == 'a') {
      // a标签包含
      isA = true;
    } else if (letter == '<' && nextLetter == 'b' && nextnextLetter == 'r') {
      // 换行符
      isBr = true;
      brCount++;
    } else if (letter == '<') {
      // 图片
      isPic = true;
    }

    if (brCount == Number(rows)) {
      break;
    }
    str += letter;
    if (!isA && !isPic && !isBr) {
      if (self.charAt(i) > '~') {
        strLength += 2;
      } else {
        strLength += 1;
      }
    }

    if (isPic) {
      if (letter == '>') {
        isPic = false;
      } else {
        continue;
      }
    }
    if (isA) {
      if (letter == '>' && self.substring(i - 1, i) == 'a') {
        isA = false;
      } else {
        continue;
      }
    }

    if (isBr) {
      if (letter == '>' && self.substring(i - 1, i) == 'r') {
        isBr = false;
      } else {
        continue;
      }
    }

    if (strLength >= len) {
      break;
    }
  }
  return str;
};

/**
 * 翻译中替换{0} {1} 方法
 * @param  {string} str 要替换的字符串
 * @param  {object} args 如果只有第二个参数，并且是对象，根据对象的 key 替换 str 中相应的{key}
 * @return {string}
 */
export const langFormat = (str, ...args) => {
  let result = str;
  let reg;
  if (!result || !args.length) {
    return result;
  }
  if (args.length === 1 && typeof args[0] === 'object') {
    for (let key in args[0]) {
      if ({}.hasOwnProperty.call(args[0], key) && args[0][key] !== undefined) {
        reg = new RegExp('({)' + key + '(})', 'g');
        result = result.replace(reg, args[0][key]);
      }
    }
  } else {
    for (let i = 0; i < args.length; i++) {
      if (args[i] !== undefined) {
        reg = new RegExp('({)' + i + '(})', 'g');
        result = result.replace(reg, args[i]);
      }
    }
  }
  return result;
};

/**
 * 将文件大小转换成可读的格式，即 123.4 MB 这种类型
 * @param  {Number} size  文件以 byte 为单位的大小
 * @param  {Array}  accuracy 小数点后保留的位数
 * @param  {String} space 数字和单位间的内容，默认为一个空格
 * @param  {Array}  units 自定义文件大小单位的数组，默认为 ['B', 'KB', 'MB', 'GB', 'TB']
 * @return {String}       可读的格式
 */
export const formatFileSize = (size, accuracy, space, units) => {
  units = units || ['B', 'KB', 'MB', 'GB', 'TB'];
  space = space || ' ';
  accuracy = (accuracy && typeof accuracy === 'number' && accuracy) || 0;
  if (!size) {
    return '0' + space + units[0];
  }
  let i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(accuracy) * 1 + space + units[i];
};

/**
 * 判断是否是视频格式
 * @param {string} fileExt
 * @returns {boolean}
 */
export const isVideo = fileExt => {
  let fileExts = ['.mov', '.mp4', '.avi', '.mkv', '.3gp', '.3g2', '.m4v', '.rm', '.rmvb', '.webm'];
  if (fileExt) {
    fileExt = fileExt.toLowerCase();
    return fileExts.indexOf(fileExt) >= 0;
  }
  return false;
};

/**
 * 随机生成一个字符串
 * @param {number} length 长度
 * @param {string} customStr 自定义字符串
 * @return {string} 随机字符串
 */
export const getRandomString = (length, customStr) => {
  let chars = customStr
    ? customStr.split('')
    : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};

export const isUrlRequest = url => {
  if (/^data:|^chrome-extension:|^(https?:)?\/\/|^[\{\}\[\]#*;,'§\$%&\(=?`´\^°<>]/.test(url)) return true;
  if (/^\//.test(url)) return true;
  return false;
};

/**
 * 下载地址和包含 md.global.Config.AjaxApiUrl 的 url 添加 token
 * @param {string} url
 * @returns {string} url
 */
export const addToken = (url, verificationId = true) => {
  const id = window.getCookie('md_pss_id');
  if (verificationId && id) {
    return url;
  }
  if (url.includes('?')) {
    return `${url}&md_pss_id=${getPssId()}`;
  } else {
    return `${url}?md_pss_id=${getPssId()}`;
  }
};

/**
 * 判断当前设备是否为移动端
 */
export const browserIsMobile = () => {
  const sUserAgent = navigator.userAgent.toLowerCase();
  const bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os';
  const bIsMidp = sUserAgent.match(/midp/i) == 'midp';
  const bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4';
  const bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb';
  const bIsAndroid = sUserAgent.match(/android/i) == 'android';
  const bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce';
  const bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile';

  return bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM;
};

/**
 * 获取URL里的参数，返回一个参数对象
 * @param  {string} str url中 ? 之后的部分，可以包含 ?
 * @return {object}
 */
export const getRequest = str => {
  str = str || location.search;
  str = str
    .replace(/^\?/, '')
    .replace(/#.*$/, '')
    .replace(/(^&|&$)/, '');

  return qs.parse(str);
};

/**
 * 根据拓展名获取拓展名对应的 icon 名
 * @param  {string} ext 拓展名
 * @return {string}          背景图片 icon 名
 */
export const getIconNameByExt = ext => {
  let extType = null;
  switch (ext && ext.toLowerCase()) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'tif':
      extType = 'img';
      break;
    case 'xls':
    case 'xlsx':
      extType = 'excel';
      break;
    case 'doc':
    case 'docx':
    case 'dot':
      extType = 'word';
      break;
    case 'ppt':
    case 'pptx':
    case 'pps':
      extType = 'ppt';
      break;
    case 'mov':
    case 'mp4':
    case 'flv':
    case 'rm':
    case 'rmvb':
    case 'avi':
    case 'mkv':
    case '3gp':
    case '3g2':
    case 'm4v':
      extType = 'mp4';
      break;
    case 'mmap':
    case 'xmind':
    case 'cal':
    case 'zip':
    case 'rar':
    case '7z':
    case 'pdf':
    case 'txt':
    case 'ai':
    case 'psd':
    case 'vsd':
    case 'aep':
    case 'apk':
    case 'ascx':
    case 'db':
    case 'dmg':
    case 'dwg':
    case 'eps':
    case 'exe':
    case 'html':
    case 'indd':
    case 'iso':
    case 'key':
    case 'ma':
    case 'max':
    case 'mp3':
    case 'numbers':
    case 'obj':
    case 'pages':
    case 'prt':
    case 'rp':
    case 'skp':
    case 'xd':
      extType = ext.toLowerCase();
      break;
    case 'url':
      extType = 'link';
      break;
    case 'mdy':
      extType = 'mdy';
      break;
    default:
      extType = 'doc';
  }
  return extType;
};

/**
 * 根据文件名获取相应图标的背景图片 css 类名
 * @param  {string} filename 文件名
 * @return {string}          背景图片 css 类名
 */
export const getClassNameByExt = ext => {
  if (ext === false) {
    return 'fileIcon-folder';
  }
  /*
   * 之前方法针对的是普通附件，普通附件的 ext 属性是带 "." 的，知识文件不带点，这里简单的加个匹配判断
   * 传入的参数没有 "." 时，直接把它用作拓展名
   */
  ext = ext || '';
  ext = /^\w+$/.test(ext) ? ext.toLowerCase() : File.GetExt(ext).toLowerCase();
  return 'fileIcon-' + getIconNameByExt(ext);
};

/**
 * 获取仓库对应的文件存放地址
 * @returns {string} bucketName 仓库名
 */
export const getUrlByBucketName = bucketName => {
  var config = {
    mdoc: md.global.FileStoreConfig.documentHost,
    mdpic: md.global.FileStoreConfig.pictureHost,
    mdmedia: md.global.FileStoreConfig.mediaHost,
    mdpub: md.global.FileStoreConfig.pubHost,
  };
  return config[bucketName] || md.global.FileStoreConfig.pictureHost;
};

/**
 * 编码 html 字符串，只编码 &<>"'/
 * @param  {string} str
 * @return {string}
 */
export const htmlEncodeReg = str => {
  const encodeHTMLRules = { '&': '&#38;', '<': '&lt;', '>': '&gt;', '"': '&#34;', "'": '&#39;', '/': '&#47;' };
  const matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
  return str
    ? str.toString().replace(matchHTML, function (m) {
        return encodeHTMLRules[m] || m;
      })
    : '';
};

/**
 * 解码 html 字符串，只解码 '&#38;','&amp;','&#60;','&#62;','&#34;','&#39;','&#47;','&lt;','&gt;','&quot;'
 * @param  {string} str
 * @return {string}
 */
export const htmlDecodeReg = str => {
  const decodeHTMLRules = {
    '&#38;': '&',
    '&amp;': '&',
    '&#60;': '<',
    '&#62;': '>',
    '&#34;': '"',
    '&#39;': "'",
    '&#47;': '/',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
  };
  const matchHTML = /&#(38|60|62|34|39|47);|&(amp|lt|gt|quot);/g;
  return str
    ? str.toString().replace(matchHTML, function (m) {
        return decodeHTMLRules[m] || m;
      })
    : '';
};

/**
 * 获取光标位置
 */
export const getCaretPosition = ctrl => {
  let sel, sel2;
  let caretPos = 0;
  if (document.selection) {
    // IE Support
    ctrl.focus();
    sel = document.selection.createRange();
    sel2 = sel.duplicate();
    sel2.moveToElementText(ctrl);
    caretPos = -1;
    while (sel2.inRange(sel)) {
      sel2.moveStart('character');
      caretPos++;
    }
  } else if (ctrl.setSelectionRange) {
    // W3C
    ctrl.focus();
    caretPos = ctrl.selectionStart;
  }
  return caretPos;
};

/**
 * 设置光标位置
 */
export const setCaretPosition = (ctrl, caretPos) => {
  if (ctrl.createTextRange) {
    let range = ctrl.createTextRange();
    range.move('character', caretPos);
    range.select();
  } else if (caretPos) {
    ctrl.focus();
    ctrl.setSelectionRange(caretPos, caretPos);
  } else {
    ctrl.focus();
  }
};

// 从 html 代码创建元素
export function createElementFromHtml(html) {
  const con = document.createElement('div');
  con.innerHTML = html;
  return con.firstElementChild;
}

/**
 * 获取上传token
 */
export const getToken = (files, type = 0) => {
  if (!md.global.Account.accountId) {
    return getFileUploadToken({ files });
  } else {
    return getUploadToken({ files, type });
  }
};
