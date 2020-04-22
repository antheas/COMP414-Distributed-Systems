import {
  SetPlayAction,
  SET_PLAY,
  UpdatePlayDataAction,
  UPDATE_PLAY_DATA,
  UPDATE_MESSAGE,
  UpdateMessageAction,
  UPDATE_HISTORY,
  UpdateHistoryAction,
} from "../actions/game";
import { NULL_PLAY_STATE, PlayState } from "../types";

export default function game(
  state = NULL_PLAY_STATE,
  action:
    | SetPlayAction
    | UpdatePlayDataAction
    | UpdateMessageAction
    | UpdateHistoryAction
): PlayState {
  switch (action.type) {
    case SET_PLAY:
      return {
        ...state,
        play: action.play,
      };
    case UPDATE_PLAY_DATA:
      return {
        ...state,
        step: action.step,
        data: action.data,
      };
    case UPDATE_MESSAGE:
      return {
        ...state,
        message: action.message,
      };
    case UPDATE_HISTORY:
      return {
        ...state,
        history: action.history,
      };
    default:
      return state;
  }
}
