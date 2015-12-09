'use strict';

describe('container .get()', function() {
	var container;
	beforeEach(function() {
		container = new Container();
	});
	it('called with unset key returns undefined', function() {
		expect(container.get('foo')).toBe(undefined);
	});
	it('called with invalid key, throws exception', function() {
		expect(function() {
			container.get([]);
		}).toThrowError('Cannot .get() without valid key');
	});
	it('called with empty string as key, throws exception', function() {
		expect(function() {
			container.get('');
		}).toThrowError('Cannot .get() without valid key');
	});
});

describe('container .set()', function() {
	var container;
	beforeEach(function() {
		container = new Container();
	});
	it('called with key and static, sets key', function() {
		container.set('foo', 'foo value');
		expect(container.get('foo')).toBe('foo value');
	});
	it('called with key and method, sets key', function() {
		var method = function() {};
		container.set('foo', method);
		expect(container.get('foo')).toBe(method);
	});
	it('called with key and falsey, sets key', function() {
		container.set('foo', false);
		expect(container.get('foo')).toBe(false);
	});
	it('called with key and undefined throws exception', function() {
		expect(function() {
			container.set('foo', undefined);
		}).toThrowError('Cannot .set() [foo] to undefined');
	});
	it('called with key only, throws exception', function() {
		expect(function() {
			container.set('foo');
		}).toThrowError('Cannot .set() [foo] to undefined');
	});
	it('called with invalid key and value throws exception', function() {
		expect(function() {
			container.set([], 'value');
		}).toThrowError('Cannot .set() without valid key');
	});
	it('called with empty string as key and value throws exception', function() {
		expect(function() {
			container.set('', 'value');
		}).toThrowError('Cannot .set() without valid key');
	});
});

describe('container .instance()', function() {
	it('called with key and value, should call .set() with key and value', function() {
		var container = new Container();
		spyOn(container, 'set');
		container.instance('foo', 'foo value');
		expect(container.set).toHaveBeenCalledWith('foo', 'foo value');
	});
});

describe('container .bind()', function() {
	var container;
	beforeEach(function() {
		container = new Container();
	});
	it('called with key and method does not throw exception', function() {
		expect(function() {
			container.bind('foo', function() {});
		}).not.toThrow();
	});
	it('called with key, method and true does not throw exception', function() {
		expect(function() {
			container.bind('foo', function() {}, true);
		}).not.toThrow();
	});
	it('called with key and non method throws exception', function() {
		expect(function() {
			container.bind('foo', 'foo value');
		}).toThrowError('Cannot .bind() [foo] without function');
	});
	it('called with invalid key throws exception', function() {
		expect(function() {
			container.bind([], function() {});
		}).toThrowError('Cannot .bind() without valid key');
	});
	it('called with empty key throws exception', function() {
		expect(function() {
			container.bind('', function() {});
		}).toThrowError('Cannot .bind() without valid key');
	});
});

describe('container .singleton()', function() {
	it('called with key and method calls .bind() with key, method and true', function() {
		var container = new Container();
		spyOn(container, 'bind');
		container.singleton('foo', 'method');
		expect(container.bind).toHaveBeenCalledWith('foo', 'method', true);
	});
});

describe('container .make()', function() {
	var container, binding;
	beforeEach(function() {
		container = new Container();
		binding = jasmine.createSpy().and.returnValue('binding result');
	});
	it('called with bound key returns result of binding called with container', function() {
		container.bind('foo', binding);
		expect(container.make('foo')).toBe('binding result');
		expect(binding).toHaveBeenCalledWith(container);
	});
	it('called with bound key multiple times returns result of each binding call with its passed params', function() {
		container.bind('foo', binding);
		expect(container.make('foo')).toBe('binding result');
		expect(container.make('foo')).toBe('binding result');
	});
	it('called with bound key that returns undefined throws exception', function() {
		binding.and.returnValue(undefined);
		container.bind('foo', binding);
		expect(function() {
			container.make('foo');
		}).toThrowError('When trying to .make() [foo] the binding returned undefined');
	});
	it('called with unbound key throws exception', function() {
		expect(function() {
			container.make('unbound');
		}).toThrowError('Cannot .make() [unbound] before .bind()');
	});
	it('called with invalid key throws exception', function() {
		expect(function() {
			container.make([]);
		}).toThrowError('Cannot .make() without valid key');
	});
	it('called with empty string as key throws exception', function() {
		expect(function() {
			container.make('');
		}).toThrowError('Cannot .make() without valid key');
	});
});

describe('container .get() after .bind()', function() {
	var container, binding;
	beforeEach(function() {
		container = new Container();
		binding = jasmine.createSpy().and.returnValue('binding value');
	});
	it('called with bound unshared key multiple times', function() {
		container.bind('foo', binding, false);
		expect(container.get('foo')).toBe('binding value');
		expect(container.get('foo')).toBe('binding value');
		expect(binding.calls.count()).toBe(2);
		expect(binding).toHaveBeenCalledWith(container);
	});
	it('called with bound shared key multiple times', function() {
		container.bind('foo', binding, true);
		expect(container.get('foo')).toBe('binding value');
		expect(container.get('foo')).toBe('binding value');
		expect(binding.calls.count()).toBe(1);
		expect(binding).toHaveBeenCalledWith(container);
	});
	it('called with bound shared key and then rebound, should unbind instance', function() {
		container.bind('foo', binding, true);
		expect(container.get('foo')).toBe('binding value');
		binding.and.returnValue('new binding value');
		binding.calls.reset();
		container.bind('foo', binding, true);
		expect(container.get('foo')).toBe('new binding value');
		expect(container.get('foo')).toBe('new binding value');
		expect(binding.calls.count()).toBe(1);
		expect(binding).toHaveBeenCalledWith(container);
	});
});

describe('container .register()', function() {
	var container, provider;
	beforeEach(function() {
		container = new Container();
		provider = new Container.Provider(container);
	});
	it('called with provider calls provider.register()', function() {
		spyOn(provider, 'register');
		container.register(provider);
		expect(provider.register).toHaveBeenCalledWith();
	});
	it('called with non-provider, throws exception', function() {
		expect(function() {
			container.register([]);
		}).toThrowError('Cannot .register() without instance of Container.Provider');
	});
	it('called with key and provider calls provider.register()', function() {
		spyOn(provider, 'register');
		container.register('foo', provider);
		expect(provider.register).toHaveBeenCalledWith();
	});
	it('called with key and invlaid provider, throws exception', function() {
		expect(function() {
			container.register('foo', []);
		}).toThrowError('Cannot .register() [foo] without instance of Container.Provider');
	});
	it('called with key only, throws exception', function() {
		expect(function() {
			container.register('foo');
		}).toThrowError('Cannot .register() [foo] without instance of Container.Provider');
	});
	it('called with invalid key and provider, throws exception', function() {
		expect(function() {
			container.register([], provider);
		}).toThrowError('Cannot .register() without valid key');
	});
	it('called with empty string as key and provider, throws exception', function() {
		expect(function() {
			container.register('', provider);
		}).toThrowError('Cannot .register() without valid key');
	});
});

describe('container .provider() after .register() with key and provider', function() {
	var container, provider;
	beforeEach(function() {
		container = new Container();
		provider = new Container.Provider(container);
		spyOn(provider, 'register');
		container.register('foo', provider);
	});
	it('called with existing key returns provider', function() {
		expect(container.provider('foo')).toBe(provider);
	});
	it('called with non-existent key returns undefined', function() {
		expect(container.provider('nonexistent')).toBe(undefined);
	});
	it('called with invalid key throws exception', function() {
		expect(function() {
			container.provider([]);
		}).toThrowError('Cannot .provider() without valid key');
	});
	it('called with empty string as key throws exception', function() {
		expect(function() {
			container.provider('');
		}).toThrowError('Cannot .provider() without valid key');
	});
});

describe('container .namespace()', function() {
	var container;
	beforeEach(function() {
		container = new Container();
	});
	it('called with namespace returns Container.Namespace instance with container and namespace', function() {
		var ns = container.namespace('foo');
		expect(ns instanceof Container.Namespace).toBe(true);
		expect(ns.getContainer()).toBe(container);
		expect(ns.getNamespace()).toBe('foo');
	});
});
