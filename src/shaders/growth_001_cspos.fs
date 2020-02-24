
void main()
{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec4 posVals = texture2D( texturePosition, uv );
	vec2 status = texture2D( textureStatus, uv ).xy;

	// update point used state
	vec4 col = vec4( posVals );
	if( status.y > posVals.a )
	{
		posVals.a = 1.0;
	}

	gl_FragColor = col;

}
