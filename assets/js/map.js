window.map = {
    mapType: 'ROADMAP',
    mapZoom: 10,
    mapStyle: 'AVOIR-default',
    mapScroll: 'on',
    marker: 'show',
    label: '<strong>109, Sri Dharmarama Mw, Dematagoda, Colombo 09</strong>',
    lat: '6.931429',
    lng: '79.881077',
    markerURL: 'assets/images/marker.png'
};

'use strict';

jQuery(document).ready(function ($) {

    $('.google-map').each(function () {
        var mapDiv = $(this);
        var mapData = window[mapDiv.attr('id')];

        // Our custom marker label overlay
        var MarkerLabel = function (options) {

            var self = this;
            this.setValues(options);

            // Create the label container
            this.div = document.createElement('div');
            this.div.className = 'map-marker-label';

            // Trigger the marker click handler if clicking on the label
            // google.maps.event.addDomListener(this.div, 'click', function(e){
            //     (e.stopPropagation) && e.stopPropagation();
            //     google.maps.event.trigger(self.marker, 'click');
            // });
        };

        MarkerLabel.prototype = $.extend(new google.maps.OverlayView(), {
            onAdd: function () {
                this.getPanes().overlayImage.appendChild(this.div);

                // Ensures the label is redrawn if the text or position is changed.
                var self = this;
                this.listeners = [
                    google.maps.event.addListener(this, 'position_changed', function () {
                        self.draw();
                    }),
                    google.maps.event.addListener(this, 'text_changed', function () {
                        self.draw();
                    }),
                    google.maps.event.addListener(this, 'zindex_changed', function () {
                        self.draw();
                    })
                ];
            },
            onRemove: function () {
                this.div.parentNode.removeChild(this.div);
                // Label is removed from the map, stop updating its position/text
                for (var i = 0, l = this.listeners.length; i < l; ++i) {
                    google.maps.event.removeListener(this.listeners[i]);
                }
            },
            draw: function () {
                var
                    text = String(this.get('text')),
                    markerSize = this.marker.icon.anchor,
                    position = this.getProjection().fromLatLngToDivPixel(this.get('position')),
                    labelHeight,
                    labelWidth;

                this.div.innerHTML = text;
                this.div.style.position = 'relative';
                // dynamically grab the label height/width in order to properly position it vertically/horizontally.
                labelHeight = $('div.map-marker-label').outerHeight();
                labelWidth = $('div.map-marker-label').outerWidth();
                this.div.style.left = (position.x - (labelWidth / 2)) + 'px';
                this.div.style.top = (position.y - markerSize.y - labelHeight - 10) + 'px';

            }
        });

        var Marker = function (options) {

            google.maps.Marker.apply(this, arguments);
            if (options.label) {
                this.MarkerLabel = new MarkerLabel({
                    map: this.map,
                    marker: this,
                    text: options.label
                });
                this.MarkerLabel.bindTo('position', this, 'position');
            }
        };

        Marker.prototype = $.extend(new google.maps.Marker(), {
            // If we're adding/removing the marker from the map, we need to do the same for the marker label overlay
            setMap: function () {
                google.maps.Marker.prototype.setMap.apply(this, arguments);
                if (this.MarkerLabel) {
                    this.MarkerLabel.setMap.apply(this.MarkerLabel, arguments);
                }
            }
        });


        function createMap(position) {
            var map;

            var style = [{
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#e9e9e9"}, {"lightness": 17}]
            }, {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [{"color": "#f5f5f5"}, {"lightness": 20}]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#ffffff"}, {"lightness": 17}]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#ffffff"}, {"lightness": 29}, {"weight": 0.2}]
            }, {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [{"color": "#ffffff"}, {"lightness": 18}]
            }, {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [{"color": "#ffffff"}, {"lightness": 16}]
            }, {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{"color": "#f5f5f5"}, {"lightness": 21}]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [{"color": "#dedede"}, {"lightness": 21}]
            }, {
                "elementType": "labels.text.stroke",
                "stylers": [{"visibility": "on"}, {"color": "#ffffff"}, {"lightness": 16}]
            }, {
                "elementType": "labels.text.fill",
                "stylers": [{"saturation": 36}, {"color": "#333333"}, {"lightness": 40}]
            }, {"elementType": "labels.icon", "stylers": [{"visibility": "off"}]}, {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [{"color": "#f2f2f2"}, {"lightness": 19}]
            }, {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#fefefe"}, {"lightness": 20}]
            }, {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#fefefe"}, {"lightness": 17}, {"weight": 1.2}]
            }];
            var options = {
                zoom: parseInt(mapData.mapZoom, 13),
                center: position,
                scrollwheel: false,
                draggable: mapData.mapScroll === 'on',
                mapTypeId: google.maps.MapTypeId[mapData.mapType]
            };

            map = new google.maps.Map(mapDiv[0], options);
            var marker;

            if (mapData.mapStyle === 'AVOIR-default') {
                map.setOptions({
                    styles: style
                });
            }

            if (mapData.marker === 'show') {
                var image = {
                    url: mapData.markerURL,
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(15, 30)
                };

                marker = new Marker({
                    position: position,
                    icon: image,
                    map: map,
                });

                marker = new Marker({
                    label: mapData.label,
                    position: position,
                    icon: image,
                    map: map,
                    visible: false
                });

            }
        }

        if (undefined !== mapData.address) {
            // lookup address
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': mapData.address}, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    createMap(results[0].geometry.location);
                }
                else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
        else if (undefined !== mapData.lat && undefined !== mapData.lng) {
            createMap(new google.maps.LatLng(mapData.lat, mapData.lng));
        }
    });
});