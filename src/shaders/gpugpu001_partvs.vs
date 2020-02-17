uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

uniform float cameraConstant;
uniform float time;

varying vec4 vColor;

void main() 
{


	vec4 posTemp = texture2D( texturePosition, uv );
	vec3 pos = posTemp.xyz;

	vec4 velTemp = texture2D( textureVelocity, uv );
	vec3 vel = velTemp.xyz;

	float maxSpeed = velTemp.a * 48.0 + 8.0;
	vColor = mix( vec4( 1.0, 0.85, 0.6, 1.0 ), vec4( 1.0 - posTemp.a, posTemp.a, 1.0, 1.0 ), length( vel ) / maxSpeed );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

	float radius = 0.1 + ( sin( ( time / ( 250.0 - ( velTemp.a * 130.0 ) ) ) + ( posTemp.a * 6.28 ) ) * 0.06 );

	gl_PointSize = radius * cameraConstant / ( - mvPosition.z );

	gl_Position = projectionMatrix * mvPosition;

}