import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import ScrollView from 'ming-ui/components/ScrollView';
import Message from '../Message';
import config from '../../utils/config';
import * as ajax from '../../utils/ajax';
import * as actions from '../../redux/actions';
import * as utils from '../../utils';
import Constant from '../../utils/constant';
import './index.less';
import { addGroupMembers } from '../../utils/group';

class MessageView extends Component {
  constructor(props) {
    super(props);
    this.currentHeight = 0;
    this.state = {
      isMore: true,
      loading: true,
      isBottom: true,
      topUnread: 0,
      gotoMessageId: '',
      isDownLoadingMessage: false,
      direction: 'up',
      errorParam: false,
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { session } = this.props;
    // nextState.isBottom !== this.state.isBottom ||
    if (session.id === nextProps.currentSession.value) {
      return true;
    }
    return false;
  }
  componentDidMount() {
    const { session, sessionList } = this.props;
    const topUnread = sessionList.filter(item => item.value == session.id)[0];
    const type = session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
    if (!topUnread) return;
    const unreadCount = topUnread.messageCount || topUnread.count;
    this.getMessage(
      {
        type,
        id: session.id,
        num: topUnread ? (unreadCount > config.MSG_LENGTH_MORE ? unreadCount : 0) : 0,
      },
      'up'
    ).then((res) => {
      res = $.isArray(res) ? res.reverse() : [];
      const isAddUnreadLine = topUnread && unreadCount;
      if (isAddUnreadLine && res[res.length - unreadCount]) {
        res[res.length - unreadCount].unreadLine = true;
      }
      if (session.accountId && !session.isContact) {
        const remind = Object.assign({}, res[res.length - 1]);
        remind.id = Date.now();
        remind.isContact = false;
        remind.sysType = Constant.MSGTYPE_SYSTEM_ERROR;
        res.push(remind);
      }
      this.props.dispatch(actions.setMessage(session.id, utils.formatMessages(res)));
    });
  }
  componentWillReceiveProps(nextProps) {
    const { session, sessionList, currentSession, gotoMessage } = nextProps;
    const gotoMessageId = gotoMessage[session.id];
    // 右侧点击了搜索消息
    if (gotoMessageId) {
      this.handleGotoMessage(gotoMessageId);
      this.props.dispatch(actions.removeGotoMessage(session.id));
    }
    // 打开聊天框时，有10条以上的未读消息
    if (currentSession && currentSession.value) {
      const topUnread = sessionList.filter(item => item.value == session.id)[0] || {};
      if (!topUnread.messageCount) {
        return;
      }
      this.setState({
        topUnread: topUnread.messageCount > config.MSG_LENGTH_MORE ? topUnread.messageCount : 0,
      });
    }
  }
  componentDidUpdate(prevProps) {
    const { session, messages, sessionList } = prevProps;
    const { id } = session;
    const prevMessage = messages[id];
    const newMessages = this.props.messages[id];
    const topUnread = sessionList.filter(item => item.value == id)[0] || {};
    const scrollView = findDOMNode(this.scrollView);
    const { direction, isDownLoadingMessage } = this.state;
    const $ChatPanel = $(`#ChatPanel-${session.id}`);
    const isBottom = $ChatPanel.data('isBottom') == undefined ? true : $ChatPanel.data('isBottom');
    this.scrollViewEl = scrollView;
    // 如果存在向下滚动的逻辑，新的消息不需要滚动到底部
    // if (direction === 'down') {
    //   return;
    // }
    // 加载完新消息，存在需要查询的消息
    if (this.state.gotoMessageId) {
      this.handleGotoMessage(this.state.gotoMessageId);
      return;
    }
    // 刚加载完第一页的数据
    if (!prevMessage) {
      this.handleScrollEnd();
      return;
    }
    // 加载一页
    if (newMessages.length - prevMessage.length >= config.MSG_LENGTH_MORE && direction == 'up') {
      setTimeout(() => {
        $(scrollView).nanoScroller({ scrollTop: scrollView.nanoscroller.contentHeight - this.currentHeight });
      }, 0);
      return;
    }
    // 刚发送的消息 & 收到新消息
    if (newMessages.length - prevMessage.length === 1) {
      const message = newMessages[newMessages.length - 1];
      if (message.isMine) {
        isDownLoadingMessage ? this.handleBottomEnd() : this.handleScrollEnd();
      }
    }
    // 已经打开的窗口，有新消息
    if (newMessages.length === prevMessage.length) {
      if (topUnread.count) {
        this.handleScrollEnd();
      } else {
        const endMessage = newMessages[newMessages.length - 1] || {};
        const { type, card, isMine, id } = endMessage;
        if (isMine && type === Constant.MSGTYPE_FILE && typeof id === 'number') {
          this.handleScrollEnd();
        }
        if (isMine && type === Constant.MSGTYPE_CARD && (card.md === 'worksheet' || card.md === 'kcfile') && typeof id === 'number') {
          this.handleScrollEnd();
        }
      }
    }
    if (newMessages.length - prevMessage.length >= 1 && direction == 'up') {
      this.handleScrollEnd();
    }
  }
  handleScrollEnd() {
    const { session } = this.props;
    utils.scrollEnd(session.id, true);
  }
  getMessage(param, direction) {
    this.setState({
      loading: true,
      errorParam: false,
      direction,
    });
    return new Promise((resolve, reject) => {
      ajax.getMessage(param).done((res) => {
        this.setState({
          loading: false,
          isMore: !(res.length < config.MSG_LENGTH_MORE),
        });
        resolve(res);
      }).fail(error => {
        this.setState({
          errorParam: param,
        });
      });
    });
  }
  handleGotoMessage(id) {
    const { session, messages } = this.props;
    const currentMessage = messages[session.id] || [];
    const message = _.find(currentMessage, { id });
    if (message && message.id) {
      const { gotoMessageId } = this.state;
      const messageEl = $(`#Message-${message.id}`);
      const scrollView = findDOMNode(this.scrollView);
      const { paneHeight, contentScrollTop } = scrollView.nanoscroller;
      if (gotoMessageId) {
        this.setState({ gotoMessageId: '', isDownLoadingMessage: true });
      }
      // 指定的消息在不在可视区
      $(scrollView)
        .nanoScroller({ flash: true })
        .nanoScroller({
          scrollTop: contentScrollTop + messageEl.position().top - (paneHeight - messageEl.height()) / 2,
        });
      utils.highlightMessage(id);
    } else {
      const type = session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
      ajax
        .getMessageById({
          msgid: id,
          type,
          id: session.id,
          num: config.MSG_LENGTH_MORE,
        })
        .then((res) => {
          this.props.dispatch(actions.resetMessage(session.id, utils.formatMessages(res)));
          this.setState({
            gotoMessageId: id,
          });
        });
    }
  }
  handleScroll(event, values) {
    const { loading, isMore, topUnread, isDownLoadingMessage } = this.state;
    const { session, messages, bottomUnreadMessage } = this.props;
    const type = session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
    const messageList = messages[session.id] || [];
    const position = parseInt(values.position);
    const scrollView = findDOMNode(this.scrollView);
    const { maxScrollTop, contentScrollTop, paneHeight } = scrollView ? scrollView.nanoscroller : {};
    const $ChatPanel = $(`#ChatPanel-${session.id}`);
    const isBottom = $ChatPanel.data('isBottom') == undefined ? true : $ChatPanel.data('isBottom');
    const bottomUnread = bottomUnreadMessage[session.id] || [];
    const diff = maxScrollTop - position;
    if (position === 0 && isMore) {
      const { time } = messageList[0] || {};
      if (loading || !time || !scrollView) {
        return;
      }
      this.currentHeight = scrollView.nanoscroller.contentHeight;
      this.getMessage(
        {
          sincetime: time,
          type,
          id: session.id,
        },
        'up'
      ).then((res) => {
        res = $.isArray(res) ? res.reverse() : [];
        this.props.dispatch(actions.addPageMessage(session.id, utils.formatMessages(res)));
      });
    } else if (position === maxScrollTop && isDownLoadingMessage) {
      const { time } = messageList[messageList.length - 1] || {};
      if (loading || !time) {
        return;
      }
      this.setState({
        loading: true,
        direction: 'down',
      });
      ajax
        .getMessage({
          sincetime: time,
          type,
          id: session.id,
          direction: 1,
        })
        .then((res) => {
          this.setState({
            loading: false,
          });
          if (res.length) {
            this.props.dispatch(actions.pushPageMessage(session.id, utils.formatMessages(res)));
          } else {
            this.setState({
              isDownLoadingMessage: false,
            });
            this.props.dispatch(actions.removeBottomUnreadMessage(session.id));
          }
        });
    }

    if (maxScrollTop - contentScrollTop > paneHeight) {
      if (topUnread) {
        this.setState({
          topUnread: 0,
        });
        this.props.dispatch(
          actions.updateSessionList({
            id: session.id,
            messageCount: 0,
          })
        );
      }
      if (isBottom) {
        $ChatPanel.data('isBottom', false);
        $ChatPanel.find('.ChatPanel-iconBottom').removeClass('hidden');
      }
    } else if (!isBottom && !isDownLoadingMessage) {
      $ChatPanel.data('isBottom', true);
      $ChatPanel.find('.ChatPanel-iconBottom').addClass('hidden');
    }

    if (diff <= 1 && bottomUnread.length && !isDownLoadingMessage) {
      this.props.dispatch(actions.removeBottomUnreadMessage(session.id));
      this.props.dispatch(actions.pushPageMessage(session.id, utils.formatMessages(bottomUnread)));
      this.handleScrollEnd();
    }
  }
  handleBottomEnd() {
    const { isDownLoadingMessage } = this.state;
    if (isDownLoadingMessage) {
      const { session } = this.props;
      const type = session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
      this.setState({ isDownLoadingMessage: false });
      this.props.dispatch(actions.removeBottomUnreadMessage(session.id));
      this.getMessage(
        {
          type,
          id: session.id,
        },
        'up'
      ).then((res) => {
        res = $.isArray(res) ? res.reverse() : [];
        this.props.dispatch(actions.resetMessage(session.id, utils.formatMessages(res)));
      });
    } else {
      this.handleScrollEnd();
    }
  }
  handleTopUnreadScroll() {
    const { topUnread } = this.state;
    const { session, messages, sessionList } = this.props;
    const messageList = messages[session.id] || [];
    const message = messageList[messageList.length - topUnread] || {};
    const unreadMessage = sessionList.filter(item => item.value == session.id)[0] || {};
    const atId = unreadMessage.messageAtlist && unreadMessage.messageAtlist.length ? unreadMessage.messageAtlist[0] : false;
    const id = atId || message.id;
    const messageEl = $(`#Message-${id}`);
    const scrollView = findDOMNode(this.scrollView);
    const top = messageEl.position() ? messageEl.position().top : 0;
    const scrollTop = scrollView.nanoscroller.maxScrollTop - Math.abs(top);
    // 指定的消息在不在可视区
    if (top + messageEl.height() <= messageEl.height()) {
      $(scrollView)
        .nanoScroller({ flash: true })
        .nanoScroller({
          scrollTop,
        });
    }
    this.setState({
      topUnread: 0,
    });
    this.props.dispatch(
      actions.updateSessionList({
        id: session.id,
        messageCount: 0,
      })
    );
    utils.highlightMessage(id);
  }
  handleRemoveTopUnread(event) {
    event.stopPropagation();
    const { session } = this.props;
    this.setState({
      topUnread: 0,
    });
    this.props.dispatch(
      actions.updateSessionList({
        id: session.id,
        messageCount: 0,
      })
    );
  }
  handleBottomUnreadScroll() {
    const { isDownLoadingMessage } = this.state;
    if (isDownLoadingMessage) {
      this.handleBottomEnd();
    } else {
      this.handleScrollEnd();
    }
  }
  handleAddMembers() {
    const { session } = this.props;
    const { isForbidInvite, isAdmin } = session;
    if (isAdmin || !isForbidInvite) {
      addGroupMembers({
        id: session.id,
        type: Constant.SESSIONTYPE_GROUP,
      });
    } else {
      alert(_l('当前仅允许群主及管理员邀请新成员'), 2);
      return false;
    }
  }
  renderInviteMessage() {
    const { session } = this.props;
    const text = session.isPost ? _l('群组') : _l('聊天');
    return (
      <div className="ChatPanel-InviteMessage">
        <div className="InviteMessage-icon">
          <div className="InviteMessage-iconImg" />
        </div>
        <div className="InviteMessage-title">{_l('%0创建成功', text)}</div>
        <div className="InviteMessage-content">
          {_l('快去')}
          {
            <span onClick={this.handleAddMembers.bind(this)} className="addMember ThemeColor3">
              {_l('邀请好友')}
            </span>
          }
          {_l('加入当前%0吧', text)}
        </div>
      </div>
    );
  }
  handleLoadMore() {
    const { session, messages } = this.props;
    const { loading, errorParam } = this.state;
    const messageList = messages[session.id] || [];
    if (errorParam) {
      this.getMessage(errorParam, 'up').then(res => {
        res = $.isArray(res) ? res.reverse() : [];
        if (messageList.length) {
          this.props.dispatch(actions.addPageMessage(session.id, utils.formatMessages(res)));
        } else {
          this.props.dispatch(actions.setMessage(session.id, utils.formatMessages(res)));
        }
      });
    } else {
      if (loading) return;
      this.handleScroll(undefined, {
        position: 0,
      });
    }
  }
  renderTopInfo() {
    const { session } = this.props;
    return <div>{session.isGroup ? this.renderInviteMessage() : <div className="ChatPanel-messageInfo">{_l('没有更早的历史消息了')}</div>}</div>;
  }
  renderLoading() {
    const { loading, errorParam } = this.state;
    return (
      <div className="ChatPanel-messageInfo ChatPanel-messageLoading ThemeColor3" onClick={this.handleLoadMore.bind(this)}>
        {loading ? (errorParam ? _l('加载失败，点击重新加载') : _l('加载中...')) : _l('加载更多')}
      </div>
    );
  }
  renderTopUnread() {
    const { session, sessionList } = this.props;
    const { topUnread } = this.state;
    const unreadMessage = sessionList.filter(item => item.value == session.id)[0] || {};
    let atId = unreadMessage.messageAtlist && unreadMessage.messageAtlist.length ? unreadMessage.messageAtlist[0] : false;
    const messageEl = $(`#Message-${atId}`);
    const scrollView = this.scrollViewEl;
    if (scrollView && scrollView.nanoscroller && messageEl.size()) {
      // const scrollTop = scrollView.nanoscroller.maxScrollTop - Math.abs(messageEl.position().top);
      // at 消息在可视区就清除掉
      if (messageEl.position().top + messageEl.height() >= messageEl.height()) {
        atId = null;
      }
    }
    return (
      <div className={cx('ChatPanel-unreadTop', { hidden: !topUnread })} onClick={this.handleTopUnreadScroll.bind(this)}>
        <span className="ChatPanel-unreadTop-content ThemeColor3">
          {atId ? _l('有人@了你') : _l('%0条未读消息', topUnread)}
        </span>
        <i className="icon-delete" onClick={this.handleRemoveTopUnread.bind(this)} />
      </div>
    );
  }
  renderBottomUnread() {
    const { session, bottomUnreadMessage } = this.props;
    const bottomUnread = bottomUnreadMessage[session.id] || [];
    const message = bottomUnread[bottomUnread.length - 1];
    const { sysType } = message;
    return (
      <div className="ChatPanel-unreadBottom ThemeBGColor4" onClick={this.handleBottomUnreadScroll.bind(this)}>
        {sysType ? (
          undefined
        ) : (
          <div className="userAvatar">
            <img src={'logo' in message ? message.logo : `${window.config.AttrPath}default.png?imageView2/1/w/100/h/100/q/100`} />
          </div>
        )}
        <div className="content">{sysType ? message.msg.con : `${message.fromAccount.name}: ${message.msg.con}`}</div>
        <div className="count">{_l('%0条新消息', bottomUnread.length)}</div>
      </div>
    );
  }
  renderIconBottom() {
    return <div className='ChatPanel-iconBottom icon-bottom ThemeColor3 hidden' onClick={this.handleBottomEnd.bind(this)} />;
  }
  render() {
    const { isMore, isDownLoadingMessage } = this.state;
    const { session, messages, bottomUnreadMessage } = this.props;
    const bottomUnread = bottomUnreadMessage[session.id] || [];
    const { id } = session;
    const messageList = (messages[id] || []).filter(item => _.isObject(item));
    return (
      <div className="ChatPanel-sessionList">
        {this.renderTopUnread()}
        <ScrollView
          updateEvent={this.handleScroll.bind(this)}
          ref={(scrollView) => {
            this.scrollView = scrollView;
          }}
        >
          {isMore ? this.renderLoading() : this.renderTopInfo()}
          {messageList.map(item => (
            <Message key={item.id || item.waitingId} message={item} session={session} onGotoMessage={this.handleGotoMessage.bind(this)} />
          ))}
          {isMore && isDownLoadingMessage ? this.renderLoading() : undefined}
        </ScrollView>
        {bottomUnread.length ? this.renderBottomUnread() : undefined}
        {this.renderIconBottom()}
      </div>
    );
  }
}

export default connect((state) => {
  const { currentSession, messages, sessionList, gotoMessage, bottomUnreadMessage } = state.chat;

  return {
    currentSession,
    messages,
    sessionList,
    gotoMessage,
    bottomUnreadMessage,
  };
})(MessageView);
