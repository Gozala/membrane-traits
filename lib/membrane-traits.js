'use strict'
var Trait = require('light-traits').Trait
// # MembraneTrait #
// Trait can be used in a trait composition to defines lazy property `membrane`.
// `MembraneTrait` is also a function and can be used directly to create trait
// compositions using exactly the same API as with Trait function.
function MembraneTrait() {
  // New instance of `MembraneTrait` is used to hold all the property
  // descriptors.
  var TMembrane = Object.create(MembraneTrait.prototype)
  // Trait composition is created passing all the arguments to original `Trait`
  // function. `Trait` function is called once again with a returned and
  // `MembraneTrait` traits to compose final trait.
  ,   trait = Trait(Trait.apply(null, arguments), MembraneTrait)
  // All the property descriptors are copied from trait to the `MembraneTrait`
  // instance in order to provide special behavior of `create` method of
  // returned trait.
  Object.keys(trait).forEach(function (key) {
    TMembrane[key] = trait[key]
  })
  return TMembrane
}
// ## Examples: ##
//
//      // Using as trait constructor.
//      var MembraneTrait = require('membrane-traits').MembraneTrait
//      var TGreeting = MembraneTrait(
//      { _greeting: 'Hello '
//      , name: MembraneTrait.required
//      , greet: function greet(name) {
//          return this._greeting + name
//        }
//      })
//      
//      var g = TGreeting.create({ name: 'membrane', lastName: 'trait' })
//      '_greeting' in g    // false <- privates are not exposed
//      'lastName' in g     // false <- only trait properties are exposed
//      g.name              // "membrane"
//      g.greet('consumer') // "Hello Consumer"
//
//      // Using as a trait in composition.
//      var Trait = require('light-traits').Trait
//      ,   MembraneTrait = require('membrane-traits').MembraneTrait
//
//      var TGreeting1 = Trait(
//      { _greeting: 'Hello '
//      , name: MembraneTrait.required
//      }
//      var TGreeting2 = Trait(
//      { greet: function greet(name) {
//          return this._greeting + name
//        }
//      })
//      var TMGreeting = Trait
//      ( MembraneTrait
//      , TGreeting1
//      , TGreeting2
//      )
//      
//      var g = TMGreeting.create({ name: 'membrane', lastName: 'trait' })
//      g._greeting           // "Hello "
//      g.membrane._greeting  // undefined
//
// # MembraneTrait.required #
// Property is just an alias of the `Trait.required` that is handy when using
// `MembraneTrait` as a trait constructor in a modules that don't directly
// depend on `Trait` itself.
MembraneTrait.required = Trait.required
// # MembraneTrait.membrane #
// This is a property exposed by `MembraneTrait`. Property represents
// membrane / facade of an object that contains it. Membrane exposes all the
// public properties and methods of an object that were defined in the trait
// used to instantiate object. All the properties whose name don't with `_` are
// considered to be public.
MembraneTrait.membrane = { get: function membrane() {
  // Creating instance of `Membrane` to make it explicit for it's consumers that
  // they deal with a membrane and not an actual object.
  var membrane = new Membrane()
  ,   keys = Object.getOwnPropertyNames(this)
  // Enumerating all the own properties of an object. Those are all the
  // properties defined by a trait that is used to instantiate this object.
  for (var i = 0, ii = keys.length; i < ii; i++) {
    key = keys[i]
    // Skipping this and the privates properties.
    if ('membrane' === key || '_' === key.charAt(0)) continue
    // Defining membranes / proxy accessors for all other properties.
    Object.defineProperty(membrane, key, PropertyMembrane(this, key))
  }
  // Redefining this getter as static property, in order to return same
  // membrane for every access of this property.
  Object.defineProperty(this, 'membrane',
  { value: membrane
  , configurable: false
  })
  return this.membrane
}, configurable: true }
// # create #
// Instances of the `MembraneTrait` (traits that are created by invoking that
// function) inherit special `create` function that is different form regular
// trait's create function in a way that returned objects are membranes rather
// then an actual instances.
MembraneTrait.prototype = Object.freeze(Object.create(Trait.prototype,
{ create: { value: function create(proto) {
    return Trait.prototype.create.call(this, proto).membrane
  }}
}))
exports.MembraneTrait = Object.freeze(MembraneTrait)

// ### Membrane ###
// Internal function that is used as a base class for all instances created by
// calling `create` method on an instance of `MembraneTrait`.  
// For details see `PropertyMembrane`.
var Membrane = Object.freeze(function Membrane() {})
Object.freeze(Membrane.prototype)
// ### Getter ###
// Internal function that is used to generate getters for properties wrapped
// with in membrane.  
// For details see `PropertyMembrane`.
var Getter = Object.freeze(function membraneGetter(key) { return this[key] })
Object.freeze(Getter.prototype)
// ### Setter ###
// Internal function that is used to generate setters for properties wrapped
// with in membrane.  
// For details see `PropertyMembrane`
var Setter = Object.freeze(function membraneSetter(key, value) {
  this[key] = value
})
Object.freeze(Setter.prototype)
// ### PropertyMembrane ###
// Internal function that is used to generate property membranes. Function
// takes `target` object that is wrapped by a membrane and `name` of the
// property and generates property descriptor for it.
// For details see `PropertyMembrane`.
function PropertyMembrane(target, name) {
  // Getting property descriptor for the property.
  var property = Object.getOwnPropertyDescriptor(target, name)
  ,   descriptor =
      { configurable: property.configurable
      , enumerable: property.enumerable
      }
  // If original property has a getter using it's target bounded copy.
  if (property.get) descriptor.get = property.get.bind(target)
  // If original property has a setter using it's target bounded copy.
  if (property.set) descriptor.set = property.set.bind(target)
  if ('value' in property) {
    var value = property.value
    // If original property is a method generating membrane for it.
    if ('function' === typeof value) {
      descriptor.value = property.value.bind(target)
      descriptor.writable = property.writable
    // If it's just a property generating accessors to it.
    } else {
      descriptor.get = Getter.bind(target, key)
      descriptor.set = Setter.bind(target, key)
    }
  }
  return descriptor
}
