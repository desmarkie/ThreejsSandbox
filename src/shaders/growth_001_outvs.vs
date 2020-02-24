attribute vec2 reference;

uniform sampler2D texturePosition;
uniform sampler2D textureTarget;

void main()
{

	vec4 pos = texture2D( texturePosition, reference );
	vec4 tgt = texture2D( textureTarget, reference );

	vec3 vertPos = mat3( modelMatrix ) * position;
	vec4 mvPosition = modelViewMatrix * vec4( pos.xyz, 1.0 );
	vec4 outPos = vec4( vertPos, 1.0 ) + mvPosition;

	//gl_Position = projectionMatrix * outPos;

	mvPosition = modelViewMatrix * vec4( pos.xyz, 1.0 );
	gl_PointSize = 1.0;
	gl_Position = projectionMatrix * mvPosition;

}