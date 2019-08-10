import "../arcade/renderer.js";

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
        this.StepTime = 300;
        this.ElapsedTime = 0;

        this.BoardLocationX = 240;
        this.BoardLocationY = 40;

        this.BoardWidth = 10;
        this.BoardHeight = 20;
        this.BlockSize = 26;

        this.CurrentPiece = null;
        this.CurrentPieceLocation = null;
        this.CurrentScore = 0;

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
        var Color = Math.floor(Math.random() * Math.floor(6));
        
        this.CurrentPiece = new Array();
        this.Pieces[Color].forEach(elem => {
            this.CurrentPiece.push(elem);
        });

        let Dimension = this.CurrentPiece.length;

        // TODO: Color the piece..
        for (let X = 0; X < Dimension; ++X)
        {
            for (let Y = 0; Y < Dimension; ++Y)
            {
                if (this.CurrentPiece[Y][X] !== 0)
                {
                    // TODO: This is trash
                    if (Color === 0) Color = 1;
                    this.CurrentPiece[Y][X] = Color;
                }
            }
        }
        
        this.CurrentPieceLocation = [4, 0];
    }

    CanPlace(Piece, X, Y)
    {
        let PieceDimension = Piece.length;

        for (let PosX = 0; PosX < PieceDimension; ++PosX)
        {
            for (let PosY = 0; PosY < PieceDimension; ++PosY)
            {
                let CoordinateX = X + PosX;
                let CoordinateY = Y + PosY;

                if (Piece[PosY][PosX] !== 0)
                {
                    if (CoordinateX < 0 || CoordinateX >= this.BoardWidth)
                    {
                        return TetrisPlaceStates.OFFSCREEN;
                    }

                    if (CoordinateY >= this.BoardHeight || this.Board[CoordinateY][CoordinateX] !== 0)
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
        for (let Y = this.BoardHeight -1; Y >= 0; --Y)
        {
            var IsComplete = true;
            for (let X = 0; X < this.BoardWidth; ++X)
            {
                if (this.Board[Y][X] == 0)
                {
                    IsComplete = false;
                }
            }

            if (IsComplete)
            {
                for (let YC = Y; YC > 0; --YC)
                {
                    for (let X = 0; X < this.BoardWidth; ++X)
                    {
                        this.Board[YC][X] = this.Board[YC - 1][X];
                    }
                }

                ++Y;

                // TODO: SCORE!
            }
        }
    }

    Place(X, Y)
    {
        let Dimension = this.CurrentPiece.length;

        for (let PY = 0; PY < Dimension; ++PY)
        {
            for (let PX = 0; PX < Dimension; ++PX)
            {
                let CoordinateX = X + PX;
                let CoordinateY = Y + PY;

                if (this.CurrentPiece[PY][PX] > 0)
                {
                    this.Board[CoordinateY][CoordinateX] = this.CurrentPiece[PY][PX];
                }
            }
        }

        this.RemoveFullLines();
    }

    Rotate(Left)
    {
        console.log("Inside");
        let Dimension = this.CurrentPiece.length;
        let NewPiece = new Array(Dimension);
        for (var Index = 0; Index < NewPiece.length; ++Index)
        {
            NewPiece[Index] = new Array(Dimension);
        }

        for (let Y = 0; Y < Dimension; ++Y)
        {
            for (let X = 0; X < Dimension; ++X)
            {
                NewPiece[Y][X] = 0;
            }
        }

        for (let I = 0; I < Dimension; ++I)
        {
            for (let J = 0; J < Dimension; ++J)
            {
                if (Left)
                {
                    NewPiece[J][I] = this.CurrentPiece[I][Dimension - 1 - J];
                }
                else
                {
                    NewPiece[J][I] = this.CurrentPiece[Dimension - 1 - I][J];
                }
            }
        }

        return NewPiece;
    }


    Init()
    {
        // TODO: Initiate textures / colors
    }

    Update(DeltaTime)
    {
        this.ElapsedTime += DeltaTime;
        if (this.ElapsedTime > (this.StepTime / 1000))
        {
            if (this.CurrentPiece !== null)
            {
                let NewPieceLocation = [this.CurrentPieceLocation[0], 1+this.CurrentPieceLocation[1]];;

                let PieceState = this.CanPlace(this.CurrentPiece, NewPieceLocation[0], NewPieceLocation[1]);
                if (PieceState !== TetrisPlaceStates.ALLOWED)
                {
                    console.log(PieceState)
                    this.Place(this.CurrentPieceLocation[0], this.CurrentPieceLocation[1]);
                    this.SpawnPiece();

                    PieceState = this.CanPlace(this.CurrentPiece, this.CurrentPieceLocation[0], this.CurrentPieceLocation[1]);
                    if (PieceState === TetrisPlaceStates.BLOCKED)
                    {
                        // TODO: Game Over!
                    }
                }
                else
                {
                    this.CurrentPieceLocation = NewPieceLocation;
                }

                this.ElapsedTime = 0;
            }
            else
            {
                console.log("GAME STARTED!")
                this.SpawnPiece();
                this.ElapsedTime = 0;
            }
        }
    }

    Draw(Renderer, Texture)
    {
        // NOTE: Clear previous content.
        Renderer.Clear();

        // NOTE: Drawing the board.
        for (var Y = 0; Y < this.BoardHeight; ++Y)
        {
            for (var X = 0; X < this.BoardWidth; ++X)
            {
                if (this.Board[Y][X] > 0)
                {
                    let Position = [this.BoardLocationX + (X * this.BlockSize), this.BoardLocationY + (Y * this.BlockSize)];
                    let Size = [this.BlockSize, this.BlockSize];
                    let Rotation = 0.0;
                    let Color = this.Colors[this.Board[Y][X]];

                    Renderer.Render(Texture, Position, Size, Rotation, Color);
                }
            }
        }

        if (this.CurrentPiece !== null)
        {
            let Dimension = this.CurrentPiece.length;
            // NOTE: Drawing the spawned piece.
            for (let PY = 0; PY < Dimension; ++PY)
            {
                for (let PX = 0; PX < Dimension; ++PX)
                {
                    if (this.CurrentPiece[PY][PX] !== 0)
                    {
                        let Position = [this.BoardLocationX + ((this.CurrentPieceLocation[0] + PX) * this.BlockSize), this.BoardLocationY + ((this.CurrentPieceLocation[1] + PY) * this.BlockSize)];
                        let Size = [this.BlockSize, this.BlockSize];
                        let Rotation = 0.0;
                        let Color = this.Colors[this.CurrentPiece[PY][PX]];

                        Renderer.Render(Texture, Position, Size, Rotation, Color);
                    }
                }
            }
        }

        // NOTE: Drawing the current Score.
        Renderer.setScoreText('TopScore', "1000000");
        Renderer.setScoreText('Score', this.CurrentScore);
        Renderer.setScoreText('Lines', 0);
        Renderer.setScoreText('Level', 0);
    }

    KeyHandler(Event)
    {
        switch(Event.key)
        {
            case "ArrowLeft":
            {
                let NewLocation = [this.CurrentPieceLocation[0], this.CurrentPieceLocation[1]];
                NewLocation[0]--;

                let PlaceState = this.CanPlace(this.CurrentPiece, NewLocation[0], NewLocation[1]);
                if (PlaceState === TetrisPlaceStates.ALLOWED)
                {
                    this.CurrentPieceLocation = NewLocation;
                }
            } break;
            case "ArrowRight":
            {
                let NewLocation = [this.CurrentPieceLocation[0], this.CurrentPieceLocation[1]];
                NewLocation[0]++;

                let PlaceState = this.CanPlace(this.CurrentPiece, NewLocation[0], NewLocation[1]);
                if (PlaceState === TetrisPlaceStates.ALLOWED)
                {
                    this.CurrentPieceLocation = NewLocation;
                }
            } break;
            case "ArrowUp":
            {
                let NewPiece = this.Rotate(true);

                let PlaceState = this.CanPlace(NewPiece, this.CurrentPieceLocation[0], this.CurrentPieceLocation[1]);
                if (PlaceState === TetrisPlaceStates.ALLOWED)
                {
                    this.CurrentPiece = NewPiece;
                }
            } break;
            case "ArrowDown":
            {
                this.ElapsedTime = this.StepTime + 1;
            } break;
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