# Service Container #

A dependency injection solution for Meteor. Shamelessly borrows concepts from the PHP framework [Laravel](http://www.lavavel.com).

## Motivation ##

Wanted a way to better de-couple code and make testing easier. Tried a few other existing Meteor packages, but none quite fit the bill. I've worked with Laravel before and really the API so I tried to carry over some of its ideas to a Meteor package.

## Container API ##

#### `container` new Container() ####
Creates a new Container instance.
```
var app = new Container();
```

#### `void` .set(`string` key, `mixed` value) ####
Sets a key to be a particular value. The value can be a string, boolean, number, function, etc; anything other than `undefined`.
```
app.set('foo', 'foo value');
```

#### `void` .instance(`string` key, `mixed` value) ####
A more semantic alias for `.set()`
```
app.instance('foo', 'foo value');
// same thing as app.set('foo', 'foo value');
```

#### `void` .bind(`string` key, `function` binding, [`boolean` share]) ####
Binds a key to a binding callback. The binding callback will be called with the container instance so you can access other instances, bindings or values in your binding callback. The binding callback must not return `undefined`, otherwise an exception will be thrown when trying to `.make()` it. If the `share` parameter is true, then the binding callback will only be called once and its result will stored as an instance for future access. Otherwise, the binding callback will run every time the key is accessed.
```
app.bind('bound thing', function(container) {
	console.log(app === container) // true
	var dependency = container.get('foo');
	return new ThingWhichRequiresFoo(dependency);
});
```

#### `void` .singleton(`string` key, `function` binding) ####
Convenience method for calling `.bind()` with the key, function and shared as `true`.
```
app.singleton('bound thing', function(container) {
	var dependency = container.get('foo');
	return new ThingWhichRequiresFoo(dependency);
});
// Same as writing app.bind('bound thing', function() { ... }, true);
```

#### `mixed` .make(`string` key) ####
Forces a call on the binding referenced by `key` and returns its result. If the binding was shared when it was first bound, it will store the result for future `.get()` calls with the same key. Even if an instance is stored, the `.make()` method will call the binding again and re-store the its result.
```
var instance1 = app.make('bound thing');
var instance2 = app.make('bound thing');
console.log(instance1 instanceof ThingWhichRequiresFoo) // true
console.log(instance2 instanceof ThingWhichRequiresFoo) // true
console.log(instance1 === instance2) // false
```

#### `mixed` .get(`string` key) ####
Gets something out of the container. If the key was set using `.set()` or `.instance()` then it simply returns the mapped value. If the key was set using `.bind()` or `.singleton()` the binding function will be called and its result will be returned. If the key was shared (either by `.bind(key, binding, true)` or `.singleton(key, binding)`) then subsequent `.get()` calls with the same key will circumvent calling the binding function and will return the bound instance every time.
```
// following code example from .set() above
console.log(app.get('foo')) // "foo value"

// following code example from .singleton() above
var instance1 = app.get('bound thing');
var instance2 = app.get('bound thing');
console.log(instance1 === instance2) // true
```

#### `boolean` .isShared(`string` key) ####
Checks whether or not the key has been shared. I.E. key has been set using `.set()`, `.instance()`, `.singleton()` or `.bind()` when the shared param is passed.

#### `namespace` .namespace(`string` namespace) ####
Create a new `Container.Namespace` instance for this container. See below for more details.

#### `void` .register([`string` name], [`provider` provider]) ####
Register a provider on the contianer. See below for more details.

#### `provider` .provider(`string` name) ####
Get the provider tied to key. See below for more details.

## Container.Namespace API ##

#### `instance` new Container.Namespace(`container` container) ####
Creates a new Namespace instance for the container. The namespace instance can help manage your container's keys. It can also be used to keep your global namespace clutter free.
```
var container = new Container();
var namespace = new Container.Namespace(container, 'cats');
```

#### `container` .getContainer() ####
Gets the namespace's container.
```
console.log(container === namespace.getContainer()) // true
```

#### `string` .getBasename() ####
Gets the namespace's namespace.
```
console.log(namespace.getBasename()) // "cats"
```

#### `undefined|string` .makeKey(`string` key) ####
If the key parameter is not a string or is empty, returns undefined, otherwise, it returns the key prefixed with the namespace.
```
console.log(namespace.makeKey('boo')) // 'cats.boo'
```

#### Sample Usage ####

```
app = new Container();
models = new Container.Namespace(app, 'models');

// or to keep global namespace even cleaner
app = new Container();
app.models = app.namespace('models');
```

In addition to the above methods, the `Namespace` instance has the same API as an instance of `Container`. The only difference being that all the keys will automatically be prefixed with your namespace.
```
app.models.set('bar', 'bar value');
// same as app.set('models.bar', 'bar value');
```

We can also create nested namespaces:
```
app.models.schemas = app.models.namespace('schemas');
app.models.schemas.set('boo', 'boo value');
// same as app.set('models.schemas.boo', 'boo value');
```

## Container.Provider API ##

The Container.Provider provides a class based way to handle setting keys on a container. This can facilitate testing.

#### `provider` new Container.Provider(`container|namespace` containerOrNamespace) ####
Instantiate a provider with a container or namespace.

#### `container` .getContainer() ####
Get the provider's container

#### `undefined|namespace` .getNamespace() ####
Get the provider's namespace if it exists.

#### Sample Usage ####
```
// some dependant class that we'll want to test
function ThingWithDependencies(foo, bar) {
	this.foo = foo;
	this.bar = bar;
};

var provider = new Container.Provider(app);
// let's define a consistent method for making this thing
provider.make = function(dependencies) {
	return new ThingWithDependencies(dependencies.foo, dependencies.bar);
};
// we'll need to override the prototype
// this method will be called when app.register() is called with this provider
provider.register = function() {
	var me = this;
	// we'll want to bind an instance to "thing"
	this._container.singleton('thing', function(container) {
		var dependencies = {
				foo: container.get('foo'),
				bar: container.get('bar'),
			};
		return me.make(dependencies);
	};
}

// now, let's register it on the app.
// this calls the provider's `.register()` method which will register the singleton "thing"
app.register(provider);

// and let's set its dependencies
app.set('foo', 'foo value');
app.set('bar', 'bar value');

// getting a "thing" will call the binding callback
var thing = app.get('thing');
console.log(thing.foo) // "foo value"
console.log(thing.bar) // "bar value"

// or, for better testablity, `.register()` on the container with a key
app.register('thing', provider);

// then, in your tests
describe('thing instantiated with foo and bar', function() {
	var thingProvider;
	beforeEach(function() {
		thingProvider = app.provider('thing');
	});
	it('when instantiated with foo and bar sets the properties', function() {
		var thing = thingProvider.make({ foo: "foo test", bar: "bar test" });
		expect(thing.foo).toBe('foo test');
		expect(thing.bar).toBe('bar test');
	});
}
});
```

## Inspirations ##
* www.laravel.com
* github.com/meteor-space/base
* https://github.com/meteorflux/reactive-dependency
