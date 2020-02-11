precision mediump float;

uniform sampler2D posTex;
uniform float time;

varying vec2 vUv;

void main()
{

	vec3 pos = texture2D( posTex, vUv ).xyz;

	// pos.x = cos( time / 10.0 ) * 36.0;
	// pos.y = sin( time / 10.0 ) * 36.0;

	pos.x += cos( pos.y ) / 36.0;
	pos.y += tan( pos.x ) / 36.0;

	gl_FragColor = vec4( pos, 1.0 );

}
