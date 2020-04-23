import { createBrowserHistory, History } from "history";
import { Dispatch } from "redux";
import { takeLatest } from "redux-saga/effects";
import { ChangeScreenAction, CHANGE_SCREEN } from "../actions";
import { Play, ScreenState } from "../types";
import joinFakeGame from "./fake";
import game from "./game";
import lobby from "./lobby";
import getAccessToken from "./login";
import { updateUrl, decodeUrl } from "./urls";

function* mainSaga(previousScreen: ScreenState, id?: string) {
  yield* joinFakeGame();

  const token = yield* getAccessToken();

  switch (previousScreen) {
    default:
      const play: Play = yield* lobby(token);
      yield* game(token, play);
  }
}

export default function* rootSaga(dispatch: Dispatch) {
  const history = createBrowserHistory();
  yield takeLatest(CHANGE_SCREEN, (a) =>
    updateUrl(history, a as ChangeScreenAction)
  );

  const { screen, id } = decodeUrl(history);

  while (1) {
    yield* mainSaga(screen, id);
  }
}
