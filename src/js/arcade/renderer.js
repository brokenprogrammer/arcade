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

    initBuffers()
    {
        const PositionBuffer = this.Context.createBuffer();
        this.Context.bindBuffer(this.Context.ARRAY_BUFFER, PositionBuffer);

        const positions = [
            -1.0,  1.0,
            1.0,  1.0,
            -1.0, -1.0,
            1.0, -1.0,
            ];
        this.Context.bufferData(this.Context.ARRAY_BUFFER, new Float32Array(positions), this.Context.STATIC_DRAW);

        return {
            position: PositionBuffer,
        };
    }

    Render()
    {
        // TODO: Lines here are temp.
        const buffers = this.initBuffers();
        const programInfo = this.ProgramInfo;

        this.Context.clearColor(0.0, 0.0, 0.0, 1.0);
        this.Context.clearDepth(1.0);
        this.Context.enable(this.Context.DEPTH_TEST);
        this.Context.depthFunc(this.Context.LEQUAL);

        // NOTE: Clear before draw
        this.Context.clear(this.Context.COLOR_BUFFER_BIT | this.Context.DEPTH_BUFFER_BIT);

        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.

        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = this.Context.canvas.clientWidth / this.Context.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);
        
        const modelViewMatrix = mat4.create();

        mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

        {
            const numComponents = 2;  // pull out 2 values per iteration
            const type = this.Context.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
                                      // 0 = use type and numComponents above
            const offset = 0;         // how many bytes inside the buffer to start from
            this.Context.bindBuffer(this.Context.ARRAY_BUFFER, buffers.position);
            this.Context.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.Context.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
          }

          this.Context.useProgram(programInfo.program);
          
          this.Context.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
          this.Context.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);
      
        {
          const offset = 0;
          const vertexCount = 4;
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