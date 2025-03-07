import React, { useRef, useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import MDEditor from '@mdfe/ckeditor5-custom-build';
import styled from 'styled-components';
import { getToken } from 'src/util';
import './less/RichText.less';
import cx from 'classnames';
import '@mdfe/ckeditor5-custom-build/build/translations/zh.js';
import '@mdfe/ckeditor5-custom-build/build/translations/en.js';
const Wrapper = styled.div(
  ({ minHeight, maxWidth }) => `
  .ck {
    .ck-sticky-panel {
      display: none;
    }
    &.ck-toolbar,
    &.ck-button {
      min-height: 28px !important;
      .ck-icon{
        font-size: 10px;
        color: #515151;
      }
    }
    &.ck-toolbar-dropdown>.ck-dropdown__panel{
      max-width: ${maxWidth}px ;
    }
    .ck-toolbar__items {
      height: 100% !important;
    }
    &.ck-editor__top {
      .ck-toolbar_grouping {
        background: #fafafa !important;
        border: 1px solid #dddddd !important;
        height: 36px !important;
      }
      .ck-dropdown__panel {
        .ck-list {
          margin-left: 0;
        }
      }
      .ck-dropdown__panel.ck-dropdown__panel_sw {
        background: #ffffff !important;
        border: 1px solid #e8e8e8 !important;
        box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.16) !important;
        // height: 36px !important;
      }
      .ck-dropdown__panel.ck-dropdown__panel_ne,
      .ck.ck-dropdown .ck-dropdown__panel.ck-dropdown__panel_se{
        left: initial;
        right: 0;
      }
    }
    .ck-content {
      min-height: ${minHeight || 90}px !important;
      // max-height: 640px !important;
      border: 1px solid #f7f7f7 !important;
      font-size: 13px !important;
      background: #f7f7f7 !important;
      border-radius: 3px !important;
      box-shadow: none !important;
      &.ck-focused {
        background: #fff !important;
        border: 1px solid #2196f3 !important;
      }
    }
  }
  &.disabled {
    .ck-content {
      background: #fff !important;
      border: 0px !important;
      &.ck-focused {
        background: #fff !important;
        border: 1px solid #fff !important;
      }
    }
    .ck.ck-editor__editable.ck-blurred .ck-widget.ck-widget_selected, .ck.ck-editor__editable.ck-blurred .ck-widget.ck-widget_selected:hover{
      outline: none !important;
    }
  }
  &.mdEditorContent{
    .ck {
      .ck-content {
        border: none !important;
        background: #fff !important;
        border-radius: none !important;
        box-shadow: none !important;
        &.ck-focused {
          background: #fff !important;
          border: none !important;
        }
      }
    }
  }
  &.showTool{
    .ck-sticky-panel {
      display: block;
      .ck-toolbar{
        background: #fafafa;
        border: 1px solid #eaeaea !important;
        border-left:0;
        border-right:0;
      }
    }
  }
  &.editorNull{
    min-height: ${minHeight || 90}px ;
    background: #fff ;
    border-radius: 2px;
    padding: 10px;
    color: #bdbdbd;
    border: 1px solid #dddddd;
    overflow: hidden;
  }
  &.publicRichText{
    .ck .ck-content {
      max-height: 600px !important;
    }
  }
  &.richTextForM,&.taskDetailEdit{
    .ck .ck-content {
      max-height: 500px !important;
    }
    .ck-dropdown__panel.ck-dropdown__panel_ne,
    .ck.ck-dropdown .ck-dropdown__panel.ck-dropdown__panel_se{
      right: initial!important;
    }
  }
  &.remarkControl{
    .ck .ck-content {
      max-height: 600px !important;
      border: 0 !important;
      background: none !important;
      padding: 0 !important;
    }
  }
  &.fieldEditorRemark {
    .ck .ck-content {
      min-height: ${minHeight || 90}px ;
      max-height: 500px !important;
      background: none !important;
      border: 1px solid #dddddd!important;
      border-radius: 2px!important;
      &:hover{
        border: 1px solid #2196f3!important;
      }
    }
  }
`,
);
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  // Starts the upload process.
  upload() {
    return new Promise((resolve, reject) => {
      this._initRequest();
      this._initListeners(resolve, reject);
      this._sendRequest(resolve, reject);
    });
  }

  // Aborts the upload process.
  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  // Example implementation using XMLHttpRequest.
  _initRequest() {
    const xhr = (this.xhr = new XMLHttpRequest());

    xhr.open('POST', md.global.FileStoreConfig.uploadHost, true);
  }

  // Initializes XMLHttpRequest listeners.
  _initListeners(resolve, reject) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = "Couldn't upload file:" + ` ${loader.file.name}.`;

    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());
    // xhr.addEventListener('load', () => {
    //   const response = xhr.response;
    //   if (!response || response.error) {
    //     return reject(response && response.error ? response.error.message : genericErrorText);
    //   }

    //   // If the upload is successful, resolve the upload promise with an object containing
    //   // at least the "default" URL, pointing to the image on the server.
    //   resolve({
    //     default: JSON.parse(xhr.responseText).keyUrl,
    //   });
    // });

    if (xhr.upload) {
      xhr.upload.addEventListener('progress', evt => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  // Prepares the data and sends the request.
  _sendRequest(resolve, reject) {
    const data = new FormData();
    this.loader.file.then(result => {
      let fileExt = `.${File.GetExt(result.name)}`;
      let isPic = File.isPicture(fileExt);
      this.url = '';
      getToken([{ bucket: isPic ? 4 : 2, ext: fileExt }]).then(res => {
        data.append('token', res[0].uptoken);
        data.append('file', result);
        data.append('key', res[0].key);
        data.append('x:serverName', res[0].serverName);
        data.append('x:filePath', res[0].key.replace(res[0].fileName, ''));
        data.append('x:fileName', res[0].fileName);
        data.append(
          'x:originalFileName',
          encodeURIComponent(
            res[0].fileName.indexOf('.') > -1 ? res[0].fileName.split('.').slice(0, -1).join('.') : res[0].fileName,
          ),
        );
        var fileExt = '.' + File.GetExt(res[0].fileName);
        data.append('x:fileExt', fileExt);
        this.url = res[0].url;
        this.xhr.send(data);
      });
      this.xhr.addEventListener('load', () => {
        const response = this.xhr.response;
        if (!response || response.error) {
          return reject(response && response.error ? response.error.message : genericErrorText);
        }

        // If the upload is successful, resolve the upload promise with an object containing
        // at least the "default" URL, pointing to the image on the server.
        resolve({
          default: this.url,
        });
        this.url = '';
      });
    });
  }
}

export default ({
  data,
  disabled,
  onSave,
  onActualSave,
  className,
  placeholder,
  minHeight,
  showTool,
  onClickNull,
  changeSetting,
  id,
  maxWidth,
}) => {
  const editorDiv = useRef();
  let editorDom = useRef();
  useEffect(() => {
    if (!disabled && editorDom && editorDom.current && editorDom.current.editor) {
      editorDom.current.editor.plugins.get('FileRepository').createUploadAdapter = loader => {
        return new MyUploadAdapter(loader);
      };
    }
  }, [disabled]);
  if (disabled && !data) {
    return (
      <Wrapper
        className={cx('editorNull', { Hand: !!onClickNull })}
        onClick={() => {
          onClickNull && onClickNull();
        }}
      >
        {placeholder}
      </Wrapper>
    );
  }
  const lang = () => {
    const lang = getCookie('i18n_langtag') || getNavigatorLang();
    if (lang === 'zh-Hant') {
      return 'zh';
    } else if (lang !== 'en') {
      return 'zh-cn';
    } else {
      return 'en';
    }
  };
  return (
    <Wrapper
      className={cx(className, { disabled, showTool })}
      minHeight={minHeight}
      maxWidth={maxWidth}
      ref={editorDiv}
      onClick={() => {
        onClickNull && disabled && onClickNull();
      }}
    >
      <CKEditor
        editor={MDEditor}
        id={id}
        config={{
          language: lang(),
          toolbar: {
            items: [
              'undo',
              'redo',
              'removeFormat',
              '|',
              'paragraph',
              'heading1',
              'heading2',
              'heading3',
              '|',
              'fontFamily',
              'fontSize',
              'fontColor',
              'highlight',
              '|',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              'subscript',
              'superscript',
              '|',
              'bulletedList',
              'numberedList',
              'todoList',
              '|',
              'alignment',
              'indent',
              'outdent',
              '|',
              'horizontalLine',
              'blockQuote',
              'link',
              'code',
              'imageUpload',
              'mediaEmbed',
              'insertTable',
              'codeBlock',
              '|',
              'sourceEditing',
              'findAndReplace',
              // 'htmlEmbed',
            ],
            shouldNotGroupWhenFull: showTool,
          },
          heading: {
            options: [
              { model: 'paragraph', title: _l('正文'), class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: _l('一级标题'), class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: _l('二级标题'), class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: _l('三级标题'), class: 'ck-heading_heading3' },
            ],
          },
          image: {
            toolbar: [
              'imageTextAlternative',
              'imageStyle:inline',
              'imageStyle:block',
              'imageStyle:side',
              '|',
              'toggleImageCaption',
            ],
          },
          highlight: {
            options: [
              {
                model: 'yellowMarker',
                class: 'marker-yellow',
                title: _l('黄色标记'),
                color: 'var(--ck-highlight-marker-yellow)',
                type: 'marker',
              },
              {
                model: 'greenMarker',
                class: 'marker-green',
                title: _l('绿色标记'),
                color: 'var(--ck-highlight-marker-green)',
                type: 'marker',
              },
              {
                model: 'pinkMarker',
                class: 'marker-pink',
                title: _l('粉色标记'),
                color: 'var(--ck-highlight-marker-pink)',
                type: 'marker',
              },
              {
                model: 'blueMarker',
                class: 'marker-blue',
                title: _l('蓝色标记'),
                color: 'var(--ck-highlight-marker-blue)',
                type: 'marker',
              },
            ],
          },
          fontFamily: {
            options: [
              'default',
              'Arial, Helvetica, sans-serif',
              'Courier New, Courier, monospace',
              'Georgia, serif',
              'Lucida Sans Unicode, Lucida Grande, sans-serif',
              'Tahoma, Geneva, sans-serif',
              'Times New Roman, Times, serif',
              'Trebuchet MS, Helvetica, sans-serif',
              'Verdana, Geneva, sans-serif',
            ],
          },
          table: {
            contentToolbar: [
              'tableColumn',
              'tableRow',
              'mergeTableCells',
              'tableProperties',
              'tableCellProperties',
              'toggleTableCaption',
            ],
          },
          htmlSupport: {
            allow: [
              {
                styles: true,
              },
            ],
          },
        }}
        disabled={disabled}
        data={data}
        ref={editorDom}
        onReady={editor => {
          if (!!disabled) {
            return;
          }
          if (editor && editor.plugins) {
            editor.plugins.get('FileRepository').createUploadAdapter = loader => {
              return new MyUploadAdapter(loader);
            };
          }
        }}
        onChange={(event, editor) => {
          if (!!disabled) {
            return;
          }
          const data = editor.getData();
          changeSetting && changeSetting(true);
          if (onActualSave) {
            onActualSave(data);
          }
        }}
        onBlur={(event, editor) => {
          if (!!disabled) {
            return;
          }
          if (onSave) {
            const data = editor.getData();
            onSave(data);
          }
        }}
        onFocus={(event, editor) => {
          if (!!disabled) {
            return;
          }
          setTimeout(() => {
            !showTool && !disabled && $(editorDiv.current).find('.ck-sticky-panel').show();
          }, 300);
        }}
      />
    </Wrapper>
  );
};
