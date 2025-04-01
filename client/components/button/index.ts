class CustomButton extends HTMLElement {
  shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const buttonEl = document.createElement("button");
    const style = document.createElement("style");
    style.innerHTML = `
      .button{
        height: 87px;
        min-width: 330px;
        max-width: 380px;
        border: 10px solid var(--dark-blue);
        border-radius: 10px;
        background-color: var(--blue);
        color: white;
        font-family: 'Odibee Sans', cursive;
        font-size: 45px;
      }
    `;
    this.shadow.appendChild(style);
    buttonEl.classList.add("button");
    buttonEl.textContent = this.textContent;
    this.shadow.appendChild(buttonEl);
  }
}
customElements.define("custom-button", CustomButton);
