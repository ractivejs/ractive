const stack = [];
let captureGroup;

export function startCapturing () {
	stack.push( captureGroup = [] );
}

export function stopCapturing () {
	const dependencies = stack.pop();
	captureGroup = stack[ stack.length - 1 ];
	return dependencies;
}

export function capture ( model ) {
	if ( captureGroup ) {
		captureGroup.push( model );
	}
}
