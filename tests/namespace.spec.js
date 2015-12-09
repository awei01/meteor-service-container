'use strict';

describe('Container.Namespace constructor', function() {
	var container;
	beforeEach(function() {
		container = new Container();
	});
	it('instantiated with container and namespace sets container', function() {
		var ns = new Container.Namespace(container, 'ns');
		expect(ns.getContainer()).toBe(container);
	});
	it('instantiated with container and namespace sets namespace', function() {
		var ns = new Container.Namespace(container, 'ns');
		expect(ns.getBasename()).toBe('ns');
	});
	it('instantiated with non-container and namespace throws exception', function() {
		expect(function() {
			new Container.Namespace({}, 'ns');
		}).toThrowError('Cannot instantiate Namespace without valid Container instance');
	});
	it('instantiated with container and empty string throws exception', function() {
		expect(function() {
			new Container.Namespace(container, '');
		}).toThrowError('Cannot instantiate Namespace without valid namespace');
	});
	it('instantiated with container and empty string throws exception', function() {
		expect(function() {
			new Container.Namespace(container, '');
		}).toThrowError('Cannot instantiate Namespace without valid namespace');
	});
	it('instantiated with container and non-string throws exception', function() {
		expect(function() {
			new Container.Namespace(container, []);
		}).toThrowError('Cannot instantiate Namespace without valid namespace');
	});
});

describe('Container.Namespace instance', function() {
	var container, ns;
	beforeEach(function() {
		container = new Container();
		ns = new Container.Namespace(container, 'ns');
	});
	it('sets container and namespace', function() {
		expect(ns.getContainer()).toBe(container);
		expect(ns.getBasename()).toBe('ns');
	});
	it('.constructor() should not be overridden', function() {
		expect(ns.constructor).toBe(Object.getPrototypeOf(ns).constructor);
	});
	it('.makeKey() called with string returns string prefixed with namespace', function() {
		expect(ns.makeKey('foo')).toBe('ns.foo');
	});
	it('.makeKey() called with non string returns undefined', function() {
		expect(ns.makeKey([])).toBe(undefined);
	});
	it('.set() called with key and value calls container.set() with namespaced key and value', function() {
		spyOn(container, 'set');
		ns.set('foo', 'foo value');
		expect(container.set).toHaveBeenCalledWith('ns.foo', 'foo value');
	});
	it('.set() called with no args', function() {
		spyOn(container, 'set');
		ns.set();
		expect(container.set).toHaveBeenCalledWith();
	});
	it('.set() called with invalid key', function() {
		spyOn(container, 'set');
		ns.set([], 'foo value');
		expect(container.set).toHaveBeenCalledWith([], 'foo value');
	});
	it('.get() called with key', function() {
		spyOn(container, 'get').and.returnValue('container value');
		var result = ns.get('foo');
		expect(result).toBe('container value');
		expect(container.get).toHaveBeenCalledWith('ns.foo');
	});
	it('.bind() called with key, binding and true', function() {
		spyOn(container, 'bind');
		ns.bind('foo', 'binding', true);
		expect(container.bind).toHaveBeenCalledWith('ns.foo', 'binding', true);
	});
	it('.make() called with key', function() {
		spyOn(container, 'make').and.returnValue('container result');
		var result = ns.make('foo');
		expect(result).toBe('container result');
		expect(container.make).toHaveBeenCalledWith('ns.foo');
	});
	it('.register called with key and provider', function() {
		spyOn(container, 'register');
		ns.register('foo', 'provider');
		expect(container.register).toHaveBeenCalledWith('ns.foo', 'provider');
	});
	it('.provider called with key', function() {
		spyOn(container, 'provider').and.returnValue('container provider');
		var result = ns.provider('foo');
		expect(result).toBe('container provider');
		expect(container.provider).toHaveBeenCalledWith('ns.foo');
	});
	it('.namespace() called with key sets namespace with container and nested namespace', function() {
		var nested = ns.namespace('second');
		expect(nested.getContainer()).toBe(container);
		expect(nested.getBasename()).toBe('ns.second');
		spyOn(container, 'get').and.returnValue('nested value');
		var result = nested.get('foo');
		expect(result).toBe('nested value');
		expect(container.get).toHaveBeenCalledWith('ns.second.foo');
	});
	it('.namespace() called on conatiner with extra methods does not add method to new namespace', function() {
		container.foo = function() {};
		var namespace = container.namespace('ns');
		expect(namespace.foo).toBe(undefined);
	});
});
