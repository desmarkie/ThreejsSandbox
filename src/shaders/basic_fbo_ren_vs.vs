precision mediump float;

uniform sampler2D posMap;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec2 position;

void main()
{

	vec3 pos = -0.5 + texture2D( posMap, position.xy ).xyz;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

	gl_Position = projectionMatrix * mvPosition;

	gl_PointSize = 36.0 / -mvPosition.z;

}
