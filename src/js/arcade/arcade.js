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
        this.Then = 0;
    }

    connectedCallback()
    {
        // TODO: Add layers of canvas for UI, game, and background?
        // TODO: Add games here.

        // TODO:First the menu of the arcade should show 
        //      but for now we instantly start the tetris game.

        let Canvas = this.shadowRoot.querySelector("#arcade");
        Canvas.width = 800;
        Canvas.height = 600;

        this.Renderer = new Renderer(Canvas);
        this.Renderer.setShaders(Tetris.VertexShader, Tetris.FragmentShader);
        this.Renderer.Clear();
        
        this.Renderer.Render();
        
        document.addEventListener("keydown", this.Tetris.KeyHandler, false);

        requestAnimationFrame(this.Update.bind(this));
    }

    Update(Now)
    {
        Now *= 0.001; // NOTE: Convert to seconds.
        const DeltaTime = Now - this.Then;
        this.Then = Now;

        this.Tetris.Update(DeltaTime);
        this.Tetris.Draw(this.Renderer);

        requestAnimationFrame(this.Update.bind(this));
    }
}