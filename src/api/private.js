define(function (require, exports, module) {
  module.exports = {
    /**
    * 获取读取API信息的地址
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAPIUrl: function (args, options) {
      return $.api('Private', 'GetAPIUrl', args, options);
    },

  };
});
