'use strict';
Container.Namespace = class Namespace {
	constructor(container, namespace) {
		if (! (container instanceof Container)) {
			throw new Error('Cannot instantiate Namespace without valid Container instance');
		}
		if (!namespace || !_.isString(namespace)) {
			throw new Error('Cannot instantiate Namespace without valid namespace');
		}
		this._container = container;
		this._namespace = namespace;
		this._bindMethods();
	}
	getContainer() {
		return this._container;
	}
	getNamespace() {
		return this._namespace;
	}
	makeKey(key) {
		if (key && _.isString(key)) {
			return `${this.getNamespace()}.${key}`;
		}
	}
	_bindMethods() {
		// only get the methods of the prototype. this will exclude any added methods
		let methods = _.keys(Object.getPrototypeOf(this._container)),
			container = this._container,
			me = this;
		methods.forEach((method) => {
			this[method] = this._callContainerMethod.bind(this, method);
		});
	}
	_callContainerMethod(method, ...args) {
		let container = this._container,
			key = this.makeKey(args[0]);
		if (key) {
			// key resolved so it wasn't a string and we can replace the argument
			args[0] = key;
		}
		return container[method].apply(container, args);
	}
};
