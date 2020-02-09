class MouseInput
{

	constructor( x = 0, y = 0 )
	{

		this.x = x;
		this.y = y;
		this.mouseDown = false;

		document.onmousemove = this.handleMouseMove.bind( this );
		document.mousedown = this.handleMouseDown.bind( this );
		document.mouseup = this.handleMouseUp.bind( this );

	}

	handleMouseDown()
	{

		this.mouseDown = true;

	}

	handleMouseUp()
	{

		this.mouseDown = false;

	}

	handleMouseMove( evt )
	{

		this.x = evt.pageX;
		this.y = evt.pageY;

		// this.quadMaterial.uniforms.mouse.value.x = this.mousePos.x;
		// this.quadMaterial.uniforms.mouse.value.y = this.mousePos.y;

	}

}

export { MouseInput as default };