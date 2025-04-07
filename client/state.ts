import { rtdb, ref, onValue } from "./db";

let API_BASE_URL = "";
if (process.env.ENVIRONMENT == "development") {
  API_BASE_URL = "http://localhost:3002";
} else if (process.env.ENVIRONMENT == "production") {
  API_BASE_URL = "https://ppt-online.onrender.com";
}

const state = {
  data: {
    userData: {
      name: "",
      email: "",
      userId: "",
    },
    rtdbData: {
      publicId: "",
      privateId: "",
      currentGame: {
        playerOne: {
          id: "",
          name: "",
          online: false,
          start: false,
          currentHand: "",
        },
        playerTwo: {
          id: "",
          name: "",
          online: false,
          start: false,
          currentHand: "",
        },
        history: {
          playerOne: 0,
          playerTwo: 0,
          result: "",
        },
      },
      error: false,
      message: "",
    },
  },
  listeners: [],
  getState() {
    return this.data;
  },
  init() {
    let localData;
    const storageData = localStorage.getItem("actual-state");
    if (storageData) {
      localData = storageData;
      this.setState(JSON.parse(localData!));
    } else {
      localData = this.getState();
      this.setState(localData);
    }
  },
  setState(newState) {
    this.data = newState;
    for (const cb of this.listeners) {
      cb();
    }
    localStorage.setItem("actual-state", JSON.stringify(newState));
  },
  suscribe(callback: (any) => any) {
    this.listeners.push(callback);
  },
  setUserData(name, email, userId?) {
    const currentState = this.getState();
    currentState.userData.name = name;
    currentState.userData.email = email;
    currentState.userData.userId = userId;
    this.setState(currentState);
  },
  listenRoom() {
    const currentState = this.getState();
    const chatRoomRef = ref(rtdb, "/rooms/" + state.getPrivateId());
    onValue(chatRoomRef, (snapShot) => {
      const data = snapShot.val();
      currentState.rtdbData.currentGame = data.currentGame;
      console.log("setie el estado desde el listen room", currentState);
      state.setState(currentState);
    });
  },
  listenOnlineStatus(userId: string, roomId: string) {
    window.addEventListener("beforeunload", (e) => {
      if (state.getUserName() == state.getPlayerTwoName()) {
        fetch(API_BASE_URL + "/rooms/logout", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            roomId,
            player: "playerTwo",
          }),
        });
      } else {
        fetch(API_BASE_URL + "/rooms/logout", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            roomId,
            player: "playerOne",
          }),
        });
      }
    });
  },
  signUpUser(email: string, name: string) {
    fetch(API_BASE_URL + "/signup", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: name,
        email: email,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        state.setUserData(name, email, res.id);
      });
  },
  loginUser(email: string) {
    fetch(API_BASE_URL + "/auth", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((ResFromServer) => {
        state.setUserData(
          ResFromServer.data.nombre,
          ResFromServer.data.email,
          ResFromServer.id
        );
      });
  },
  createRoom(userId: string, userName: string) {
    fetch(API_BASE_URL + "/rooms", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        userName,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((resFromServer) => {
        state.setRtdbData(resFromServer.id, resFromServer.privateId);
        this.listenRoom();
      });
  },
  enterRoom(roomId: string, userName: string) {
    const userId = state.getUserId();
    fetch(
      API_BASE_URL +
        "/rooms/" +
        roomId +
        "?userId=" +
        userId +
        "&userName=" +
        userName,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          state.catchError(data);
        } else {
          state.setRtdbData(roomId, data.rtdbRoomId);
          this.listenRoom();
        }
      });
  },
  updateStartStatus(userId: string, roomId: string) {
    if (state.getUserName() == state.getPlayerTwoName()) {
      fetch(API_BASE_URL + "/rooms/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          roomId,
          player: "playerTwo",
        }),
      });
    } else {
      fetch(API_BASE_URL + "/rooms/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          roomId,
          player: "playerOne",
        }),
      });
    }
  },
  updateHandPick(userId: string, roomId: string, hand: string) {
    if (state.getUserName() == state.getPlayerTwoName()) {
      fetch(API_BASE_URL + "/rooms/hand", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          roomId,
          player: "playerTwo",
          hand,
        }),
      });
    } else {
      fetch(API_BASE_URL + "/rooms/hand", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          roomId,
          player: "playerOne",
          hand,
        }),
      });
    }
  },
  updateHistory(userId: string, roomId: string, result: string) {
    if (state.getUserName() == state.getPlayerTwoName()) {
      fetch(API_BASE_URL + "/rooms/history", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          roomId,
          result,
        }),
      });
    }
  },
  resetFlags(userId: string, roomId: string) {
    if (state.getUserName() == state.getPlayerTwoName()) {
      fetch(API_BASE_URL + "/rooms/reset", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          roomId,
          player: "playerTwo",
          hand: "",
        }),
      });
    } else {
      fetch(API_BASE_URL + "/rooms/reset", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          roomId,
          player: "playerOne",
          hand: "",
        }),
      });
    }
  },
  catchError(data) {
    const currentState = this.getState();
    currentState.rtdbData.error = true;
    currentState.rtdbData.message = data.message;
    this.setState(currentState);
  },
  resetError() {
    const currentState = this.getState();
    currentState.rtdbData.error = false;
    currentState.rtdbData.message = "";
    this.setState(currentState);
  },
  setFlags(player: string) {
    const currentState = this.getState();
    currentState.rtdbData.currentGame[player].start = false;
    currentState.rtdbData.currentGame[player].currentHand = "";
    this.setState(currentState);
  },
  setRtdbData(publicId: string, privateId: string) {
    const currentState = this.getState();
    currentState.rtdbData.publicId = publicId;
    currentState.rtdbData.privateId = privateId;
    this.setState(currentState);
  },
  setHistory(playerOneScore, playerTwoScore) {
    const currentState = this.getState();
    currentState.rtdbData.currentGame.history.playerOne = playerOneScore;
    currentState.rtdbData.currentGame.history.playerTwo = playerTwoScore;
    this.setState(currentState);
  },
  setPlayerStartStatus(player: string) {
    const currentState = this.getState();
    currentState.rtdbData.currentGame[player].start = true;
    this.setState(currentState);
  },
  setMove(player: string, hand: string) {
    const currentState = this.getState();
    currentState.rtdbData.currentGame[player].currentHand = hand;
    this.setState(currentState);
  },
  getUserName() {
    const currentState = this.getState();
    return currentState.userData.name;
  },
  getUserId() {
    const currentState = this.getState();
    return currentState.userData.userId;
  },
  getPublicId() {
    const currentState = this.getState();
    return currentState.rtdbData.publicId;
  },
  getPrivateId() {
    const currentState = this.getState();
    return currentState.rtdbData.privateId;
  },
  getPlayerOneName() {
    const currentState = this.getState();
    return currentState.rtdbData.currentGame.playerOne.name;
  },
  getPlayerTwoName() {
    const currentState = this.getState();
    return currentState.rtdbData.currentGame.playerTwo.name;
  },
  getOtherUserName() {
    const currentState = this.getState();
    if (currentState.rtdbData.currentGame.playerOne.start) {
      return this.getPlayerTwoName();
    } else {
      return this.getPlayerOneName();
    }
  },
  getPlayerOneHand() {
    const currentState = this.getState();
    return currentState.rtdbData.currentGame.playerOne.currentHand;
  },
  getPlayerTwoHand() {
    const currentState = this.getState();
    return currentState.rtdbData.currentGame.playerTwo.currentHand;
  },
  getHistory() {
    const currentState = this.getState();
    return currentState.rtdbData.currentGame.history;
  },
  getError() {
    const currentState = this.getState();
    return {
      error: currentState.rtdbData.error,
      message: currentState.rtdbData.message,
    };
  },
  playersAreOnline() {
    const currentState = this.getState();
    return (
      currentState.rtdbData.currentGame.playerOne.online &&
      currentState.rtdbData.currentGame.playerTwo.online
    );
  },
  playersAreReady() {
    const currentState = this.getState();
    return (
      currentState.rtdbData.currentGame.playerOne.start &&
      currentState.rtdbData.currentGame.playerTwo.start
    );
  },
  playersStatusIsFalse() {
    const currentState = this.getState();
    let res: Boolean = false;
    if (
      currentState.rtdbData.currentGame.playerOne.start == false &&
      currentState.rtdbData.currentGame.playerTwo.start == false
    ) {
      res = true;
    }
    return res;
  },
  playersChoseMove() {
    const currentState = this.getState();
    let movePlayerOne = currentState.rtdbData.currentGame.playerOne.currentHand;
    let movePlayerTwo = currentState.rtdbData.currentGame.playerTwo.currentHand;
    let res: boolean =
      (movePlayerOne == "tijera" ||
        movePlayerOne == "papel" ||
        movePlayerOne == "piedra") &&
      (movePlayerTwo == "tijera" ||
        movePlayerTwo == "papel" ||
        movePlayerTwo == "piedra");
    return res;
  },
  isPlayerOne() {
    return this.getUserName() == this.getPlayerOneName();
  },
  whoWins(playerOneHand: string, playerTwoHand: string) {
    if (playerOneHand == playerTwoHand) {
      return "empate";
    } else if (
      (playerOneHand == "tijera" && playerTwoHand == "papel") ||
      (playerOneHand == "piedra" && playerTwoHand == "tijera") ||
      (playerOneHand == "papel" && playerTwoHand == "piedra")
    ) {
      return "playerOne";
    } else if (
      (playerOneHand == "tijera" && playerTwoHand == "piedra") ||
      (playerOneHand == "piedra" && playerTwoHand == "papel") ||
      (playerOneHand == "papel" && playerTwoHand == "tijera")
    ) {
      return "playerTwo";
    }
  },
};

export { state };
