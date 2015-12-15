'use strict';
Container = class Container {
	constructor() {
		this._instances = {};
		this._bindings = {};
		this._shared = {};
		this._providers = {};
	}
	_validateKeyOrThrow(key, method) {
		if (!key || !_.isString(key)) {
			throw new Error(`Cannot .${method}() without valid key`);
		}
	}
	get(key) {
		this._validateKeyOrThrow(key, 'get');
		var result = this._instances[key];
		if (!_.isUndefined(result)) {
			// we got something, return it
			return result;
		}
		if (this._bindings[key]) {
			// there's a binding here, let's make it
			result = this.make(key);
		}
		return result;
	}
	set(key, value) {
		this._validateKeyOrThrow(key, 'set');
		if (_.isUndefined(value)) {
			// ban user from setting keys to undefined
			throw new Error(`Cannot .set() [${key}] to undefined`);
		}
		this._instances[key] = value;
	}
	instance(key, value) {
		this.set(key, value);
	}
	bind(key, method, share) {
		this._validateKeyOrThrow(key, 'bind');
		if (!_.isFunction(method)) {
			throw new Error(`Cannot .bind() [${key}] without function`);
		}
		this._bindings[key] = method;
		this._shared[key] = !!share;
		// remove any existing instances in case we want to re-bind
		delete this._instances[key];
	}
	singleton(key, method) {
		this.bind(key, method, true);
	}
	make(key) {
		this._validateKeyOrThrow(key, 'make');
		var binding = this._bindings[key];
		if (!binding) {
			throw new Error(`Cannot .make() [${key}] before .bind()`);
		}
		var result = binding(this);
		if (_.isUndefined(result)) {
			// disallow bindings to return undefined because we won't be able to share
			throw new Error(`When trying to .make() [${key}] the binding returned undefined`);
		}
		if (this._shared[key]) {
			// if this is intended to be shared, stash the instance
			this.set(key, result);
		}
		return result;
	}
	register(key, provider) {
		if (arguments.length === 1 && !_.isString(key)) {
			// developer passed provider as single parameter so it's "anonymous".
			// we won't be able to access it using .provider();
			provider = key;
			key = null;
		}
		if (!_.isNull(key)) {
			// developer passed a key, let's validate it
			this._validateKeyOrThrow(key, 'register');
		}
		if (! (provider instanceof Container.Provider)) {
			let keyed = key ? ' [' + key + '] ' : ' ';
			throw new Error(`Cannot .register()${keyed}without instance of Container.Provider`);
		}
		provider.register();
		if (key) {
			this._providers[key] = provider;
		}
	}
	isShared(key) {
		return !!(this._instances[key] || this._shared[key]);
	}
	provider(key) {
		this._validateKeyOrThrow(key, 'provider');
		return this._providers[key];
	}
	namespace(namespace) {
		return new Container.Namespace(this, namespace);
	}
};
