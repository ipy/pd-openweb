import { getWorksheetInfo, addWorksheetRow as addWorksheetRowApi, getRowByID } from 'src/api/worksheet';
import { updatePublicWorksheetState } from 'src/api/publicWorksheet';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import { updateOptionsOfControls, checkCellIsEmpty } from 'worksheet/util';

export function getControlsForNewRecord(
  worksheetId,
  defaultRelatedSheet = {},
  defaultFormData = {},
  defaultFormDataEditable,
) {
  return new Promise((resolve, reject) => {
    getWorksheetInfo({
      worksheetId: worksheetId,
      handleDefault: true,
      getTemplate: true,
      getRules: true,
    })
      .then(data => {
        function handle() {
          let controls = data.template.controls
            .filter(c => !_.includes(['caid', 'ownerid', 'ctime', 'utime'], c.controlId))
            .map(control => {
              if (
                control.type === 29 &&
                Number(control.advancedSetting.showtype) !== RELATE_RECORD_SHOW_TYPE.LIST &&
                control.sourceControlId === defaultRelatedSheet.relateSheetControlId
              ) {
                try {
                  control.advancedSetting = _.assign({}, control.advancedSetting, {
                    defsource: JSON.stringify([
                      {
                        staticValue: JSON.stringify([
                          JSON.stringify({
                            ...JSON.parse(defaultRelatedSheet.value.sourcevalue),
                            name: defaultRelatedSheet.value.name,
                          }),
                        ]),
                      },
                    ]),
                  });
                  if (control.fieldPermission) {
                    control.fieldPermission = control.fieldPermission.replace(/(\w)(\w)(\w)/g, '$10$3');
                  } else {
                    control.fieldPermission = '101';
                  }
                } catch (err) {}
              }
              if (defaultFormData[control.controlId]) {
                control.value = defaultFormData[control.controlId];
                if (!defaultFormDataEditable) {
                  if (control.fieldPermission) {
                    control.fieldPermission = control.fieldPermission.replace(/(\w)(\w)(\w)/g, '$10$3');
                  } else {
                    control.fieldPermission = '101';
                  }
                }
              }
              return { ...control };
            });
          controls = controls.map(control => {
            if (control.type === 30 && !control.value) {
              const parentControl = _.find(
                data.template.controls,
                c => c.controlId === control.dataSource.slice(1, -1),
              );
              const sourceControl =
                parentControl && _.find(parentControl.relationControls, c => c.controlId === control.sourceControlId);
              if (!parentControl) {
                return control;
              }
              if (parentControl.value) {
                const parentSheetRelateRecord = JSON.parse(parentControl.value)[0];
                if (!parentSheetRelateRecord.sourcevalue) {
                  return { ...control };
                }
                if (sourceControl && sourceControl.type === 29) {
                  try {
                    const sourceControlValue = JSON.parse(parentSheetRelateRecord.sourcevalue)[control.sourceControlId];
                    const sourceControlValueRecord = JSON.parse(sourceControlValue)[0];
                    if (sourceControlValueRecord) {
                      control.value = sourceControlValueRecord.name;
                    }
                  } catch (err) {}
                } else {
                  control.value = JSON.parse(parentSheetRelateRecord.sourcevalue)[control.sourceControlId];
                }
              }
            }
            return { ...control };
          });
          resolve({ worksheetInfo: { ...data }, controls });
        }
        // 兼容 看板 甘特图视图新建记录时关联记录默认值数据不完整问题
        const defaultFormDataControlIds = Object.keys(defaultFormData);
        if (defaultFormDataControlIds.length === 1) {
          const control = _.find(data.template.controls, c => c.controlId === defaultFormDataControlIds[0]);
          if (
            control &&
            control.type === 29 &&
            _.find(data.template.controls, c => c.dataSource === `$${control.controlId}$`)
          ) {
            const value = safeParse(defaultFormData[control.controlId]);
            if (value.length && value[0].sid && !value[0].sourcevalue) {
              getRowByID({
                worksheetId: control.dataSource,
                rowId: value[0].sid,
              })
                .then(rowData => {
                  value[0].sourcevalue = JSON.stringify(
                    [{ rowid: value[0].sid }, ...rowData.receiveControls.filter(c => c.value)].reduce((a, b) =>
                      Object.assign(a, { [b.controlId]: b.value }),
                    ),
                  );
                  defaultFormData[control.controlId] = JSON.stringify(value);
                  handle();
                })
                .fail(err => {
                  handle();
                });
              return;
            }
          }
        }
        handle();
      })
      .fail(reject);
  });
}

export function addRecord(props) {
  const {
    notDialog,
    resetForm,
    appId,
    projectId,
    addType,
    viewId,
    worksheetId,
    masterRecord,
    formdata,
    continueAdd,
    customBtn,
    sheetAddWorksheetRow,
    addWorksheetRow,
    onAdd,
    updateWorksheetControls,
    onSubmitBegin = () => {},
    onSubmitEnd = () => {},
    onCancel = () => {},
    customwidget,
    setRequesting,
  } = props;
  onSubmitBegin();
  const receiveControls = formdata
    .filter(item => item.type !== 30 && item.type !== 31 && item.type !== 32)
    .map(formatControlToServer)
    .filter(item => !checkCellIsEmpty(item.value));
  const args = {
    silent: true,
    receiveControls,
    appId,
    projectId,
    addType,
    viewId,
    worksheetId,
    masterRecord,
    pushUniqueId: md.global.Config.pushUniqueId,
    ...customBtn,
  };
  if (args.masterRecord && !args.masterRecord.rowId) {
    delete args.masterRecord;
  }
  addWorksheetRowApi(args)
    .then(res => {
      if (res.resultCode === 1) {
        const resetOptions = {};
        let newOptionControls = updateOptionsOfControls(formdata, res.data);
        if (newOptionControls.length && _.isFunction(updateWorksheetControls)) {
          updateWorksheetControls(newOptionControls);
          resetOptions.newControls = newOptionControls.map(c => ({ ...c, value: res.data[c.controlId] }));
        }
        if (continueAdd || notDialog) {
          alert('保存成功', 1, 1000);
          resetForm(resetOptions);
        } else {
          onCancel();
        }
        if (_.isFunction(onAdd)) {
          onAdd(res.data);
        }
      } else if (res.resultCode === 11) {
        if (customwidget.current && _.isFunction(customwidget.current.uniqueErrorUpdate)) {
          customwidget.current.uniqueErrorUpdate(res.badData);
        }
      } else {
        alert(_l('记录添加失败'), 3);
      }
      onSubmitEnd();
      setRequesting(false);
    })
    .fail(err => {
      onSubmitEnd();
      if (_.isObject(err)) {
        alert(err.errorMessage || _l('记录添加失败'), 3);
      } else {
        alert(err || _l('记录添加失败'), 3);
      }
    });
}

export function updateWorksheetVisibleType(worksheetId, visibleType) {
  return updatePublicWorksheetState({
    worksheetId,
    visibleType,
  });
}
