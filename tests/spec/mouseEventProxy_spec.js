
describe( "MouseEventProxy", function() {
    "use strict";
    
    var proxy;
    var lastEventCalled;
    var eventsCalled = {};
    
    var innerOverCalled = false;
    var innerOutCalled = false;
    
    var top = $( '#top' );
    var bottom = $( '#bottom' );
    var inner = $( '#inner' );
    
    var allEvents = [ 'click', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout' ];
    for( var index = 0, event; event = allEvents[ index ]; ++index ) {
        bottom.bind( event, function( event ) {
            lastEventCalled = true;
            eventsCalled[ event.type ] = true;
        } );
    }
    
    inner.bind( 'mouseover', function( event ) {
        innerOverCalled = true;
    } );
    
    inner.bind( 'mouseout', function( event ) {
        innerOutCalled = true;
    } );
    
    afterEach(function() {
        if( proxy ) {
            proxy.remove();
            proxy = null;
        }
        
        lastEventCalled = false;
        innerOverCalled = false;
        innerOutCalled = false;
        
        for( var index = 0, event; event = allEvents[ index ]; ++index ) {
            eventsCalled[ event ] = false;
        }
    } );
    
    it( 'should proxy click event', function() {
        proxy = new MouseEventProxy();
        proxy.init( {
            target: top,
            events: [ 'click' ]
        } );
        
        sendEvent( top, 'click' );
        
        expect( lastEventCalled ).toBe( true );
    } );
    
    it( 'should remove itself properly using remove', function() {
        // there is no created proxy right now.
        sendEvent( top, 'click' );
        
        expect( lastEventCalled ).toBe( false );
    } );
    
    it( 'should proxy click and mousedown events', function() {
        proxy = new MouseEventProxy();
        proxy.init( {
            target: top,
            events: [ 'click', 'mousedown' ]
        } );
        
        sendEvent( top, 'click' );
        expect( lastEventCalled ).toBe( true );

        lastEventCalled = false;
        sendEvent( top, 'mousedown' );
        expect( lastEventCalled ).toBe( true );

        lastEventCalled = false;
        sendEvent( top, 'mouseup' );
        expect( lastEventCalled ).toBe( false );
    } );
    
    it( 'should create mouseover and mouseout on mousemove events', function() {
        proxy = new MouseEventProxy();
        proxy.init( {
            target: top,
            events: [ 'mousemove' ]
        } );
        
        sendEvent( top, 'mousemove' );
        
        sendEvent( top, 'mousemove', 'top' );
        
        expect( eventsCalled[ 'mouseout' ] ).toBe( true );
        expect( innerOverCalled ).toBe( true );
        expect( innerOutCalled ).toBe( false );
        
        // moving back tot he center
        sendEvent( top, 'mousemove' );
        expect( eventsCalled[ 'mouseover' ] ).toBe( true );
        expect( innerOutCalled ).toBe( true );
        
    } );
    
    it( 'can proxy to elements other than the item directly below', function() {
        proxy = new MouseEventProxy();
        proxy.init( {
            target: top,
            events: [ 'mouseout' ],
            proxyTo: '#other'
        } );
        
        var otherMouseOut = false;
        $( '#other' ).bind( 'mouseout', function( event ) {
            otherMouseOut = true;
        } );
        
        sendEvent( top, 'mouseout' );
        
        expect( otherMouseOut ).toBe( true );
    } );
    
    
    function sendEvent( target, eventName, loc ) {
        var event = new jQuery.Event( eventName );
        
        var target = $( target );
        var offset = target.offset();
        
        // click right in the middle of it.
        event.clientX = offset.left + target.outerWidth() / 2;
        event.clientY = offset.top + ( loc == 'top' ? 5 : target.outerHeight() / 2 );
        event.pageX = 1111;
        event.pageY = 1111;
        
        target.trigger( event );
    }
} );