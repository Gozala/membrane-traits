'use strict'
Trait = require('light-traits').Trait

function Membrane() {}
function PropertyMembrane(target, name) {
  return(
  { get: function getMembarneProperty() { return target[name] }
  , set: function setMembraneProperty(value) { target[name] = value }
  })
}
function MembraneTrait() {
  var TMembrane = Object.create(MembraneTrait)
  ,   trait = Trait.apply(null, arguments)
  Object.keys(trait).forEach(function (key) {
    TMembrane[key] = trait[key]
  })
  return TMembrane
}
Object.defineProperties(MembraneTrait, 'membrane', {
  membrane { get: function membrane() {
    var membraneProto = Object.create(new Membrane())
    ,   membrane = Object.create(membraneProto)
    ,   proto = Object.getPrototypeOf(this)
    ,   self = this

    Object.getOwnPropertyNames(proto).forEach(function(key) {
      if ('_' === key.charAt(0)) return
      Object.defineProperty(membraneProto, key,
      { get: function getProperty() { return self[key] }
      , set: function setProperty(value) { return self[key] = value }
      })
    }
    Object.getOwnPropertyNames(this).forEach(function(key) {
      if ('_' === key.charAt(0)) return
      Object.defineProperty(membrane, key,
      { get: function getProperty() { return self[key] }
      , set: function setProperty(value) { self[key] = value }
      })
    })
    return membrane
  }}
})

MembraneTrait.prototype = Object.create(Trait.prototype,
{ create: { value: function create(proto) {
    Trait.prototype.create.call(this, proto).membrane
  }}
})

exports.MembraneTrait = MembraneTrait
