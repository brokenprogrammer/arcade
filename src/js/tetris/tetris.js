
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
    uniform vec3 TextureColor;

    void main() {
        gl_FragColor = vec4(TextureColor, 1.0) * texture2D(Image, TexCoords);
    }
    `;

const TetrisPlaceStates = 
{
    ALLOWED: 'Allowed',
    BLOCKED: 'Blocked',
    OFFSCREEN: 'Offscreen',
};


export class Tetris
{
    constructor()
    {
        this.BoardWidth = 10;
        this.BoardHeight = 20;
        this.BlockSize = 32; // TODO: Might be useless

        this.CurrentPiece = null;
        this.CurrentPieceLocation = null;

        // NOTE: Initialize board.
        this.Board = new Array(this.BoardHeight);
        for (var Index = 0; Index < this.Board.length; ++Index)
        {
            this.Board[Index] = new Array(this.BoardWidth);
        }

        for (var Y = 0; Y < this.BoardHeight; ++Y)
        {
            for (var X = 0; X < this.BoardWidth; ++X)
            {
                this.Board[Y][X] = 0;
                if (Y > this.BoardHeight - 4)
                {
                   this.Board[Y][X] = Math.floor(Math.random() * Math.floor(6));
                }
            }
        }

        // TODO: Normalize theese colors.
        this.Colors = [
            [252, 185, 65], // NOTE: Orange
            [44, 130, 201], // NOTE: Blue
            [214, 69, 65], // NOTE: Red
            [240, 255, 0], // NOTE: Yellow
            [255, 0, 255], // NOTE: Magenta
            [63, 195, 128], // NOTE: Green
        ];

        this.Pieces = new Array();

        // NOTE: I Piece
        this.Pieces.push([
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ]);

        // NOTE: J
        this.Pieces.push([
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ]);

        // NOTE: O
        this.Pieces.push([
            [1, 1],
            [1, 1],
        ]);

        // NOTE: S
        this.Pieces.push([
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ]);

        // NOTE: T
        this.Pieces.push([
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ]);

        // NOTE: T
        this.Pieces.push([
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ]);
    }

    SpawnPiece()
    {
        let Color = Math.floor(Math.random() * Math.floor(6));

        this.CurrentPiece = this.Pieces[Color];
        let Dimension = this.CurrentPiece.length;

        // TODO: Color the piece..
        for (let X = 0; X < Dimension; ++X)
        {
            for (let Y = 0; Y < Dimension; ++Y)
            {
                this.CurrentPiece[X][Y] *= (Color + 1);
            }
        }
        
        this.CurrentPieceLocation = [0, 0];
    }

    CanPlace(X, Y)
    {
        let PieceDimension = this.CurrentPiece.length;

        for (let PosX = 0; PosX < PieceDimension; ++PosX)
        {
            for (let PosY = 0; PosY < PieceDimension; ++PosY)
            {
                let CoordinateX = X + PosX;
                let CoordinateY = Y + PosY;

                if (this.CurrentPiece[PosX][PosY] != 0)
                {
                    if (CoordinateX < 0 || CoordinateX >= this.BoardWidth)
                    {
                        return TetrisPlaceStates.OFFSCREEN;
                    }

                    if (CoordinateY >= this.BoardHeight || this.Board[CoordinateX][CoordinateY] != 0)
                    {
                        return TetrisPlaceStates.BLOCKED;
                    }
                }
            }
        }

        return TetrisPlaceStates.ALLOWED;
    }

    RemoveFullLines()
    {
        // TODO:
    }

    Place()
    {
        // TODO: 
    }

    Rotate()
    {
        // TODO:
    }


    Init()
    {
        // TODO: Initiate textures / colors
    }

    Update(DeltaTime)
    {

    }

    Draw(Renderer, Texture)
    {
        // NOTE: Clear previous content.
        Renderer.Clear();

        for (var Y = 0; Y < this.BoardHeight; ++Y)
        {
            for (var X = 0; X < this.BoardWidth; ++X)
            {
                if (this.Board[Y][X] > 0)
                {
                    let Position = [X * 32, Y * 32];
                    let Size = [32, 32];
                    let Rotation = 0.0;
                    let Color = this.Colors[this.Board[Y][X]];

                    Renderer.Render(Texture, Position, Size, Rotation, Color);
                }
            }
        }
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