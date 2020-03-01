uniform float time;

varying vec3 vColor;

void main()
{
	// float tVal = abs( sin( ( time / 1000.0 ) + vColor.r * 3.0 ) );
	// gl_FragColor = vec4( vec3( tVal ), 1.0 );

	float t = mod( ( 1.0 - vColor.r ) * 1.5 + ( time / 3000.0 ), 1.0 );
	// t = sin( t * 3.141592 );
	float val = smoothstep( max( t - 0.1, 0.0 ), t, vColor.r );
	// gl_FragColor = vec4( vec3( val, 0.7, 1.0 ), 1.0 );
	vec3 col = val * mix( vec3( 1.0, 0.56, 0.1 ), vec3( 0.0, 0.7, 1.0 ), t );
	gl_FragColor = vec4( col, 1.0 );
}