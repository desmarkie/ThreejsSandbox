varying vec4 vColor;
varying vec2 vUv;

uniform sampler2D map;

void main() 
{
	
	vec4 sample = texture2D( map, vUv );
	//float val = 1.0 - ( distance( vUv, vec2( 0.5, 0.5 ) ) * 2.0 );
	//vec3 col = sample.xyz * vColor.xyz;
	//gl_FragColor = vec4( col, sample.a );
	//gl_FragColor = vec4( vec3( 2.0 * val * vColor.xyz ), val );
	gl_FragColor = vec4( sample.rgb * vColor.rgb, sample.a );

}