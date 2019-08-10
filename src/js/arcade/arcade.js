import { Renderer } from "./renderer.js";
import { Tetris } from "../tetris/tetris.js";

const Template = document.createElement("template");
Template.innerHTML = `
    <style></style>
    <h1>Test</h1>
    <div id="arcade-container">
        <canvas id="arcade"></canvas>
    </div>
    `;

export class Arcade extends window.HTMLElement 
{
    constructor ()
    {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(Template.content.cloneNode(true));

        // TODO: This is temporary.
        this.Tetris = new Tetris();
    }

    connectedCallback()
    {
        // TODO: Add layers of canvas for UI, game, and background?
        // TODO: Add games here.

        // TODO:First the menu of the arcade should show 
        //      but for now we instantly start the tetris game.

        let Canvas = this.shadowRoot.querySelector("#arcade");
        this.Renderer = new Renderer(Canvas);
        this.Renderer.setShaders(Tetris.VertexShader, Tetris.FragmentShader);
        this.Renderer.Clear();
    }
}