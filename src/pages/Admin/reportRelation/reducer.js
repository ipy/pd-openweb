import { Schema, arrayOf, normalize } from 'normalizr';
import * as ACTIONS from './actions';

const userSchema = new Schema('users', {
  idAttribute: 'accountId',
  defaults: {
    collapsed: true, // 折叠状态
    isLoading: false, // 加载状态
  },
});

userSchema.define({
  subordinates: arrayOf(userSchema),
});

export function parse(originData) {
  if (originData) {
    return normalize(originData, arrayOf(userSchema));
  }
  return {};
}

const updateSingleEntity = (user, action) => {
  const { type, payload } = action;
  let subordinates;
  switch (type) {
    case ACTIONS.SUBORDINATES_REQUEST:
      return { ...user, isLoading: true };
    case ACTIONS.UPDATE_ENTITY_CHILDS:
      const { source } = payload;
      const result = parse(source).result;
      return {
        ...user,
        isLoading: false,
        subordinates: _.uniq((user.subordinates || []).concat(result)),
      };
      break;
    case ACTIONS.OPEN_COLLAPSE:
    case ACTIONS.CLOSE_COLLAPSE:
      return {
        ...user,
        collapsed: type === ACTIONS.CLOSE_COLLAPSE,
      }
    case ACTIONS.REMOVE_PARENT_CHILDREN:
      const { removeId } = payload;
      subordinates = user.subordinates;
      return {
        ...user,
        subordinates: _.filter(subordinates, (id) => id !== removeId),
      };
    case ACTIONS.ADD_PARENT_CHILDREN:
      const { addId } = payload;
      subordinates = user.subordinates;
      return {
        ...user,
        subordinates: subordinates.concat(addId),
      };
  }
};

const updateEntities = (payload) => {
  const { source } = payload;
  const parsed = parse(source);
  return parsed.entities.users;
}


const initialState = {
  entities: {
    users: {},
  },
  highLightId: null,
};

export default (state = initialState, action) => {
  const { type, payload } = action;
  if (ACTIONS[type] === undefined) return state;
  const users = state.entities.users;
  const highLightId = state.highLightId;
  let id, user;
  switch (type) {
    case ACTIONS.ADD_STRUCTURES:
      return {
        entities: {
          users: {
            ...state.entities.users,
            ...updateEntities(payload),
          }
        },
        highLightId,
      };
      break;
    case ACTIONS.REMOVE_STRUCTURE:
      id = payload.id;
      const _users = { ...users };
      delete _users[id];
      return {
        entities: {
          users: _users,
        }
      };
    case ACTIONS.SUBORDINATES_REQUEST:
    case ACTIONS.UPDATE_ENTITY_CHILDS:
    case ACTIONS.ADD_PARENT_CHILDREN:
    case ACTIONS.REMOVE_PARENT_CHILDREN:
    case ACTIONS.OPEN_COLLAPSE:
    case ACTIONS.CLOSE_COLLAPSE:
      id = payload.id;
      user = users[id];
      return {
        entities: {
          users: {
            ...users,
            [id]: updateSingleEntity(user, action),
          },
        },
      };
    case ACTIONS.UPDATE_CURRENT_CHILDREN:
      id = payload.id;
      user = users[id];
      const { subordinates } = users[payload.replacedAccountId] || {};
      return {
        entities: {
          users: {
            ...users,
            [id]: {
              ...user,
              subordinates,
            }
          },
        },
        highLightId,
      };
    case ACTIONS.CLEAR_HIGHLIGHT:
      return {
        ...state,
        highLightId: null,
      };
    case ACTIONS.UPDATE_HIGHLIGHT:
      return {
        ...state,
        highLightId: payload.highLightId,
      }
    default:
      return state;
  }
}
