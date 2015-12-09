'use strict';
Container.Provider = class Provider {
	constructor(containerOrNamespace) {
		var container = containerOrNamespace;
		if (containerOrNamespace instanceof Container.Namespace) {
			this._namespace = containerOrNamespace;
			container = this._namespace.getContainer();
		}
		if (! (container instanceof Container)) {
			throw new Error('Cannot instantiate Provider without valid Container instance');
		}
		this._container = container;
	}
	getContainer() {
		return this._container;
	}
	getNamespace() {
		return this._namespace;
	}
	register() {
		throw new Error('Need to override .register() method');
	}
};
