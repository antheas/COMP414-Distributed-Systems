import { Dispatch } from "redux";
import { put } from "redux-saga/effects";
import {
  updateLoginData,
  updateLoginStep,
  updateLobby,
  setPlay,
  changeScreen,
} from "../actions";
import { LoginStep, Game, ScreenState, LoaderStep } from "../types";

function* joinFakeGame() {
  yield put(changeScreen(ScreenState.GAME, LoaderStep.INACTIVE));

  yield put(updateLoginData("bob", "1234", "Mary"));
  yield put(updateLoginStep(LoginStep.FORM, "Login Failed"));
  yield put(
    updateLobby({
      fetched: true,
      ongoingPlays: [
        {
          id: "1234",
          game: Game.CHESS,
          opponent: "john",
          started: false,
          won: false,
        },
        {
          id: "12345",
          game: Game.CHESS,
          opponent: "john",
          started: false,
          won: false,
        },
        {
          id: "123456",
          game: Game.CHESS,
          opponent: "john",
          started: false,
          won: false,
        },
      ],
      tournaments: [
        {
          id: "1234567",
          game: Game.CHESS,
          name: "Very Fun Tournament",
          players: 4,
          maxPlayers: 10,
        },
        {
          id: "12345678",
          game: Game.CHESS,
          name: "Very Fun Tournament 2",
          players: 4,
          maxPlayers: 10,
        },
        {
          id: "123456789",
          game: Game.CHESS,
          name: "Very Fun Tournament 3",
          players: 4,
          maxPlayers: 10,
        },
      ],
    })
  );

  yield put(
    setPlay({
      id: "1234",
      game: Game.CHESS,
      opponent: "john",
      started: false,
      won: false,
    })
  );
}

export default function* rootSaga(dispatch: Dispatch) {
  yield* joinFakeGame();
}
