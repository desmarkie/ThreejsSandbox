attribute vec2 reference;
attribute vec2 iuv;

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

uniform float cameraConstant;
uniform float time;

varying vec4 vColor;
varying vec2 vUv;

void main() 
{

	vUv = iuv;

	vec4 posTemp = texture2D( texturePosition, reference );
	vec3 pos = posTemp.xyz;

	vec4 velTemp = texture2D( textureVelocity, reference );
	vec3 vel = velTemp.xyz;

	vec3 vertPos = mat3( modelMatrix ) * position;

	float maxSpeed = velTemp.a * 48.0 + 8.0;
	vColor = mix( vec4( 1.0, 0.85, 0.6, 1.0 ), vec4( 1.0 - posTemp.a, posTemp.a, 1.0, 1.0 ), length( vel ) / maxSpeed );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	//vertPos += mat3( modelViewMatrix ) * pos;

	vec4 outPos = vec4( vertPos, 1.0 ) + mvPosition;

	//float radius = 3.0 + ( sin( ( time / ( 250.0 - ( velTemp.a * 130.0 ) ) ) + ( posTemp.a * 6.28 ) ) * 1.6 );

	//gl_PointSize = radius * cameraConstant / ( - mvPosition.z );
	//vColor = outPos;//vec4( 1.0 );
	gl_Position = projectionMatrix * outPos;

}