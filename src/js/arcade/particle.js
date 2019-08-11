const vsSource = `
    attribute vec4 vertex;

    uniform mat4 projection;
    uniform vec2 offset;
    uniform vec4 color;

    varying vec2 TexCoords;
    varying vec4 ParticleColor;
    
    void main()
    {
        float scale = 5.0;
        TexCoords = vertex.zw;
        ParticleColor = color;
        gl_Position = projection * vec4((vertex.xy * scale) + offset, 0.0, 1.0);
    } 

    `;

const fsSource = `
    precision mediump float;

    varying vec2 TexCoords;
    varying vec4 ParticleColor;

    uniform sampler2D Image;

    void main()
    {
        gl_FragColor = (texture2D(Image, TexCoords) * ParticleColor);
        gl_FragColor.rgb *= gl_FragColor.a;
    }
    `;


export class Particle
{
    constructor()
    {
        this.Position = [0, 0];
        this.Velocity = [0, 0];
        this.Color = [0, 0, 0, 0];
        this.Life = -5;
    }

    Respawn(Pos, Vel, Offset)
    {
        let Random = (Math.floor(Math.random() * Math.floor(100)) - 50) / 10.0;
        let rColor = (Math.floor(Math.random() * Math.floor(100)) / 100.0);
        let bColor = (Math.floor(Math.random() * Math.floor(100)) / 100.0);
        let gColor = (Math.floor(Math.random() * Math.floor(100)) / 100.0);
        this.Position[0] = Pos[0] + Random + Offset;
        this.Position[1] = Pos[1] + Random + Offset;

        this.Color = [rColor, bColor, gColor, 1.0];
        this.Life = 1.0;
        this.Velocity[0] = Vel[0] * 0.1;
        this.Velocity[1] = Vel[1] * 0.1;
    }

    // TODO: Find first particle that is dead and return its index.
    static FirstUnusedParticle(Particles)
    {
        // TODO: This can be made way better by keeping track of the last used.
        for (let X = 0; X < Particles.length; ++X)
        {
            if (Particles[X].life <= 0.0)
            {
                return X;
            }
        }
    }

    get position()
    {
        return this.Position;
    }
    set position(Value)
    {
        this.Position = Value;
    }

    get velocity()
    {
        return this.Velocity;
    }
    set velocity(Value)
    {
        this.Velocity = Value;
    }

    get color()
    {
        return this.Color;
    }
    set color(Value)
    {
        this.Color = Value;
    }

    get life()
    {
        return this.Life;
    }
    set life(Value)
    {
        this.Life = Value;
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