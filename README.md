# membrane-traits #

This is small library that uses [object-capability security model] to allow
object composition with a private APIs. This library uses "[light-traits]"
implementation of [traits] as an object composition mechanism.

See [docs] for more details and examples.

## Install ##

    npm install membrane-traits

## Disclaimer ##

Don't assume that usage of this library will magically make your code secure!
Using library without understanding what it does most likely will be harmful,
so please make sure you understand what it does before using it.

## Prior art ##

- [Flexible Membranes](http://www.toolness.com/wp/?p=642)
- [XPConnect wrappers](https://developer.mozilla.org/en/XPConnect_wrappers)
- [Caja](http://code.google.com/p/google-caja/)

[docs]:http://jeditoolkit.com/membrane-traits/docs/membrane-traits.html
[object-capability security model]:http://en.wikipedia.org/wiki/Object-capability_model
[light-traits]:http://github.com/Gozala/light-traits
[traits]:http://en.wikipedia.org/wiki/Trait_(computer_science)
