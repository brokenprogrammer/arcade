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

        #menu {
            position: absolute;
            left: 43%;
            top: 48%;
        }

        #start-button {
            font-family: 'Press Start 2P', cursive;
            font-weight: 800;
            font-size: 24px;
            color: #FFFFFF;
            border: none;
            text-decoration: none;

            width: 120px;
            height: 50px;
        }

        #game-over {
            position: absolute;
            left: 38%;
            top: 48%;

            font-family: 'Press Start 2P', cursive;
            font-weight: 800;
            font-size: 24px;
            color: #FFFFFF;
            border: none;
            text-decoration: none;

            width: 300px;
            height: 50px;
            visibility: hidden;
        }
    </style>
    
    <div id="arcade-container">
        <div id="menu">
            <a id="start-button" href="#">Start</a>
        </div>
        <div>
            <p id="game-over">Game Over!</p>
        </div>
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
        this.Running = false;
        this.Then = 0;
        this.Img = null;
    }

    connectedCallback()
    {
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
        this.shadowRoot.getElementById("start-button").addEventListener('click', this.StartGame.bind(this));
    }

    StartGame()
    {
        this.shadowRoot.getElementById("menu").remove();
        this.Running = true;
        requestAnimationFrame(this.Update.bind(this));
    }

    Update(Now)
    {
        Now *= 0.001; // NOTE: Convert to seconds.
        const DeltaTime = Now - this.Then;
        this.Then = Now;

        this.Running = this.Tetris.Update(DeltaTime);
        this.Tetris.Draw(this.Renderer, this.Img.Texture);

        if (this.Running)
        {
            requestAnimationFrame(this.Update.bind(this));
        }
        else
        {
            let GameOverText = this.shadowRoot.querySelector("#game-over");
            GameOverText.style.visibility =  "visible";
        }
    }
}