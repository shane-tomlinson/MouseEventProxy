A mouse event proxy.  Useful for when you have an absolutely positioned element overlayed on
top of another element.  The overlay will capture any mouse events that occur over top of it
and send the mouse event through the normal path in the tree.  Sometimes, this is not what
we want, instead we want events to "fall through" to the element below the overlay.  This allows
that to happen.


The easiest way to use this is as a jQuery plugin.  Take the absolutely positioned element
that you want to proxy events for and do the following:

    $( target ).proxyMouseEvents( {
        events: [ 'click', 'mousedown', 'mouseup', 'mousemove' ]
    } );

    // By default, events are proxied to the DOM element directly below the mouse.  This can be
    // overridden using the "proxyTo" configuration option.

    $( target ).proxyMouseEvents( {
        events: [ 'click', 'mousedown', 'mouseup', 'mousemove' ]
        proxyTo: $( differentTarget )
    } );

If this will always be used as a jQuery plugin, the initial window.MouseEventProxy can be
removed to keep the global namespace from being polutted.