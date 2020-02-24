
void main()
{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec4 posVals = texture2D( texturePosition, uv );
	vec4 tgtVals = texture2D( textureTarget, uv );
	vec2 status = texture2D( textureStatus, uv ).xy;

	float pActive = tgtVals.x;
	float sActive = status.x;

	vec4 col = vec4( 0.0 );

	// update status texture
	if( pActive > sActive )
	{

		col.x = 1.0;
		col.y = 1.0;

	}

	gl_FragColor = col;

}
