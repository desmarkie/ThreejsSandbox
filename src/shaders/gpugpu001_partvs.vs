uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

uniform float cameraConstant;

varying vec4 vColor;

void main() 
{


	vec4 posTemp = texture2D( texturePosition, uv );
	vec3 pos = posTemp.xyz;

	vec4 velTemp = texture2D( textureVelocity, uv );
	vec3 vel = velTemp.xyz;

	vColor = vec4( 1.0, 1.0, 1.0, 1.0 );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

	float radius = 0.05;

	gl_PointSize = radius * cameraConstant / ( - mvPosition.z );

	gl_Position = projectionMatrix * mvPosition;

}