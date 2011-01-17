/**
* Licensed under the Creative Commons Attribution 3.0 License.
* See http://creativecommons.org/licenses/by/3.0/legalcode and 
* http://creativecommons.org/licenses/by/3.0/
*
* Written by Shane Tomlinson, 2011
* email: set117@yahoo.com
* Twitter: @shane_tomlinson 
* http://www.shanetomlinson.com
* http://www.aframejs.com
*/

/**
*   A mouse event proxy.  Useful for when you have an absolutely positioned element overlayed on
*   top of another element.  The overlay will capture any mouse events that occur over top of it
*   and send the mouse event through the normal path in the tree.  Sometimes, this is not what
*   we want, instead we want events to "fall through" to the element below the overlay.  This allows
*   that to happen.
*
*
*   The easiest way to use this is as a jQuery plugin.  Take the absolutely positioned element
*   that you want to proxy events for and do the following:
*
*    $( target ).proxyMouseEvents( {
*        events: [ 'click', 'mousedown', 'mouseup', 'mousemove' ]
*    } );
*
*   // By default, events are proxied to the DOM element directly below the mouse.  This can be
*   // overridden using the "proxyTo" configuration option.
*  
*    $( target ).proxyMouseEvents( {
*        events: [ 'click', 'mousedown', 'mouseup', 'mousemove' ]
*        proxyTo: $( differentTarget )
*    } );
*
* If this will always be used as a jQuery plugin, the initial window.MouseEventProxy can be
* removed to keep the global namespace from being polutted.
*
* @class MouseEventProxy
* @constructor
*/
window.MouseEventProxy = (function() {
    "use strict";
    
    var Proxy = function() {};
    Proxy.prototype = {
        init: function( config ) {
            var me=this, index, event;
            
            this.target = $( config.target );
            
            if( config.proxyTo ) {
                if( config.proxyTo == 'parent' ) {
                    this.proxyTarget = this.target.parent();
                }
                else {
                    this.proxyTarget = $( config.proxyTo );
                }
            }
            
            this.handler = function( event ) {
                me.onProxyEvent( event );
            };
            
            this.events = config.events;
            for( index = 0; event = config.events[ index ]; ++index ) {
                this.target.bind( event, this.handler );
            }
        },
        
        remove: function() {
            var index, event;
            for( index = 0; event = this.events[ index ]; ++index ) {
                this.target.unbind( event, this.handler );
            }
        },
        
        onProxyEvent: function( event ) {
            var element = this.getProxyTarget( event );
            var eventType = event.type;
            
            // mousemoves have special cases outlined below.
            if( eventType == 'mousemove' ) {
                this.handleMoveEvent( element, event );
            }
         
            event.type = eventType;            
            this.proxyEventTo( event, element );
            
            // We have to stop the propagation of the event or else we effectively get a double
            //  triggering of the event.
            event.stopPropagation();
        },
        
        getProxyTarget: function( event ) {
            // if we have a proxy target specified, use that.  If no specified target, try to find
            // the element under the current event.
            var element = this.proxyTarget;
            
            if( !element ) {
                var target = this.target;
                target.hide();
                element = document.elementFromPoint( event.clientX, event.clientY );
                target.show();
            }
            
            return element;
        },
        
        
        /*
        * A move event causes special considerations, our move may have covered up a mouseover/
        *   mouseout.  HighCharts depends on these for when clicking on the chart.  So, we have
        *   to keep track of the last element we are over, and if we are currently over a different
        *   element, trigger mouseout and mouseover events.
        */
        handleMoveEvent: function( element, event ) {
        
            if( element != this.lastMoveElement ) {
                if( this.lastMoveElement ) {
                    event.type = 'mouseout';
                    this.proxyEventTo( event, this.lastMoveElement );
                }
                
                event.type = 'mouseover';
                this.proxyEventTo( event, element );

                this.lastMoveElement = element;
            }
            
        },
        
        proxyEventTo: function( event, element ) {
            var newEvent = this.copyEvent( event );
            $( element ).trigger( newEvent );
        },
        
        copyEvent: function( event ) {
            var newEvent = new jQuery.Event( event.type );
            jQuery.extend( newEvent, {
                clientX: event.clientX,
                clientY: event.clientY,
                layerX: event.layerX,
                layerY: event.layerY,
                pageX: event.pageX,
                pageY: event.pageY
            } );
            return newEvent;
        }
    };
    
    /**
    * a jQuery plugin to proxy mouse events from one DOM element to another
    * @method $.fn.proxyMouseEvents
    */
    $.fn.proxyMouseEvents = function( config ) {
        config = config || {};
        
        return this.each( function() {
            config.target = $( this );
            
            var proxy = new Proxy();
            proxy.init( config );
        } );
    };
    
    return Proxy;
}() );