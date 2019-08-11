import { Renderer } from "./renderer.js";
import { Tetris } from "../tetris/tetris.js";

const Template = document.createElement("template");
Template.innerHTML = `
    <style>
        #arcade-container {
            width: 960px;
            position: relative;
        }

        #arcade-text {
            font-family: 'Press Start 2P', cursive;

            position: absolute;
            right: 10px;
            top: 10px;
            color: #FFFFFF;
        }
    </style>
    
    <h1>Test</h1>
    <div id="arcade-container">
        <canvas id="arcade"></canvas>
        <div id=arcade-text>
            <div>Top: <span id="top-score">0</span></div>
            <div>Score: <span id="score">0</span></div>
            <div>Lines: <span id="lines">0</span></div>
            <div>Level: <span id="level">0</span></div>
        </div>
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
        this.Img = null;
    }

    connectedCallback()
    {
        // TODO: Add layers of canvas for UI, game, and background?
        // TODO: Add games here.

        // TODO:First the menu of the arcade should show 
        //      but for now we instantly start the tetris game.

        let Text = this.shadowRoot.querySelector("#arcade-text");
        let Canvas = this.shadowRoot.querySelector("#arcade");
        Canvas.width = 960;
        Canvas.height = 720;

        this.Renderer = new Renderer(Canvas, Text);
        
        this.Img = this.Renderer.initTexture("img/tetrisblock1.png");
        this.Renderer.setGameShaders(Tetris.VertexShader, Tetris.FragmentShader);
        this.Renderer.Clear();

        this.Tetris.Init(this.Renderer);
        
        document.addEventListener("keydown", (event) => { this.Tetris.KeyHandler(event); }, false);

        requestAnimationFrame(this.Update.bind(this));
    }

    Update(Now)
    {
        Now *= 0.001; // NOTE: Convert to seconds.
        const DeltaTime = Now - this.Then;
        this.Then = Now;

        this.Tetris.Update(DeltaTime);
        this.Tetris.Draw(this.Renderer, this.Img.Texture);

        requestAnimationFrame(this.Update.bind(this));
    }
}