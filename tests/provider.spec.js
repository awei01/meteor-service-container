'use strict';

describe('Container.Provider constructor', function() {
	var container;
	beforeEach(function() {
		container = new Container();
	});
	it('instantiated with container sets container', function() {
		var provider = new Container.Provider(container);
		expect(provider.getContainer()).toBe(container);
	});
	it('instantiated with container defaults namespace as undefined', function() {
		var provider = new Container.Provider(container);
		expect(provider.getNamespace()).toBe(undefined);
	});
	it('instantiated with namespace sets container and namespace', function() {
		var ns = container.namespace('foo');
		var provider = new Container.Provider(ns);
		expect(provider.getContainer()).toBe(container);
		expect(provider.getNamespace()).toBe(ns);
	});
	it('instantiated with nested namespace sets container and namespace', function() {
		var ns1 = container.namespace('foo');
		var ns2 = ns1.namespace('bar');
		var provider = new Container.Provider(ns2);
		expect(provider.getContainer()).toBe(container);
		expect(provider.getNamespace()).toBe(ns2);
	});
});

describe('Container.Provider instance', function() {
	var container, provider;
	beforeEach(function() {
		container = new Container();
		provider = new Container.Provider(container);
	});
	it('.register() called throws exception', function() {
		expect(function() {
			provider.register();
		}).toThrowError('Need to override .register() method');
	});
	it('.register() after overriding does not throw exception', function() {
		provider.register = function() {};
		expect(function() {
			provider.register();
		}).not.toThrow();
	});
});
