
// NOTE: Vertex shader program
const vsSource = `
    attribute vec4 vertex;

    uniform mat4 model;
    uniform mat4 projection;

    varying vec2 TexCoords;

    void main() {
        TexCoords = vertex.zw;
        gl_Position = projection * model * vec4(vertex.xy, 0.0, 1.0);
    }
    `;

// NOTE: Frag shader program
const fsSource = `
    precision mediump float;

    varying vec2 TexCoords;

    uniform sampler2D Image;

    void main() {
        gl_FragColor = texture2D(Image, TexCoords);
    }
    `;

export class Tetris
{
    constructor()
    {
        const BoardWidth = 10;
        const BoardHeight = 20;
        const BlockSize = 20; // TODO: Might be useless

        // NOTE: Initialize board.
        this.Board = new Array(BoardHeight);
        for (var Index = 0; Index < this.Board.length; ++Index)
        {
            this.Board[Index] = new Array(BoardWidth);
        }

        for (var Y = 0; Y < BoardHeight; ++Y)
        {
            for (var X = 0; X < BoardWidth; ++X)
            {
                this.Board[Y][X] = 0;
            }
        }
    }

    Init()
    {
        
    }

    Update(DeltaTime)
    {

    }

    Draw(Renderer, Texture)
    {
        // NOTE: Clear previous content.
        Renderer.Clear();

        let Position = [100, 100];
        let Size = [30, 30];
        let Rotation = 0.0;
        Renderer.Render(Texture, Position, Size, Rotation, null);
        Renderer.Render(Texture, [200, 100], Size, Rotation, null);
    }

    KeyHandler(Event)
    {
        if (Event.keyCode == 39)
        {
            // NOTE: Right pressed.
            console.log("Right Key pressed!");
        }
    }

    static get VertexShader()
    {
        return (vsSource);
    }

    static get FragmentShader()
    {
        return (fsSource);
    }
}