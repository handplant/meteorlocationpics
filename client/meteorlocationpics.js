var MAP_ZOOM = 12;

Meteor.startup(function () {
    GoogleMaps.load();
    Session.set('searching', 1);
});

Template.meteorlocationpics.helpers({
    searching: function () {
        return Session.get('searching');
    },
    geolocationError: function () {
        var error = Geolocation.error();
        return error && error.message;
    },
    mapOptions: function () {
        var latLng = Geolocation.latLng();
        // Initialize the map once we have the latLng.
        if (GoogleMaps.loaded() && latLng) {
            return {
                center: new google.maps.LatLng(latLng.lat, latLng.lng),
                zoom: MAP_ZOOM
            };
        }
    }
});

Template.meteorlocationpics.onCreated(function () {
    var self = this;

    GoogleMaps.ready('map', function (map) {

        var latLng = Geolocation.latLng();

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(latLng.lat, latLng.lng),
            map: map.instance,
            icon: 'https://maps.google.com/mapfiles/kml/shapes/schools_maps.png'
        });

        //Get Instagram Pics by locationsearch
        Meteor.call('getInstragramPics', latLng.lat, latLng.lng, function (error, result) {

            if (result) {
                createMarkers(result.data.data, map.instance);
            }
        });

        map.instance.setCenter(marker.getPosition());
        map.instance.setZoom(MAP_ZOOM);
    });


});

function createMarkers(data, map) {
    for (var i = 0; i < data.length; i++) {
        var latLng = new google.maps.LatLng(data[i].location.latitude, data[i].location.longitude);
        var image = '/instagram.png';
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: image
        });
        marker.setAnimation(google.maps.Animation.DROP);
        addInfoWindow(data[i], marker, map);
    };
    Session.set('searching', 0);
}

function addInfoWindow(data, marker, meteormap) {
    var username = data.user.username;
    var infowindow = new google.maps.InfoWindow({
        content: '<a href="' + data.link + '" target="_blank"><img class="popupPhoto" src="' + data.images.low_resolution.url + '"></a>'
    });
    infowindow.setOptions({width:100});
    infowindow.setOptions({height:100})

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(meteormap, this);
    });
}

