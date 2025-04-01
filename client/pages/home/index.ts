import { state } from "../../state";
import { Router } from "@vaadin/router";

class Home extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  addListeners() {
    const newGameButtonEl = this.querySelector(".new-game-room");
    newGameButtonEl?.addEventListener("click", () => {
      this.submitNewRoom();
    });
    const loginRoomButtonEl = this.querySelector(".login-game-room");
    loginRoomButtonEl?.addEventListener("click", () => {
      this.displayForm();
    });
    if (state.getError().error) {
      state.resetError();
    }
  }
  submitNewRoom() {
    const userId = state.getUserId();
    state.createRoom(userId, state.getUserName());
    state.suscribe(() => {
      Router.go("/game-room");
    });
  }

  displayForm() {
    const formEl = this.querySelector(".existing-room-form");
    const castFormEl = formEl as any;
    castFormEl.style.display = "flex";
    castFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      let roomId = e.target["room-id"].value;
      state.enterRoom(roomId, state.getUserName());
      state.suscribe(() => {
        if (state.getError().error) {
          const container = this.querySelector(".home-container");
          container!.innerHTML = `
          <custom-text tag="p" type="paragraph">${
            state.getError().message
          }</custom-text>
          <button class="button">Volver</button>
          `;
          let buttonEl = container?.querySelector(".button");
          buttonEl?.addEventListener("click", () => {
            this.render();
          });
        } else if (state.getPublicId()) {
          Router.go("/game-room");
        }
      });
    });
  }

  render() {
    this.innerHTML = `
    <div class="main-container">
    <custom-text>Piedra Papel o Tijera </custom-text>
    <div class="home-container">
    <custom-text type="subtitle">Bienvenidx ${state.getUserName()}</custom-text>
    <button class="new-game-room button">Nuevo Juego</button>
    <button class="login-game-room button">Ingresar a una sala</button>
    <form class="existing-room-form">
    <label class="label"> Codigo de Sala
    <input class="input" type="number" name="room-id"/>
    </label>
    <button class="button">Ingresa</button>
    </form>
    <div class="hands-container">
    <custom-image class="imagen" type="tijera"></custom-image>
    <custom-image class="imagen" type="piedra"></custom-image>
    <custom-image class="imagen" type="papel"></custom-image>
    </div>
    </div>
    </div>
    `;
    this.addListeners();
  }
}
customElements.define("home-page", Home);
