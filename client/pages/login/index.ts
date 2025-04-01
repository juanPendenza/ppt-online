import { state } from "../../state";
import { Router } from "@vaadin/router";

class Login extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  addListeners() {
    const signUpFormEl = this.querySelector(".sign-up");
    const loginFormEl = this.querySelector(".login");
    this.submitSignUpForm(signUpFormEl);
    this.submitLoginForm(loginFormEl);
  }
  submitSignUpForm(formEl) {
    formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      let target = event.target as any;
      state.signUpUser(target.email.value, target.name.value);
      state.suscribe(() => {
        Router.go("/home");
      });
    });
  }
  submitLoginForm(formEl) {
    formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      let target = event.target as any;
      state.loginUser(target.email.value);
      state.suscribe(() => {
        Router.go("/home");
      });
    });
  }
  render() {
    this.innerHTML = `
    <div class="main-container">
    <custom-text type="subtitle">Registrate</custom-text>
    <div class="form-container">
    <form class="form sign-up">
    <label class="label"> Email
    <input class="input" type="email" name="email"/>
    </label>
    <label class="label"> Nombre
    <input class="input" type="text" name="name"/>
    </label>
    <button class="button">Registrate</button>
    </form>
    </div>  
    <custom-text type="subtitle">Ingresa</custom-text>
    <div class="form-container">
    <form class="form login">
    <label class="label"> Email
    <input class="input" type="email" name="email"/>
    </label>
    <button class="button">Ingresa</button>
    </form>
    </div>
    </div>  
    `;
    this.addListeners();
  }
}
customElements.define("login-page", Login);
