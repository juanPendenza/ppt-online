class CustomText extends HTMLElement {
  shadow: ShadowRoot;
  tag: string = "p" || "h1";
  type: string = "title";
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.tag = this.getAttribute("tag") || this.tag;
    this.type = this.getAttribute("type") || this.type;
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const element = document.createElement(this.tag);
    const style = document.createElement("style");
    style.innerHTML = `
      .title{
        font-family: 'Roboto Mono', monospace;
        font-weight: 700;
        font-size: 80px;
        line-height: 70px;
        text-align:center;
        margin-top: 20px;
        color: var(--green);
      }

      .subtitle{
        font-family: 'Roboto Mono', monospace;
        font-weight: 500;
        font-size: 40px;
        text-align:center;
        margin: 10px
       
      }
      .paragraph{
        font-family: 'Odibee Sans', cursive;
        font-size: 45px;
        margin: 0;
      }
    `;
    element.textContent = this.textContent;
    element.classList.add(this.type);
    this.shadow.appendChild(style);
    this.shadow.appendChild(element);
  }
}
customElements.define("custom-text", CustomText);
