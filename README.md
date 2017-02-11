## Udacity Neighborhood Project

#### Description
This application is interactive map of local restaurants. 

It uses HTML geolocation to obtain user current location and provide list of restaurants nearby.

When search results list item or map marker is clicked, it provides info window with name, website, reviews of this poi.

In addition to GMaps API i used here.com API. They provide various information of the place you're interested in. If retrieve fails, or here.com has no info, Google Maps API place information is used.

Filter input reacts on keyboard press and filters search results list and markers on the map.

#### How to run

Application can be run by opening index.html. Besides script.js no other files or libs needed because knockout and jquery libs are already included in index file.