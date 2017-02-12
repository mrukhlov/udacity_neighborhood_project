var markers = [];
var markersList = [];
var searchResult = [];
var infoWindow;

var Marker = function (data) {
    this.name = data.name;
    this.id = data.id;
    this.address = data.formatted_address;
};

var ViewModel = function () {
    this.header = "GMaps project";
    this.filter = ko.observable("");
    this.incr = 1;
    $( window ).width() >= 500 >= 0 ? this.visibilityBool = true : this.visibilityBool = true;
    this.visibleExample = ko.observable(this.visibilityBool);

    var self = this;

    this.markerList = ko.observableArray([]);

    this.choosePoi = function (obj) {
        
        var marker = obj.id;
        
        markersList.forEach(function (markersListItem) {
            var id = Object.keys(markersListItem)[0];
            if (id == marker) {
                var currentMarker = markersListItem[id];
                searchResult.forEach(function (searchResultItem) {
                    var idd = Object.keys(searchResultItem)[0];
                    if (id == idd) {
                        var mapObject = searchResultItem[idd];
                        searchResultMarkerBind(mapObject, currentMarker);
                    }
                });
            }
        });
    };

    this.qFilter = function (obj) {
        self.markerList.removeAll();
        var q = this.filter();
        var filteredList = [];
        markers.forEach(function (markerItem) {
            var re = new RegExp("^"+q,"i");
            if (markerItem.name.search(re) > -1){
                self.markerList.push(new Marker(markerItem));
                filteredList.push(markerItem);
            }
        });
        clearMarkers(filteredList);
    };
    
    this.showAside = function () {
	    console.log("show");
	    this.visibleExample(!this.visibleExample());
    };
    
    function initMarkers() {
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
                mapSearch("restaurant");
            }, function () {
                handleLocationError(true, infoWindow, map.getCenter());
                map.setCenter(pos);
                mapSearch("restaurant");
            })
        } else {
            handleLocationError(false, infoWindow, map.getCenter());
            map.setCenter(pos);
            mapSearch("restaurant");
        }
    }
    
    function handleLocationError(browserHasGeolocation, infoWindow, pos){
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            "Error: The Geolocation service failed." :
            "Error: Your browser doesn\'t support geolocation.");
    }
    
    function mapSearch(q) {
        var mapLoc = new google.maps.LatLng(pos.lat, pos.lng);
        var request = {
            location: mapLoc,
            radius: "500",
            query: q
        };
        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, callback);
    }
    
    function searchResultMarkerBind (mapObject, markerMarker) {
        service.getDetails(mapObject, function (result, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                alert("Error on fetching marker. Please reload page.");
                return;
            }
            toggleBounce(markerMarker);
            getHereComInfo(result, markerMarker);
            infoWindow.setContent("Loading...");
            infoWindow.open(map, markerMarker);
        });
    }
    
    function toggleBounce(marker) {
        setTimeout(function () {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }, 100);
        setTimeout(function () {
            marker.setAnimation(null);
        }, 1500);
    }
    
    function callback (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            markers = results;
            addMarker(results);
        } else if (status == google.maps.places.PlacesServiceStatus.ERROR) {
            alert("There was a problem contacting the Google servers.");
        } else if (status == google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
            alert("This request was invalid.");
        } else if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            alert("The webpage has gone over its request quota.");
        } else if (status == google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
            alert("The webpage is not allowed to use the PlacesService.");
        } else if (status == google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR) {
            alert("The PlacesService request could not be processed due to a server error. The request may succeed if you try again.");
        } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            alert("No result was found for this request.");
        }
    }
    
    function addMarker(results) {
        // clearMarkers();
        self.markerList.removeAll();
        
        results.forEach(function (result) {
            var placeId = result.id;
            
            var markerObj = new google.maps.Marker({
                map: map,
                position: result.geometry.location,
                animation: google.maps.Animation.DROP,
            });
            
            var keyMarker = placeId;
            var objMarker = {};
            objMarker[keyMarker] = markerObj;
            markersList.push(objMarker);
            
            var keyPlace = placeId;
            var objPlace = {};
            objPlace[keyPlace] = result;
            searchResult.push(objPlace);
            
            google.maps.event.addListener(markerObj, "click", function () {
                searchResultMarkerBind(result, markerObj);
            });
            self.markerList.push(new Marker(result));
        });
    }
    
    function clearMarkers(filteredList) {
        var filterListHide = [];
        var filterListShow = [];
        filteredList.forEach(function (item) {
            var id = item.id;
            markersList.forEach(function (marker) {
                var markerId = Object.keys(marker)[0];
                if (markerId != id) {
                    filterListHide.push(marker);
                } else {
                    filterListShow.push(marker);
                }
            })
        });
        setMapOnAll(filterListHide, filterListShow);
    }
    
    function setMapOnAll(hide, show) {
        hide.forEach(function (marker) {
            var id = Object.keys(marker)[0];
            marker[id].setMap(null);
        });
        show.forEach(function (marker) {
            var id = Object.keys(marker)[0];
            marker[id].setMap(map);
        });
    }
    
    function getHereComInfo(mapObject, currentMarker) {
        var lat = mapObject.geometry.location.lat();
        var lng = mapObject.geometry.location.lng();
        pos = {
            lat: lat,
            lng: lng
        };
        map.setCenter(pos);
        $.ajax({
            url : "https://places.cit.api.here.com/places/v1/discover/search",
            type : "GET",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            data: {
                "at":lat+","+lng,
                "q":mapObject.name,
                "app_id": "lQDy8jl1CQNubWkjWXiB",
                "app_code": "oEWUyNRzNa3OtTO8joeZWg"
            },
            error : function(data){
                alert("Oops, something went wrong. Please reload page.");
                console.log(data.responseText);
            },
            success : function(data){
                var items = data.results.items;
                var coords, href, rating;
                for (var i in items) {
                    var hereLat = items[i].position[0];
                    var hereLng = items[i].position[1];
                    var hereList = [hereLat, hereLng];
                    if (hereLat.toFixed(3) == lat.toFixed(3) && hereLng.toFixed(3) == lng.toFixed(3)){
                        coords = items[i].position;
                        //Theese href are here.com inner href. No need to show error message because i check if it is, if not, second ajax request won't be.
                        href = items[i].href;
                        rating = items[i].averageRating;
                        break;
                    } else {
                        if (hereLat.toFixed(2) == lat.toFixed(2) && hereLng.toFixed(2) == lng.toFixed(2)){
                            coords = items[i].position;
                            href = items[i].href;
                            rating = items[i].averageRating;
                            break;
                        } else {
                            if (hereLat.toFixed(1) == lat.toFixed(1) && hereLng.toFixed(1) == lng.toFixed(1)){
                                coords = items[i].position;
                                href = items[i].href;
                                rating = items[i].averageRating;
                                break;
                            }
                        }
                    }
                }
                
                var googleRating = "";
                var priceLevel = "";
                var openingHours = "";
                var reviews = "";
                
                if (mapObject["price_level"]) {
                    priceLevel = "</br><b>Price level</b>: " + mapObject.price_level;
                }
                
                if (mapObject.rating) {
                    googleRating = "</br><b>Google Rating</b>: <b>" + mapObject.rating +"</b> stars";
                }
                
                if (mapObject["opening_hours"]) {
                    if (mapObject.opening_hours.open_now == true) {
                        openingHours = "</br><b>Opening hours</b>: Open";
                    } else {
                        openingHours = "</br><b>Opening hours</b>: Closed";
                    }
                }
                
                if (mapObject["reviews"]) {
                    reviews = "</br><b>Google Reviews</b>:";
                    mapObject.reviews.forEach(function (review) {
                        if (review.text.length > 0){
                            var text = review.text.replace("</br>", "");
                            reviews += "</br>- " + text
                        }
                    });
                }
				
                var address = "";
	            var phone = "";
	            var website = "";
                
                if (coords && href) {
                    $.ajax({
                        url : href,
                        type : "GET",
                        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                        error : function(data){
                            alert("Oops, something went wrong. Please reload page.");
                            console.log(data.responseText);
                        },
                        success : function(data){
                            var name = "<b>" + data.name + "</b>" || "<b>" + mapObject.name + "</b>";
                            address = data.location.address.text || mapObject.formatted_address;
                            phone = "</br><b>Phone</b>: " + data.contacts.phone[0].value || "";
                            if (data.contacts["website"]){
                                website = '</br><b>Website</b>: <a target="_blank" href="' + data.contacts.website[0].value + '">'+data.contacts.website[0].value+"</a>" || "";
                            }
                            var view = data.view;
                            if (rating) {
	                            rating = '</br><a href="' + view + '" target="_blank">here.com</a> rating: <b>' + rating + "</b> stars";
                            } else {
                            	rating = "";
                            }
                            var infoString = name + rating +googleRating + phone + website + priceLevel + openingHours + reviews;
                            infoWindow.setContent(infoString);
                            // infoWindow.open(map, currentMarker);
                        }
                    })
                } else {
                    var infoString = "<b>" + mapObject.name + "</b>" + googleRating + priceLevel + openingHours + reviews;
                    infoWindow.setContent(infoString);
                    // infoWindow.open(map, currentMarker);
                }
            }
        });
    }
    
    if (typeof map !== "undefined" && typeof map !== null){
        initMarkers();
    }
};

ko.applyBindings(new ViewModel());