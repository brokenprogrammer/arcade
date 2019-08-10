/*
*/
export class Renderer
{
    constructor(Canvas)
    {
        this.ProgramInfo = null;
        this.Canvas = Canvas

        // NOTE: Checking for canvas support.
        if (Canvas.getContext)
        {
            this.Context = Canvas.getContext("webgl");

            // Validate that WebGL is available.
            if (this.Context == null)
            {
                this.UseGL = false;
                this.Context = Canvas.getContext("2d");
            }
            else
            {
                this.UseGL = true;
            }
        }
    }

    setShaders(VertexShader, FragmentShader)
    {
        const ShaderProgram = this.initShaderProgram(VertexShader, FragmentShader);

        this.ProgramInfo = 
        {
            program: ShaderProgram,
            attribLocations: {
                vertexPosition: this.Context.getAttribLocation(ShaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                projectionMatrix: this.Context.getUniformLocation(ShaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.Context.getUniformLocation(ShaderProgram, 'uModelViewMatrix'),
            },
        };
    }

    initShaderProgram(VertexShader, FragmentShader)
    {
        const LoadedVertexShader = this.loadShader(this.Context.VERTEX_SHADER, VertexShader);
        const LoadedFragmentShader = this.loadShader(this.Context.FRAGMENT_SHADER, FragmentShader);

        // NOTE: Creating the shader program.
        const ShaderProgram = this.Context.createProgram();
        this.Context.attachShader(ShaderProgram, LoadedVertexShader);
        this.Context.attachShader(ShaderProgram, LoadedFragmentShader);
        this.Context.linkProgram(ShaderProgram);

        // NOTE: Check that the linking of the shader program succeeded.
        if (!this.Context.getProgramParameter(ShaderProgram, this.Context.LINK_STATUS))
        {
            return null;
        }

        return ShaderProgram;
    }

    loadShader(Type, Source)
    {
        const Shader = this.Context.createShader(Type);

        this.Context.shaderSource(Shader, Source);
        this.Context.compileShader(Shader);

        if (!this.Context.getShaderParameter(Shader, this.Context.COMPILE_STATUS))
        {
            console.log('An error occurred compiling the shaders: ' + this.Context.getShaderInfoLog(Shader));
            this.Context.deleteShader(Shader);
            return null;
        }

        return Shader;
    }

    Clear()
    {
        if (this.UseGL)
        {
            this.Context.clearColor(0.0, 0.0, 0.0, 1.0);
            this.Context.clear(this.Context.COLOR_BUFFER_BIT);
        }
    }
}