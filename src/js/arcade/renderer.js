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
                vertex: this.Context.getAttribLocation(ShaderProgram, 'vertex'),
            },
            uniformLocations: {
                projection: this.Context.getUniformLocation(ShaderProgram, 'projection'),
                model: this.Context.getUniformLocation(ShaderProgram, 'model'),
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

    initBuffers()
    {
        const PositionBuffer = this.Context.createBuffer();
        this.Context.bindBuffer(this.Context.ARRAY_BUFFER, PositionBuffer);

        const positions = [
            // Pos      // Tex
            0.0, 1.0, 0.0, 1.0,
            1.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 
        
            0.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 0.0
            ];
        this.Context.bufferData(this.Context.ARRAY_BUFFER, new Float32Array(positions), this.Context.STATIC_DRAW);

        return {
            position: PositionBuffer,
        };
    }

    Render(Texture)
    {
        // TODO: Lines here are temp.
        const buffers = this.initBuffers();
        const programInfo = this.ProgramInfo;

        this.Context.clearColor(0.0, 0.0, 0.0, 1.0);
        //this.Context.clearDepth(1.0);
        //this.Context.enable(this.Context.DEPTH_TEST);
        //this.Context.depthFunc(this.Context.LEQUAL);

        // NOTE: Clear before draw
        this.Context.clear(this.Context.COLOR_BUFFER_BIT);

        let Position = [100, 100];
        let Size = [300, 300];
        let Rotation = 0.0;

        //this.Context.bindTexture(this.Context.TEXTURE_2D, Texture);

        this.Context.useProgram(programInfo.program);

        const Projection = mat4.create();
        mat4.ortho(Projection, 0.0, 800.0, 600.0, 0.0, -1.0, 1.0);

        let Model = mat4.create();

        mat4.translate(Model, Model, [Position[0], Position[1], 1.0]);

        // vec3.set(Translation, 0.5 * 10, 0.5*10, 0.0);
        mat4.translate(Model, Model, [0.5 * Size[0], 0.5 * Size[1], 0.0]);
        
        // vec3.set(Translation, 0.0, 0.0, 1.0);
        mat4.rotate(Model, Model, 0, [0.0, 0.0, 1.0]);

        // vec3.set(Translation, -0.5 * 10, -0.5*10, 0.0);
        mat4.translate(Model, Model, [-0.5 * Size[0], -0.5 * Size[1], 0.0]);

        // vec3.set(Translation, 1.0, 1.0, 1.0);
        mat4.scale(Model, Model, [Size[0], Size[1], 1.0]);

        {
            const numComponents = 4;            // pull out 2 values per iteration
            const type = this.Context.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;            // don't normalize
            const stride = 0;                   // how many bytes to get from one set of values to the next
                                                // 0 = use type and numComponents above
            const offset = 0;                   // how many bytes inside the buffer to start from
            this.Context.bindBuffer(this.Context.ARRAY_BUFFER, buffers.position);
            this.Context.vertexAttribPointer(
                programInfo.attribLocations.vertex,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.Context.enableVertexAttribArray(
                programInfo.attribLocations.vertex);
        }
        
        // NOTE: Setting the shader uniforms.
        this.Context.uniformMatrix4fv(programInfo.uniformLocations.model, false, Model);
        this.Context.uniformMatrix4fv(programInfo.uniformLocations.projection, false, Projection);

        {
          const offset = 0;
          const vertexCount = 6;
          this.Context.drawArrays(this.Context.TRIANGLE_STRIP, offset, vertexCount);
        }
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