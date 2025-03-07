import base, { controllerName } from './base';
/**
 * reportConfig
*/
var reportConfig = {
  /**
   * 复制图表
   * @param {Object} args 请求参数
   * @param {CopyReportRequest} {pageId:图标复制到自定义页面，必传自定义页面id(string),reportId:报表ID(string),sourceType:来源 空 代表 来自报表，1：page页面(integer),}*copyReportRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  copyReport: function(args, options) {
    base.ajaxOptions.url = base.server() + '/reportConfig/copy';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportConfigcopy', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取字段自定义排序的的顺序
   * @param {Object} args 请求参数
   * @param {CustomSortRequest} {appId:工作表id(string),controlId:控件id(string),customSort:自定义的顺序(array),filter:筛选(ref),}*customSortRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  customSort: function(args, options) {
    base.ajaxOptions.url = base.server() + '/reportConfig/customSort';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportConfigcustomSort', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 删除图表
   * @param {Object} args 请求参数
   * @param {删除图表} {reportId:ID,新建id传空(string),}*deleteReportRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  deleteReport: function(args, options) {
    base.ajaxOptions.url = base.server() + '/reportConfig/deleteReport';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportConfigdeleteReport', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取图表的数据（结果toString过的）
   * @param {Object} args 请求参数
   * @param {保存图表} {appId:工作表ID(string),country:行政区图单独配置(ref),displaySetup:显示设置(ref),filter:筛选(ref),id:ID,新建id传空(string),isPublic:true:公共，false:个人(boolean),name:名称(string),particleSizeType:粒度 1:日 2:周 3:月(integer),pivotTable:透视图配置(ref),reportColor:图表颜色(string),reportType:类型   1:柱图 2:折线图  3:饼图  4:数值图 (integer),rightY:双轴图右Y轴(ref),sorts:自定义排序的数组(array),sourceType:来源 空 代表 来自报表创建，1：page页面创建(integer),splitId:拆分控件ID(string),xaxis:null(string),yaxisList:null(array),yreportType:null(integer),}*reportConfigRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getReportData: function(args, options) {
    base.ajaxOptions.url = base.server() + '/reportConfig/get';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportConfigget', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取图表的数据
   * @param {Object} args 请求参数
   * @param {保存图表} {appId:工作表ID(string),country:行政区图单独配置(ref),displaySetup:显示设置(ref),filter:筛选(ref),id:ID,新建id传空(string),isPublic:true:公共，false:个人(boolean),name:名称(string),particleSizeType:粒度 1:日 2:周 3:月(integer),pivotTable:透视图配置(ref),reportColor:图表颜色(string),reportType:类型   1:柱图 2:折线图  3:饼图  4:数值图 (integer),rightY:双轴图右Y轴(ref),sorts:自定义排序的数组(array),sourceType:来源 空 代表 来自报表创建，1：page页面创建(integer),splitId:拆分控件ID(string),xaxis:null(string),yaxisList:null(array),yreportType:null(integer),}*reportConfigRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getData: function(args, options) {
    base.ajaxOptions.url = base.server() + '/reportConfig/getData';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportConfiggetData', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取图表详情
   * @param {Object} args 请求参数
   * @param {string} [args.appId] 工作表ID
   * @param {string} [args.reportId] *报表ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getReportConfigDetail: function(args, options) {
    base.ajaxOptions.url = base.server() + '/reportConfig/getReportConfigDetail';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'reportConfiggetReportConfigDetail', args, $.extend(base, options));
  },
  /**
   * 保存图表配置
   * @param {Object} args 请求参数
   * @param {保存图表} {appId:工作表ID(string),country:行政区图单独配置(ref),displaySetup:显示设置(ref),filter:筛选(ref),id:ID,新建id传空(string),isPublic:true:公共，false:个人(boolean),name:名称(string),particleSizeType:粒度 1:日 2:周 3:月(integer),pivotTable:透视图配置(ref),reportColor:图表颜色(string),reportType:类型   1:柱图 2:折线图  3:饼图  4:数值图 (integer),rightY:双轴图右Y轴(ref),sorts:自定义排序的数组(array),sourceType:来源 空 代表 来自报表创建，1：page页面创建(integer),splitId:拆分控件ID(string),xaxis:null(string),yaxisList:null(array),yreportType:null(integer),}*reportConfigRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  saveReportConfig: function(args, options) {
    base.ajaxOptions.url = base.server() + '/reportConfig/saveReportConfig';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportConfigsaveReportConfig', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 更新图表权限
   * @param {Object} args 请求参数
   * @param {更新图表拥有这} {ownerId:个人转公共：空，公共转个人：个人ID(string),reportId:图表ID(string),}*updateReportOwnerRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateOwnerId: function(args, options) {
    base.ajaxOptions.url = base.server() + '/reportConfig/updateOwnerId';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportConfigupdateOwnerId', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 更新图表名称
   * @param {Object} args 请求参数
   * @param {更新图表名称} {name:名称(string),reportId:图表ID(string),}*updateReportNameRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updateReportName: function(args, options) {
    base.ajaxOptions.url = base.server() + '/reportConfig/updateReportName';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'reportConfigupdateReportName', JSON.stringify(args), $.extend(base, options));
  },
};
module.exports = reportConfig;