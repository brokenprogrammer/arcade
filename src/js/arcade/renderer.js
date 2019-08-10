/*
*/
const TextRenderingTarget = 
{
    TOPSCORE: 'TopScore',
    SCORE: 'Score',
    LINES: 'Lines',
    LEVEL: 'Level',
};

export class Renderer
{
    constructor(Canvas, Text)
    {
        this.ProgramInfo = null;
        this.Canvas = Canvas;
        this.TextContainer = Text;

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

    setScoreText(Target, Text)
    {
        let Element = null;
                
        if (Target === TextRenderingTarget.TOPSCORE)
        {
            Element = this.TextContainer.querySelector("#top-score");
        }
        else if (Target === TextRenderingTarget.SCORE)
        {
            Element = this.TextContainer.querySelector("#score");
        }
        else if (Target === TextRenderingTarget.LINES)
        {
            Element = this.TextContainer.querySelector("#lines");
        }
        else if (Target === TextRenderingTarget.LEVEL)
        {
            Element = this.TextContainer.querySelector("#level");
        }
        else
        {
            return;
        }

        // NOTE: Removing all old children.
        while(Element.firstChild)
        {
            Element.removeChild(Element.firstChild);
        }

        let Node = document.createTextNode(Text);
        Element.appendChild(Node);
    }

    static get TextTarget()
    {
        return (TextRenderingTarget);
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
            samplerLocations: {
                image: this.Context.getUniformLocation(ShaderProgram, 'Image'),
                textureColor: this.Context.getUniformLocation(ShaderProgram, 'TextureColor'),
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

    initTexture(url)
    {
        let Texture = this.Context.createTexture();
        this.Context.bindTexture(this.Context.TEXTURE_2D, Texture);

        this.Context.texParameteri(this.Context.TEXTURE_2D, this.Context.TEXTURE_WRAP_S, this.Context.CLAMP_TO_EDGE);
        this.Context.texParameteri(this.Context.TEXTURE_2D, this.Context.TEXTURE_WRAP_T, this.Context.CLAMP_TO_EDGE);
        this.Context.texParameteri(this.Context.TEXTURE_2D, this.Context.TEXTURE_MIN_FILTER, this.Context.LINEAR);

        let TextureInfo = {
            Width: 1,
            Height: 1,
            Texture: Texture
        };

        let I = new Image();
        I.addEventListener('load', (event) => {
            TextureInfo.Width = I.width;
            TextureInfo.Height = I.height;
            
            this.Context.bindTexture(this.Context.TEXTURE_2D, TextureInfo.Texture);
            this.Context.texImage2D(this.Context.TEXTURE_2D, 0, this.Context.RGBA, this.Context.RGBA, this.Context.UNSIGNED_BYTE, I);
            console.log("Done")
        });

        requestCORSIfNotSameOrigin(I, url);
        I.src = url;

        return TextureInfo;
    }

    Render(Texture, Position, Size, Rotation, Color)
    {
        // TODO: Lines here are temp.
        const buffers = this.initBuffers();
        const programInfo = this.ProgramInfo;

        this.Context.clearColor(0.0, 0.0, 0.0, 1.0);
        //this.Context.clearDepth(1.0);
        //this.Context.enable(this.Context.DEPTH_TEST);
        //this.Context.depthFunc(this.Context.LEQUAL);

        this.Context.bindTexture(this.Context.TEXTURE_2D, Texture);

        this.Context.useProgram(programInfo.program);

        const Projection = mat4.create();
        mat4.ortho(Projection, 0.0, 800.0, 600.0, 0.0, -1.0, 1.0);

        let Model = mat4.create();

        mat4.translate(Model, Model, [Position[0], Position[1], 1.0]);

        // vec3.set(Translation, 0.5 * 10, 0.5*10, 0.0);
        mat4.translate(Model, Model, [0.5 * Size[0], 0.5 * Size[1], 0.0]);
        
        // vec3.set(Translation, 0.0, 0.0, 1.0);
        mat4.rotate(Model, Model, Rotation, [0.0, 0.0, 1.0]);

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
        this.Context.uniform3fv(programInfo.samplerLocations.textureColor, Color);

        this.Context.uniform1i(programInfo.samplerLocations.image, 0);

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

// TODO:
function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url)).origin !== window.location.origin) {
      img.crossOrigin = "";
    }
  }