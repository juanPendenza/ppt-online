import { state } from "../../state";
import { Router } from "@vaadin/router";

class gameRoom extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  addListeners() {
    this.listenPlayersStatus();
    state.listenOnlineStatus(state.getUserId(), state.getPrivateId());
  }
  listenPlayersStatus() {
    state.suscribe(() => {
      if (state.playersAreOnline()) {
        Router.go("start-game");
      }
    });
  }
  render() {
    this.innerHTML = `
        <div class="game-room-container">
        <div class="code-container">
        <custom-text type="paragraph">Sala</custom-text>
        <custom-text type="paragraph">${state.getPublicId()}</custom-text>
        </div>
        <div class="game-room-content">
        <custom-text tag="p" type="paragraph">Comparti el codigo:</custom-text>
        <custom-text tag="h1" type="title">${state.getPublicId()}</custom-text>
        <custom-text tag="p" type="paragraph">Con tu contrincante</custom-text>
        </div>
        <div class="hands-container">
        <custom-image class="imagen" type="tijera"></custom-image>
        <custom-image class="imagen" type="piedra"></custom-image>
        <custom-image class="imagen" type="papel"></custom-image>
        </div>
        </div>
    `;
    this.addListeners();
  }
}
customElements.define("game-room-page", gameRoom);
