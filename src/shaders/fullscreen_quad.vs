varying vec2 vUv;

void main() 
{

	vUv = uv;

	// general MVP for geometry
	//vec4 modelViewPosition = modelViewMatrix * vec4( position, 1.0 );
	//gl_Position = projectionMatrix * modelViewPosition;

	// fullscreen quad
	gl_Position = vec4( position, 1.0 );

}