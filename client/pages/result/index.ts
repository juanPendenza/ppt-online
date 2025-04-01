import { state } from "../../state";
import { Router } from "@vaadin/router";

class result extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  addListeners() {
    state.resetFlags(state.getUserId(), state.getPrivateId());
    const container = this.querySelector(".results-container");
    let containerStyle = document.createElement("style");
    containerStyle.innerHTML = `
    .results-container{
    height: 100vh;
    background: ${this.processResults().background}
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    }
    `;
    container?.appendChild(containerStyle);
    const buttonEl = this.querySelector(".button");
    buttonEl?.addEventListener("click", () => {
      state.updateStartStatus(state.getUserId(), state.getPrivateId());
      state.suscribe(() => {
        container!.innerHTML = `
        <div class="start-room-content">
        <custom-text tag="p" type="paragraph">Esperando a que ${state.getOtherUserName()} presione Jugar</custom-text>
        </div>
        `;
        container?.appendChild(containerStyle);
        if (state.playersAreReady()) {
          Router.go("countdown");
        }
      });
    });
  }

  processResults() {
    const result = state.whoWins(
      state.getPlayerOneHand(),
      state.getPlayerTwoHand()
    );
    let background;
    let imgURL;
    if (result == "playerOne") {
      if (state.isPlayerOne()) {
        background = "rgb(95 203 99 / 90%);";
        imgURL = require("url:../../assets/ganaste.png");
      } else {
        background = "rgba(137, 73, 73, 0.9);";
        imgURL = require("url:../../assets/perdiste.png");
      }
      return { imgURL, background };
    } else if (result == "playerTwo") {
      if (state.isPlayerOne()) {
        background = "rgba(137, 73, 73, 0.9);";
        imgURL = require("url:../../assets/perdiste.png");
      } else {
        background = "rgb(95 203 99 / 90%);";
        imgURL = require("url:../../assets/ganaste.png");
      }
      return { imgURL, background };
    } else background = "rgb(254 211 92 / 90%);";
    imgURL = require("url:../../assets/empate.png");

    return { imgURL, background };
  }
  render() {
    this.innerHTML = `
    <div class="results-container">
    <div class="img-container">
      <img src="${this.processResults().imgURL}"/>
      </div>
     <div class="score-container">
     <custom-text tag="h1" type="paragraph">Score</custom-text>
     <div>
     <custom-text class="user-score" tag="p" type="paragraph">${state.getPlayerOneName()}:${
      state.getHistory().playerOne
    }</custom-text>
     <custom-text class="computer-score" tag="p" type="paragraph">${state.getPlayerTwoName()}:${
      state.getHistory().playerTwo
    }</custom-text>
     </div>
     </div>
     <button class="button">Volver a Jugar</-button>
     </div>
    `;
    this.addListeners();
  }
}
customElements.define("result-page", result);
