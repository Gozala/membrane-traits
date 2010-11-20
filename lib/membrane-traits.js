'use strict'
var Trait = require('light-traits').Trait

function Membrane() {}

function MembraneMethod(target, key) {
  function membraneMethod(caller, params) {
    var callee = target[key]
    if (caller == MembraneMethod.apply)
      return callee.apply.apply(callee, params)
    if (caller == MembraneMethod.call)
      return callee.call.apply(callee, params)
    return callee.apply(target, arguments)
  }
  membraneMethod.apply = MembraneMethod.apply
  membraneMethod.call = MembraneMethod.call
  return membraneMethod
}
MembraneMethod.apply = function apply() {
  return this(apply, arguments)
}
MembraneMethod.call = function call() {
  return this(call, arguments)
}

function PropertyMembrane(target, name) {
  return(
  { get: function getMembarneProperty() {
      var value = target[name]
      if ('function' != typeof value) return value
      return MembraneMethod(target, name)
    }
  , set: function setMembraneProperty(value) { target[name] = value }
  })
}

function MembraneTrait() {
  var TMembrane = Object.create(MembraneTrait.prototype)
  ,   trait = Trait(Trait.apply(null, arguments), MembraneTrait)
  Object.keys(trait).forEach(function (key) {
    TMembrane[key] = trait[key]
  })
  return TMembrane
}
MembraneTrait.membrane = { get: function membrane() {
  var membraneProto = Object.create(new Membrane())
  ,   membrane = Object.create(membraneProto)
  ,   proto = Object.getPrototypeOf(this)
  ,   keys = Object.keys(this)
  for (var key in proto)
    if ('_' !== key.charAt(0))
      Object.defineProperty(membraneProto, key, PropertyMembrane(this, key))
  for (var i = 0, ii = keys.length; i < ii; i++) {
    key = keys[i]
    if ('_' !== key.charAt(0))
      Object.defineProperty(membrane, key, PropertyMembrane(this, key))
  }
  Object.defineProperty(this, 'membrane', { value: membrane, configurable: false})
  return this.membrane
}, configurable: true }

MembraneTrait.prototype = Object.create(Trait.prototype,
{ create: { value: function create(proto) {
    return Trait.prototype.create.call(this, proto).membrane
  }}
})
exports.MembraneTrait = MembraneTrait
