#include <common>

#define delta ( 1.0 / 60.0 )

#pragma glslify: curlnoise = require(glsl-curl-noise)

uniform float gravity;
uniform vec3 mousePosition;

float random (in vec2 st) 
{
    return fract( sin( dot( st.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453123 );

}

// http://bookofshaders.com
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

	float maxSpeed = tmpVel.a * 48.0 + 8.0;
	float maxTurn = tmpPos.a * 32.0 + 8.0;

	vec3 n = curlnoise( pos * 60.0 );
	// float nx = noise( pos.xy / 7.0 );
	// float ny = noise( pos.yz / 7.0 );
	// float nz = noise( pos.xz / 7.0 );
	float ax = sin( n.x * PI * 2.0 );// * 2.5;
	float ay = sin( n.y * PI * 2.0 );// * 2.5;
	float az = sin( n.z * PI * 2.0 );// * 2.5;
	vec3 accel = vec3( ax, ay, az );
	// vec3 accel = vec3( 0.0 );

	//float falloff = clamp( distance( mousePosition, pos ) / 10.0, 0.0, 1.0 ) * 30.0;
	vec3 toMouse = ( mousePosition - pos );
	// if( falloff < 0.1 ) toMouse *= -1.0;
	accel += toMouse;

	float cap = min( maxTurn, length( toMouse ) * 1.3 );	
	if( length( accel ) > cap )
	{

		accel = normalize( accel ) * maxTurn;

	}

	vel += delta * accel;

	// maxSpeed *= falloff;
	// maxSpeed += 0.3;
	cap = min( maxSpeed, length( toMouse ) * 3.0 );
	if( length( vel ) > cap )
	{
		vel = normalize( vel ) * cap;
	}

	gl_FragColor = vec4( vel, tmpVel.a );

}
