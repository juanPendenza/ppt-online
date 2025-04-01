import { state } from "../../state";
import { Router } from "@vaadin/router";

class startGame extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  addListeners() {
    const startGameButtonEl = this.querySelector(".button");
    this.startGame(startGameButtonEl);
  }

  startGame(buttonEl) {
    buttonEl.addEventListener("click", (e) => {
      state.updateStartStatus(state.getUserId(), state.getPrivateId());
      const roomContent = this.querySelector(".start-room-content");
      state.suscribe(() => {
        roomContent!.innerHTML = ` 
        <custom-text tag="p" type="paragraph">Esperando a que ${state.getOtherUserName()} presione Jugar</custom-text>
        `;
        if (state.playersAreReady()) {
          Router.go("countdown");
        }
      });
    });
  }

  render() {
    this.innerHTML = `
        <div class="main-container">
        <header class="start-game-header">
        <div class="history-container">
        <custom-text type="paragraph">${state.getPlayerOneName()}:</custom-text>
        <custom-text type="paragraph">${state.getPlayerTwoName()}:</custom-text>
        </div>
        <div class="id-container">
        <custom-text type="paragraph">Sala</custom-text>
        <custom-text type="paragraph">${state.getPublicId()}</custom-text>
        </div>
        </header>
        <div class="container">
        <div class="start-room-content">
        <custom-text tag="p" type="paragraph">Presioná jugar
        y elegí: piedra, papel o tijera antes de que pasen los 3 segundos.</custom-text>
        <button class="button">Jugar</button>
        </div>
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
customElements.define("start-page", startGame);
