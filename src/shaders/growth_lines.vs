// #ifdef USE_COLOR
// 	// vertex color attribute
// 	attribute vec3 color;
// #endif

varying vec3 vColor;

void main()
{
	vColor = color;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}