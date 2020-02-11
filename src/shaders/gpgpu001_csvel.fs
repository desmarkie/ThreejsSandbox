#include <common>

#define delta ( 1.0 / 60.0 )
#define maxSpeed 12.0

uniform float gravity;

float random (in vec2 st) 
{
    return fract( sin( dot( st.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453123 );
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) 
{

    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main()	
{

	vec2 uv = gl_FragCoord.xy / resolution.xy;
	float idParticle = uv.y * resolution.x + uv.x;

	vec4 tmpPos = texture2D( texturePosition, uv );
	vec3 pos = tmpPos.xyz;

	vec4 tmpVel = texture2D( textureVelocity, uv );
	vec3 vel = tmpVel.xyz;

	float nx = noise( pos.xy / 7.0 );
	float ny = noise( pos.yz / 7.0 );
	float nz = noise( pos.xz / 7.0 );
	float ax = sin( nx * PI * 2.0 ) * 2.5;
	float ay = sin( ny * PI * 2.0 ) * 2.5;
	float az = sin( nz * PI * 2.0 ) * 2.5;
	vec3 accel = vec3( ax, ay, az );

	accel += pos * -1.2;

	vel += delta * accel;

	if( length( vel ) > maxSpeed)
	{
		vel = normalize( vel ) * maxSpeed;
	}

	gl_FragColor = vec4( vel, 1.0 );

}
