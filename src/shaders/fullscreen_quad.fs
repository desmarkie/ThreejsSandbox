varying vec2 vUv;

uniform float time;
uniform float multi;
uniform vec2 mouse;
uniform vec2 resolution;

void main()
{

	// normalize and center UVs
	vec2 st = vUv;
	st -= 0.5;
	st.y *= resolution.x / resolution.y;
	st += 0.5;

	float val = abs(sin( sin( time / 3.0 ) * multi+ ( distance( st, vec2( 0.5 ) ) * multi ) ) );
	gl_FragColor = vec4( vec3( val ), 1.0 );

}