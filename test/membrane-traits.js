'use strict'
var Trait = require('light-traits').Trait
,   MembraneTrait = require('membrane-traits').MembraneTrait

exports['test create membranes as traits'] = function (assert) {
  var TFixture = MembraneTrait(
  { _foo: 'secret'
  , bla: Trait.required
  , get foo() {
      return this._foo
    }
  , set foo(value) {
      this._foo = value
    }
  , bar: 'public'
  , method: function method(a, b) {
      return this._foo + a + b
    }
  })
  var fixture = TFixture.create({ _baz: 1, bla: 2, brr: 3 })

  assert.ok
  ( !('_foo' in fixture)
  , 'trait properties that start with `_` are omitted'
  )
  assert.ok
  ( !('_baz' in fixture)
  , 'inherited properties that start with `_` are omitted'
  )
  assert.ok
  ( 'bla' in fixture
  , 'inherited required properties are defined'
  )
  assert.equal(fixture.bar, 'public', 'public trait properties are accessible')
  assert.equal(fixture.bla, 2, 'inherited public properties are accessible')
  assert.equal(fixture.foo, 'secret', 'membrane getter works')
  fixture.foo = 'new secret'
  assert.equal(fixture.foo, 'new secret', 'membrane setter works')
  assert.equal
  ( fixture.method('a', 'b')
  , 'new secretab', 'public methods are callable'
  )
  assert.equal
  ( fixture.method.call({ _foo: 'test' }, ' a,', 'b')
  , 'new secret a,b'
  , '`this` pseudo-variable can not be passed through call.'
  )
  assert.equal
  ( fixture.method.apply({ _foo: 'test' }, [' a,', 'b'])
  , 'new secret a,b'
  , '`this` pseudo-variable can not be passed through apply.'
  )
}

exports['test add `MembraneTrait` to trait composition'] = function(assert) {
  var TFixture = Trait
  ( MembraneTrait
  , Trait(
    { _foo: 'secret'
    , bla: Trait.required
    , get foo() {
        return this._foo
      }
    , set foo(value) {
        this._foo = value
      }
    , bar: 'public'
    , method: function method() {
        return this._foo
      }
    })
  )
  var fixture = TFixture.create({ _baz: 1, bla: 2, brr: 3 })
  ,   membrane = fixture.membrane

  assert.ok
  ( !('_foo' in membrane)
  , 'trait properties that start with `_` are omitted in membrane'
  )
  assert.equal
  ( fixture._foo
  , 'secret'
  , 'trait properties that start with `_` are accessible on the trait'
  )
  assert.ok
  ( !('_baz' in membrane)
  , 'inherited properties that start with `_` are omitted in membrane'
  )
  assert.equal
  ( fixture._baz
  , 1
  , 'inherited properties that start with `_` are accessible on the trait'
  )
  assert.equal
  ( membrane.bar
  , 'public'
  , 'public trait properties are accessible on membrane'
  )
  assert.equal
  ( fixture.bar
  , 'public'
  , 'public trait properties are accessible'
  )
  assert.equal
  ( membrane.bla
  , 2
  , 'inherited public properties are accessible on membrane'
  )
  assert.equal
  ( fixture.bla
  , 2
  , 'inherited public properties are accessible'
  )
  fixture.bla ++
  assert.equal
  ( fixture.bla
  , membrane.bla
  , 'proprety changes propagate from instance to membrane'
  )
  membrane.bla ++
  assert.equal
  ( fixture.bla
  , membrane.bla
  , 'property changes propagate from membrane to wrapped instance'
  )

  assert.equal
  ( fixture.foo
  , 'secret'
  , 'membrane getter works'
  )
  membrane.foo = 'new secret'
  assert.equal
  ( fixture.foo
  , 'new secret'
  , 'membrane setter works'
  )
  assert.equal
  ( fixture.method()
  , 'new secret'
  , 'public methods are callable'
  )
  assert.equal
  ( membrane.method.call({ _foo: 'test' })
  , fixture.method()
  , '`this` pseudo-variable can not be passed through call.'
  )
  assert.equal
  ( membrane.method.apply({ _foo: 'test' })
  , fixture.method()
  , '`this` pseudo-variable can not be passed through apply.'
  )
  assert.equal
  ( fixture.membrane
  , membrane
  , 'membrane proprety is lazy getter that is invoked only ones'
  )
}
