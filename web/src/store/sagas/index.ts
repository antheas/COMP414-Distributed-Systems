import { createBrowserHistory } from "history";
import { Dispatch } from "redux";
import { takeLatest } from "redux-saga/effects";
import { ChangeScreenAction, CHANGE_SCREEN } from "../actions";
import { Game, ScreenState } from "../types";
import joinFakeGame from "./fake";
import game from "./game";
import { decodeUrl, updateUrl } from "./urls";

function* mainSaga(previousScreen: ScreenState, id?: string) {
  yield* joinFakeGame();

  // const token = yield* getAccessToken();

  // yield* administration();
  switch (previousScreen) {
    default:
      // const play: Play = yield* lobby(token);
      yield* game("", {
        id: "1234",
        game: Game.CHESS,
        opponent: "john",
        started: false,
      });
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
