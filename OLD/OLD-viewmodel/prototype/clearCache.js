export default function Viewmodel$clearCache ( keypath, keepExistingWrapper ) {
	(keypath || this.root).clearCachedValue( keepExistingWrapper );
}
