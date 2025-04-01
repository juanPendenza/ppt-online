import { state } from "../../state";
import { Router } from "@vaadin/router";

class preview extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  addListeners() {
    state.updateHistory(
      state.getUserId(),
      state.getPrivateId(),
      state.whoWins(state.getPlayerOneHand(), state.getPlayerTwoHand())!
    );
    state.suscribe(() => {
      Router.go("result");
    });
  }

  render() {
    this.innerHTML = `
    <div class="game-container">
    <custom-image class="imagen" variant="player-one-hand" type=${state.getPlayerOneHand()}></custom-image>
    <custom-image class="imagen" variant="player-two-hand" type=${state.getPlayerTwoHand()}></custom-image>
    </div>
    `;
    this.addListeners();
  }
}
customElements.define("preview-page", preview);
