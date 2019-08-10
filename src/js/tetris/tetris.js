
// NOTE: Vertex shader program
const vsSource = `
    attribute vec4 vertex;

    uniform mat4 model;
    uniform mat4 projection;

    void main() {
        gl_Position = projection * model * vec4(vertex.xy, 0.0, 1.0);
    }
    `;

// NOTE: Frag shader program
const fsSource = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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

    Draw(Renderer)
    {
        Renderer.Render();
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