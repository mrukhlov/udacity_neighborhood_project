var markers = [];
var markers_list = [];
var search_result = [];
var infoWindow;

var marker = function (data) {
    this.name = ko.observable(data.name);
    this.id = ko.observable(data.id);
    this.address = ko.observable(data.formatted_address);
};

var ViewModel = function () {
	this.header = 'GMaps project';
	this.filter = ko.observable("");
	this.incr = 1;

	var self = this;

	this.markerList = ko.observableArray([]);

	this.alert = function (obj) {
		
	    var marker = obj.id();
		
		markers_list.forEach(function (markers_list_item) {
			var id = Object.keys(markers_list_item)[0];
			if (id == marker) {
				var current_marker = markers_list_item[id];
				search_result.forEach(function (search_result_item) {
					var idd = Object.keys(search_result_item)[0];
					if (id == idd) {
						var map_object = search_result_item[idd];
						search_result_marker_bind(map_object, current_marker);
					}
				})
			}
		})
    };

    this.q_filter = function (obj) {
    	self.markerList.removeAll();
    	var q = this.filter();
    	var filtered_list = [];
	    markers.forEach(function (markerItem) {
	    	var re = new RegExp('^'+q,'i');
		    if (markerItem.name.search(re) > -1){
		    	self.markerList.push(new marker(markerItem));
		    	filtered_list.push(markerItem);
		    }
	    });
	    clearMarkers(filtered_list)
    };
	
	function initMap() {
		pos = {lat: 40.7548601, lng: -73.9853687};
		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 13,
			center: pos
		});
		infoWindow = new google.maps.InfoWindow();
		// map_search('restaurant');
		
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				map.setCenter(pos);
				map_search('restaurant')
			}, function () {
				handleLocationError(true, infoWindow, map.getCenter());
				map.setCenter(pos);
				map_search('restaurant');
			})
		} else {
			handleLocationError(false, infoWindow, map.getCenter());
			map.setCenter(pos);
			map_search('restaurant');
		}
	}
	
	function handleLocationError(browserHasGeolocation, infoWindow, pos){
	    infoWindow.setPosition(pos);
	    infoWindow.setContent(browserHasGeolocation ?
	        'Error: The Geolocation service failed.' :
	        'Error: Your browser doesn\'t support geolocation.');
	}
	
	function map_search(q) {
		var map_loc = new google.maps.LatLng(pos.lat, pos.lng);
		var request = {
			location: map_loc,
			radius: '500',
			query: q
		};
		service = new google.maps.places.PlacesService(map);
		service.textSearch(request, callback);
	}
	
	function search_result_marker_bind (map_object, marker_marker) {
		service.getDetails(map_object, function (result, status) {
			if (status !== google.maps.places.PlacesServiceStatus.OK) {
				console.error(status);
				return;
			}
			toggleBounce(marker_marker);
			get_here_com_info(result, marker_marker);
		});
	}
	
	function toggleBounce(marker) {
		setTimeout(function () {
	        marker.setAnimation(google.maps.Animation.BOUNCE);
	    }, 100);
	    setTimeout(function () {
	        marker.setAnimation(null);
	    }, 1550);
	}
	
	function callback (results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			markers = results;
			addMarker(results);
		} else if (status == google.maps.places.PlacesServiceStatus.ERROR) {
			alert('There was a problem contacting the Google servers.')
		} else if (status == google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
			alert('This request was invalid.')
		} else if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
			alert('The webpage has gone over its request quota.')
		} else if (status == google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
			alert('The webpage is not allowed to use the PlacesService.')
		} else if (status == google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR) {
			alert('The PlacesService request could not be processed due to a server error. The request may succeed if you try again.')
		} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
			alert('No result was found for this request.')
		}
	}
	
	function addMarker(results) {
		// clearMarkers();
		self.markerList.removeAll();
		
		results.forEach(function (result) {
			var place_id = result.id;
			
			var marker_obj = new google.maps.Marker({
				map: map,
				position: result.geometry.location,
				animation: google.maps.Animation.DROP,
			});
			
			var key = place_id;
			var obj = {};
			obj[key] = marker_obj;
			markers_list.push(obj);
			
			var key = place_id;
			var obj = {};
			obj[key] = result;
			search_result.push(obj);
			
			google.maps.event.addListener(marker_obj, 'click', function () {
				search_result_marker_bind(result, marker_obj);
			});
			self.markerList.push(new marker(result));
		});
	}
	
	function clearMarkers(filtered_list) {
		var filter_list_hide = [];
		var filter_list_show = [];
		filtered_list.forEach(function (item) {
			var id = item.id;
			markers_list.forEach(function (marker) {
				var marker_id = Object.keys(marker)[0];
				if (marker_id != id) {
					filter_list_hide.push(marker)
				} else {
					filter_list_show.push(marker)
				}
			})
		});
		setMapOnAll(filter_list_hide, filter_list_show);
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
	
	function get_here_com_info(map_object, current_marker) {
	    var lat = map_object.geometry.location.lat();
	    var lng = map_object.geometry.location.lng();
		pos = {
			lat: lat,
			lng: lng
		};
		map.setCenter(pos);
	    $.ajax({
	        url : "https://places.cit.api.here.com/places/v1/discover/search",
	        type : "GET",
	        contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
	        data: {
	            'at':lat+','+lng,
	            'q':map_object.name,
	            'app_id': 'lQDy8jl1CQNubWkjWXiB',
	            'app_code': 'oEWUyNRzNa3OtTO8joeZWg'
	        },
	        error : function(data){
	            alert('Oops, something went wrong. Check console.');
	            console.log(data.responseText);
	        },
	        success : function(data){
	            var items = data.results.items;
	            var coords;
	            var href;
	            var rating;
	            for (var i in items) {
	                var here_lat = items[i].position[0];
	                var here_lng = items[i].position[1];
	                var here_list = [here_lat, here_lng];
	                if (here_lat.toFixed(3) == lat.toFixed(3) && here_lng.toFixed(3) == lng.toFixed(3)){
	                    coords = items[i].position;
	                    href = items[i].href;
	                    rating = items[i].averageRating;
	                    break;
	                } else {
	                    if (here_lat.toFixed(2) == lat.toFixed(2) && here_lng.toFixed(2) == lng.toFixed(2)){
	                        coords = items[i].position;
	                        href = items[i].href;
	                        rating = items[i].averageRating;
	                        break;
	                    } else {
	                        if (here_lat.toFixed(1) == lat.toFixed(1) && here_lng.toFixed(1) == lng.toFixed(1)){
	                            coords = items[i].position;
	                            href = items[i].href;
	                            rating = items[i].averageRating;
	                            break;
	                        }
	                    }
	                }
	            }
	            
			    var google_rating = '';
			    var price_level = '';
			    var opening_hours = '';
				var reviews = '';
				
				if (map_object['price_level']) {
					price_level = '</br><b>Price level</b>: ' + map_object.price_level;
				}
				
				if (map_object.rating) {
					google_rating = '</br><b>Google Rating</b>: <b>' + map_object.rating +'</b> stars';
				}
				
				if (map_object['opening_hours']) {
					if (map_object.opening_hours.open_now == true) {
						opening_hours = 'Open';
						opening_hours = '</br><b>Opening hours</b>: ' + opening_hours;
					} else {
						opening_hours = 'Closed';
						opening_hours = '</br><b>Opening hours</b>: ' + opening_hours;
					}
				}
				
				if (map_object['reviews']) {
					reviews = '</br><b>Google Reviews</b>:';
					map_object.reviews.forEach(function (review) {
						if (review.text.length > 0){
							var text = review.text.replace('</br>', '');
							reviews += '</br>- ' + text
						}
					});
				}

	            if (coords && href) {
	                $.ajax({
	                    url : href,
	                    type : "GET",
	                    contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
	                    error : function(data){
	                        alert('Oops, something went wrong. Check console.');
	                        console.log(data.responseText);
	                    },
	                    success : function(data){
	                        var name = data.name;
	                        var address = data.location.address.text;
	                        var phone = data.contacts.phone[0].value;
	                        var website = '';
	                        if (data.contacts['website'] && data.contacts['website'].length > 0){ website = data.contacts.website[0].value}
	                        var view = data.view;
	                        var info_string = '<b>' + name + '</b></br><a href="'+view+'" target="_blank">here.com</a> rating: <b>'+rating+'</b> stars'+google_rating+'</br><b>Phone</b>: ' + phone + '</br><b>Website</b>: <a target="_blank" href="' + website + '">'+website+'</a>' + price_level + opening_hours + reviews;
	                        infoWindow.setContent(info_string);
	                        infoWindow.open(map, current_marker);
	                    }
	                })
	            } else {
	                var info_string = '<b>' + map_object.name + '</b>' + google_rating + price_level + opening_hours + reviews;
	                infoWindow.setContent(info_string);
	                infoWindow.open(map, current_marker);
	            }
	        }
	    });
	}
	
	initMap();
};

ko.applyBindings(new ViewModel());