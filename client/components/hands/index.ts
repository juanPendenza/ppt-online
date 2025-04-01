class CustomImage extends HTMLElement {
  shadow: ShadowRoot;
  type: string = "piedra" || "papel" || "tijera";
  status: string = "active" || "inactive";
  variant: string = "player-one-hand" || "player-two-hand" || "";

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.type = this.getAttribute("type") || "piedra";
    this.status = this.getAttribute("status") || "inactive";
    this.variant = this.getAttribute("variant") || "";
  }
  connectedCallback() {
    this.render();
  }

  getImageURL(type: string) {
    const piedraURL = require("url:../../assets/piedra.png");
    const papelURL = require("url:../../assets/papel.png");
    const tijeraURL = require("url:../../assets/tijera.png");
    const URLFound = [piedraURL, papelURL, tijeraURL].find((element) =>
      element.includes(type)
    );
    return URLFound;
  }

  render() {
    const style = document.createElement("style");
    style.innerHTML = `
          .imagen{
            width: 100%;
            height: 100%;
            max-width: 180px;
            max-height: 250px;
            position: relative;
            bottom: -30px;
            
          }
          
          .player-one-hand, .player-two-hand{
            width: 150px;
            height: 320px;
            position:relative;
            transition: all 1s ease;
            
            
          }
          
         .player-one-hand{
            rotate: 180deg;
            top: -70px;
            
         }
         .player-two-hand{
          bottom: -70px;
         }
        
          .active{
            bottom: -110px;
            
          }
          .active:hover{
         
            bottom: -50px;
            transition: bottom 1s ease-out;
          }
          .active:focus{
            bottom: -10px;
          }
          .active:active{
            bottom: -10px;
          }
       
          
          
       
        
      `;

    const imgURL = this.getImageURL(this.type);

    this.shadow.innerHTML = `
          <img  class="${this.classList}" src="${imgURL}"/>
      `;
    const img = this.shadow.querySelector(".imagen");
    if (this.status == "active") {
      img?.classList.add("active");
    }
    if (this.variant == "player-one-hand") {
      img?.classList.remove("imagen");
      img?.classList.add("player-one-hand");
    } else if (this.variant == "player-two-hand") {
      img?.classList.remove("imagen");
      img?.classList.add("player-two-hand");
    }

    this.shadow.appendChild(style);
  }
}
customElements.define("custom-image", CustomImage);
