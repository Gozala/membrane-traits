# membrane-traits #


## property encapsulation ##

In JavaScript it is not possible to create properties that have limited or
controlled accessibility. It is possible to create non-enumerable and
non-writable properties, but still they can be discovered. Commonly so called
closure capturing is used to encapsulate such properties in lexical scope:

    function Foo() {
      var _secret = 'secret';
      this.hello = function hello() {
        return 'Hello ' + _secret
      }
    }

This gives desired results, but also degrades code readability, specially with
object-oriented programs. Another disadvantage with this pattern is that there
has no immediate solution for inheriting privates (illustrated by the following
example):

    function Derived() {
      this.hello = function hello() {
        return _secret
      }
      this.bye = functino bye() {
        return _secret
      }
    }
    Derived.prototype = Object.create(Foo.prototype)

## membrane objects ##

Alternatively constructor may have returned a membrane object - proxy to the
instance's public properties:

    function Foo() {
      var foo = Object.create(Foo.prototype)
      return {
        bar: foo.hello.bind(foo)
      }
    }
    Foo.prototype._secret = 'secret';
    Foo.prototype.hello = function hello() {
      return 'Hello ' + this._secret;
    }

    function Derived() {
      var derived = Object.create(Derived.prototype)
      return {
        bar: derived.hello.bind(derived)
        bye: derived.bye.bind(derived)
      }
    }
    Derived.prototype = Object.create(Foo.prototype)
    Derived.prototype.bye = function bye() {
      return 'Bye ' + this._secret
    }

While this solution provides proper encapsulation, also private APIs can be
inherited by decedents, but still privates APIs are defined on `prototype`
of the constructor and can be compromised.

## Temper proving with property descriptor maps ##

In ES5 property descriptor maps can be used to hold definitions for the building
blocks. That makes it possible to have property definitions that are not shared
with a consumers:

    function Foo() {
      var foo = Object.create(Foo.prototype, FooDescriptor)
      var membrane = Object.create(Foo.prototype)
      membrane.hello = foo.hello.bind(membrane)
      return membrane
    }
    Foo.prototype.hello = function hello() {
      return 'Hello ' + this._secret
    }
    var FooDescriptor = {
      _secret: { value: 'secret' }
    }

    function Derived() {
      var derived = Object.create(Derived.prototype, DerivedDescriptor)
      var membrane = Object.create(Derived.prototype)
      membrane.hello = derived.hello.bind(derived)
      membrane.bye = derived.bye.bind(derived)
      return membrane
    }
    Derived.prototype = Object.create(Foo.prototype)
    Derived.prototype.bye = function bye() {
      return 'Bye ' + this._secret
    }
    DerivedDescriptor = {}

    Object.keys(FooDescriptor).forEach(function(key) {
      DerivedDescriptor[key] = FooDescriptor[key]
    })

## Membrane traits ##

While last approach solves all of the concerns it adds some complexity and
verbosity to the code. Membrane traits do the same while keeping code clean
and simple:

    var MembraneTrait = require('membrane-trait').MembraneTrait
    var TFoo = MembraneTrait({
      _secret: 'secret',
      hello: function hello() {
        return 'Hello ' + this._secret
      }
    })
    function Foo() {
      return TFoo.create(Foo.prototype)
    }
    
    var TDerived = Trait(
      TFoo,
      Trait({
        bye: function bye() {
          return 'Bye ' this._secret
        }
      })
    )
    function Derived() {
      return TDerived.create(Derived.prototype)
    }

All traits composed with `MembraneTrait` instantiate membranes representing
a proxies to a public API _(All of the properties that don't start with "`_`"
are considered to be part of public API)._

## Sharing privates with friends ##

In some cases making private properties accessible only with in the same module
scope is useful (usually with some kind of managers). Such cases are also
supported, `MembraneTrait` is a trait itself, that provides only one `membrane`
property (representing proxy to a public API), so they can be used in any trait
compositions:

    var TFoo = Trait(
      MembraneTrait,
      Trait({
        membrane: Trait.required,
        _secret: 'secret',
        hello: function hello() {
          return 'Hello ' + this._secret
        }
      })
    )
    function Foo() {
      return TFoo.create(Foo.prototype).membrane
    }
    var TDerived = Trait(
      TFoo,
      Trait({
        membrane: Trait.required,
        _secret: Trait.required,
        bye: function bye() {
          return 'Bye ' + this._secret
        }
      })
    )
    function Derived() {
      return TDerived.create(Derived.prototype).membrane
    }

