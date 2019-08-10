
// NOTE: Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
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