
uniform int pointCount;

void main()
{

	vec2 uv = gl_FragCoord.xy / resolution.xy;

	vec4 posVals = texture2D( texturePosition, uv );
	vec4 tgtVals = texture2D( textureTarget, uv );
	vec2 status = texture2D( textureStatus, uv ).xy;

	vec4 col = vec4( 0.0 );
	if( status.x < 1.0 )
	{

		// not active, so just return the same value
		col = tgtVals;

	}
	else
	{

		// this point is active, find the nearest N points
		float ptSpacing = 1.0 / resolution.x;
		//int ptCount = int(floor(resolution.x * resolution.y));

		float minLen = 10.0;

		// loop through the other points
		for( int i = 0; i < pointCount; i++ )
		{

			// get xy for texture read
			int x = int( mod( resolution.x, float(i) ) / resolution.x );
			int y = int(floor( float(i) / resolution.x ) / resolution.x );

			vec4 tgt = texture2D( texturePosition, vec2( float(x) * ptSpacing, float(y) * ptSpacing ) );

			// if distance < min so far, update min and output color
			float dist = length( tgt.xyz - posVals.xyz );

			if( dist < minLen && tgt.a < 1.0 )
			{
				col.xyz = tgt.xyz;
				col.a = 0.0;
				minLen = dist;
			}

		}

	}

	gl_FragColor = col;

}