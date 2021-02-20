//global variables
var border;
var currencyCode;
var countryName;
let capitalCityWeather;
let capitalCityLat;
let capitalCityLon;
let iso2CountryCode;
let capitalCity;
let visitedCountries = [];
let popup;
let issTracker = false;
let quakeMapper = false;


var tracker = true;

var issIcon = L.icon({
    iconUrl: './img/iss.png',
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [-3, 16]
});

var issTimeoutID;
var issMarker;

let flagArray = true;


// Markers cluster for a better handling
//var myMarkers = new L.featureGroup().addTo(map);
var customIconRed = new L.Icon({
  iconUrl: './img/marker.png',
  iconSize: [50, 50],
  iconAnchor: [25, 50]
});
var customIconOrange = new L.Icon({
  iconUrl: './img/marker_orange.png',
  iconSize: [50, 50],
  iconAnchor: [25, 50]
});


/*
// asignamos el div con el id="map" a la propiedad map del objeto "L". L viene de "Leaflet"
var map = L.map('map').fitWorld();

// asignamos mapbox como nuestra gradilla 
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicGV6IiwiYSI6ImNraWFlcDVsYTBpMW0ycnJreWRxdnNneXIifQ._2kq-bt8gs8Wmc5JIY-6NQ'
}).addTo(map);
*/

var mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
var mapboxAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
var token = 'pk.eyJ1IjoicGV6IiwiYSI6ImNraWFlcDVsYTBpMW0ycnJreWRxdnNneXIifQ._2kq-bt8gs8Wmc5JIY-6NQ'

var dark = L.tileLayer(mapboxUrl, {id: 'mapbox/dark-v10', tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: token}),
    streets   = L.tileLayer(mapboxUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: token});
    outdoors   = L.tileLayer(mapboxUrl, {id: 'mapbox/outdoors-v11', tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: token});
    light   = L.tileLayer(mapboxUrl, {id: 'mapbox/light-v10', tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: token});
    satellite   = L.tileLayer(mapboxUrl, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: token});
    satStreets   = L.tileLayer(mapboxUrl, {id: 'mapbox/satellite-streets-v11', tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: token});

var baseMaps = {
    "Streets": streets,
    "Dark": dark,
    "Outdoors": outdoors,
    "Light": light,
    "Satellite": satellite,
    "Stellite-Streets": satStreets
};

var map = L.map('map', {
    
    zoom: 10,
    layers: [streets]
}).fitWorld();

L.control.layers(baseMaps).addTo(map);

var myCircles = new L.featureGroup().addTo(map);


// A more programatically way to build the countries <select> list
$.ajax({
	url: "./php/geoJson.php",
	type: 'POST',
	dataType: "json",
	
	success: function(result) {
		console.log('populate options' , result);
        if (result.status.name == "ok") {
            for (var i=0; i<result.data.border.features.length; i++) {
                        $('#selCountry').append($('<option>', {
                            value: result.data.border.features[i].properties.iso_a3,
                            text: result.data.border.features[i].properties.name,
                        }));
                    }
                }
            //sort options alphabetically
            $("#selCountry").html($("#selCountry option").sort(function (a, b) {
                return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
            }))
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
      });

// Locating user's device and getting info from openCage API
const successCallback = (position) => {
  $.ajax({
      url: "./php/openCage.php",
      type: 'GET',
      dataType: 'json',
      data: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
      },

      success: function(result) {
          console.log('openCage PHP',result);
          currentLat = result.data[0].geometry.lat;
          currentLng = result.data[0].geometry.lng;
            /*
          L.marker([currentLat, currentLng], {icon: customIconRed}).addTo(map).bindPopup("You are in: <br><br><br>" + result.data[0].components.postcode + "<br><br>" +
                                                                                              result.data[0].components.suburb + " suburb <br><br>" +
                                                                                              result.data[0].components.town + " town <br><br>" +
                                                                                              result.data[0].components.state + " state <br><br>" +
                                                                                              result.data[0].components.country + " <br><br>" 
                                                                                        );
            */
          $("selectOpt select").val(result.data[0].components["ISO_3166-1_alpha-3"]);
          
          let currentCountry = result.data[0].components["ISO_3166-1_alpha-3"];
          $("#selCountry").val(currentCountry).change();
      
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
      }
  }); 
}

const errorCallback = (error) => {
          console.error(error);
}
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);


// adding borders to our map

$('#selCountry').on('change', function() {
  let countryCode = $('#selCountry').val();
  let countryOptionText= $('#selCountry').find('option:selected').text();
   
  // Checking the new visited country is not already in the array and push it
  if(!visitedCountries.includes(countryOptionText)) {
    visitedCountries.push(countryOptionText)
    console.log('Array visited countries', visitedCountries)
  }
  
  //default to home tab
  const showFirstTab = function () {
         $('#nav-home-tab').tab('show');
       }
  showFirstTab();

  $.ajax({
    url: "./php/geoJson.php",
    type: 'POST',
    dataType: 'json',
    success: function(result) {

        console.log('all borders result', result);

        if (map.hasLayer(border)) {
            map.removeLayer(border);
        }
          
        let countryArray = [];
        let countryOptionTextArray = [];
    
        for (let i = 0; i < result.data.border.features.length; i++) {
            if (result.data.border.features[i].properties.iso_a3 === countryCode) {
                countryArray.push(result.data.border.features[i]);
            }
        };
        for (let i = 0; i < result.data.border.features.length; i++) {
            if (result.data.border.features[i].properties.name === countryOptionText) {
                countryOptionTextArray.push(result.data.border.features[i]);
            }
        };
     
        border = L.geoJSON(countryOptionTextArray[0], {
                                                        color: 'lime',
                                                        weight: 3,
                                                        opacity: 0.75
                                                        }).addTo(map);
        let bounds = border.getBounds();
            map.flyToBounds(bounds, {
            padding: [35, 35], 
            duration: 2,
            });                          
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(textStatus, errorThrown);
    }
  }); 
});

// fetching info from rest countries API
$('#btnRun').click(function() {
  $.ajax({
      url: "./php/restCountries.php",
      type: 'POST',
      dataType: 'json',
      data: {
          country: $('#selCountry').val()   
      },
      success: function(result) {
        
          console.log('restCountries', result);
          if (result.status.name == "ok") {
              currencyCode = result.currency.code;
              capitalCityWeather= result.data.capital.toLowerCase();
              iso2CountryCode = result.data.alpha2Code;
              var countryName2 = result.data.name;
              countryName = countryName2.replace(/\s+/g, '_');
              
              $('#txtName').html(result['data']['name']+ '<br>');
              $('#txtCurrency').html('<strong> ' + result.currency.name + '</strong><br>');
              $('#txtCurrencyCode').html('Code: <strong>' + result.currency.code + '</strong><br>');
          
      //wikipedia country extracts
              $.ajax({
                  url:'https://en.wikipedia.org/api/rest_v1/page/summary/' + countryName,
                  type: 'GET',
                  dataType: 'json',
                  success: function(result) {
                    console.log('wiki info', result);
                    $('#txtWikiImg').html('<img src=' + result.thumbnail.source +'><br>');
                    $('#txtWiki').html(result.extract_html +'<br>');
                  },
        
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              });
      //Geonames Country Info
              $.ajax({
                  url: "./php/getCountryInfo.php",
                  type: 'GET',
                  dataType: 'json',
                  data: {
                      geonamesInfo: iso2CountryCode,
                  },
                  success: function(result) {
                      console.log('Geonames Data', result);
                      if (result.status.name == "ok") {
                        $('#txtCapital').html('Capital: <strong>'+result.data[0].capital+ '</strong><br>');
                        //$('#txtCapital2').html('<strong>' + result.data[0].capital+ '\'\s Weather</strong><br>');
                        $('#txtAreaInSqKm').html('Area: <strong>'+result.data[0].areaInSqKm+ '</strong> km²<br>');
                        $('#txtContinent').html('Continent: <strong>'+result.data[0].continent+ '</strong><br>');
                        $('#txtPopulation').html('Population: <strong>'+result.data[0].population+ '</strong><br>');
                        $('#txtLanguages').html('Languages: <strong>'+ result.data[0].languages + '</strong><br>');
                      }
                    },
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              });
      
              //News API
              $.ajax({
                  url: "./php/news.php",
                  type: 'GET',
                  dataType: 'json',
                  data: {
                      newsCountry: iso2CountryCode,
                  },
                  success: function(result) {
                      console.log('News Data', result);
                      if (result.status == "No matches for your search.") {
                          $('#txtHeadlineTitle').hide();
                          $('#newsList').hide();
                          $('#noNews').html('Sorry, the Newscatcher API does not have articles for this country.');
                      }
                      else if (result.status == "ok") {
                          $('#newsList').html("");
                          for (var i=0; i<result.articles.length; i++) {
                              $("#newsList").append('<li><a href='+ result.articles[i].link + '>' + result.articles[i].title + '</a></li>');
                      }                
                  }},
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              }); 

              //Covid info
              $.ajax({
                  url: "./php/covid.php",
                  type: 'GET',
                  dataType: 'json',
                  data: {
                      covidCountry: iso2CountryCode,
                  },
                  success: function(result) {
                      console.log('Covid Data',result.covidData);
                                            
                      if (result.status.name == "ok") {
                          $('#txtCovidDeaths').html('Deaths: ' + result.covidData.deaths + '<br>');
                          $('#txtCovidCases').html('Total Registered Cases: ' + result.covidData.confirmed + '<br>');
                          $('#txtCovidRecovered').html('Recoveries: ' + result.covidData.recovered + '<br>');
                          $('#txtCovidCritical').html('Current Critical Patients: ' + result.covidData.critical + '<br>');
                          $('#txtCovidDeathRate').html('<strong>Death rate: ' + result.covidData.calculated.death_rate.toFixed(1) + ' %</strong><br>');
                         
                      }
                  
                  },
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              });  

              // Exchange Rates
              $.ajax({
                  url: "./php/exchangeRates.php",
                  type: 'GET',
                  dataType: 'json',
                  success: function(result) {
                      console.log('exchange rates',result);
                      if (result.status.name == "ok") {
                      
                      exchangeRate = result.exchangeRate.rates[currencyCode];
                      $('#txtRate').html('Ex. Rate: <strong>' + exchangeRate.toFixed(3) + '</strong> ' + currencyCode + ' to <strong>1</strong> USD. <br>');
                      }
                  },
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              });  
              //openWeather API          
              $.ajax({
                  url: "./php/openWeatherCurrent.php",
                  type: 'POST',
                  dataType: 'json',
                  data: {
                      capital: capitalCityWeather,
                  }, 
                  success: function(result) {
                      console.log('CurrentCapitalWeather', result);
                      capitalCityLat = result.weatherData.coord.lat;
                      capitalCityLon = result.weatherData.coord.lon;
                      
                      if (result.status.name == "ok") {
          
                          $('#txtCapitalWeatherCurrent').html('&nbsp;&nbsp;&nbsp;&nbsp;Today: &nbsp;&nbsp;'+ result.weatherData.weather[0].description +'&nbsp;&nbsp; || &nbsp;&nbsp; current temp: &nbsp;' + result.weatherData.main.temp +'&#8451<br>');
                          $('#txtCapitalWeatherLo').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Low: ' + result.weatherData.main.temp_min +'&#8451<br>');
                          $('#txtCapitalWeatherHi').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;High: ' + result.weatherData.main.temp_max +'&#8451<br>');
                          
                          //forcast API
                          $.ajax({
                              url: "./php/openWeatherForcast.php",
                              type: 'GET',
                              dataType: 'json',
                              data: {
                                  lat: capitalCityLat,
                                  lng: capitalCityLon
                              },
                              success: function(result) {
                                  
                                  console.log('Weather Forecast',result);
                                  
                                  if (result.status.name == "ok") {
                                        
                                        $('#txtCapitalWeatherForcast').html('&nbsp;&nbsp;&nbsp;&nbsp;Tomorrow: &nbsp;&nbsp;' + result.weatherForcast.daily[1].weather[0].description +'<br>');
                                        $('#txtCapitalWeatherFHi').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Expected High: ' + result.weatherForcast.daily[1].temp.max + '&#8451<br>')
                                        $('#txtCapitalWeatherFLo').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Expected Low: ' + result.weatherForcast.daily[1].temp.min + '&#8451<br>')
                                  }
                              },
                              error: function(jqXHR, textStatus, errorThrown) {
                                  console.log(textStatus, errorThrown);
                              }
                          });
                          
                          // wiki places of interest
                          $.ajax({
                              url: "./php/wikiPlaces.php",
                              type: 'GET',
                              dataType: 'json',
                              data: {
                                  lat: capitalCityLat,
                                  lng: capitalCityLon
                              },
                              success: function(result) {
                                  console.log('wikiPlaces Data',result);
                                  $('#wikiPlaces').html("");
                                  if (result.status.name == "ok") {
                                      for (var i=0; i<result.wikiPlaces.length; i++) {
                                          $("#wikiPlaces").append('<li><a href=https://'+result.wikiPlaces[i].wikipediaUrl+'>'+ result.wikiPlaces[i].title +'</a></li>' 
                                          )}
                                          }
                              
                              },
                              error: function(jqXHR, textStatus, errorThrown) {
                                  console.log(textStatus, errorThrown);
                              }
                          });
                      }
                  },
                  error: function(jqXHR, textStatus, errorThrown) {
                      console.log(textStatus, errorThrown);
                  }
              });              
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
      }  
  }); 
});

// New event for map click
map.on('click', function(e) {        
  var popLocation = e.latlng;
  //console.log('<<---popLocation--->>', popLocation.lat)
  $.ajax({
    url: "./php/openCage.php",
    type: 'GET',
    dataType: 'json',
    data: {
        lat: popLocation.lat,
        lng: popLocation.lng,
    },

    success: function(result) {

        if (result.data[0].components["ISO_3166-1_alpha-3"]) {
            console.log('openCage PHP',result);
            //console.log(typeof result);
            currentLat = result.data[0].geometry.lat;
            currentLng = result.data[0].geometry.lng;

            
            // L.marker([currentLat, currentLng], {icon: customIconOrange}).addTo(map).bindPopup("You clicked in: " + result.data[0].components.country);

            $("selectOpt select").val(result.data[0].components["ISO_3166-1_alpha-3"]);
            
            let currentCountry = result.data[0].components["ISO_3166-1_alpha-3"];
            $("#selCountry").val(currentCountry).change();
        }
        else {
            console.log("clicked on water")
            console.log('openCage PHP',result);

            currentLat = result.data[0].geometry.lat;
            currentLng = result.data[0].geometry.lng;

            

            L.popup()
                .setLatLng([currentLat, currentLng])
                .setContent("<div><strong>" + result.data[0].formatted + "</strong></div>")
                .openOn(map);
        }
     
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
        console.log(jqXHR, errorThrown)
       
    }
  });        

});

    // Adding buttons

L.easyButton('<img src="./img/eq.png">', function(btn, map){
    
    if (!quakeMapper) {

        map.setZoom(3);

        $.ajax({
        	url: "./php/getEarthquakeData.php",
        	type: 'GET',
        	dataType: "json",

        
        	success: function(result) {
                console.log('populate options' , result.earthquakeData.features[0]);
                for (var i = 0; i < result.earthquakeData.features.length; i++) {

                    var quakePos = result.earthquakeData.features[i].geometry.coordinates;
                    var mag = result.earthquakeData.features[i].properties.mag * 32 * 50;
                    var locDate = new Date(result.earthquakeData.features[i].properties.time).toISOString().slice(0, 19).replace("T", " / ")

                    L.circle([quakePos[1], quakePos[0]], {
                        color: 'red',
                        fillColor: 'white',
                        fillOpacity: 0.8,
                        radius: mag,
                        stroke: true,
                        weight: 5, 
                    }).addTo(myCircles).bindPopup('<strong>Magnitude: </strong>' + result.earthquakeData.features[i].properties.mag + ' <strong>points.</strong><br>' +
                                            '<strong>Place: </strong>' + result.earthquakeData.features[i].properties.place + '<br>' +
                                            '<strong>Type: </strong>' + result.earthquakeData.features[i].properties.type + '<br>' +
                                            '<strong>Unix Time: </strong>' + result.earthquakeData.features[i].properties.time + '<br>' +
                                            '<strong>Local Date / Time: </strong>' + locDate);        
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        
        });
        quakeMapper = true
    } else {
        myCircles.eachLayer(function (layer) {

            myCircles.removeLayer(layer);
        
        });
        quakeMapper = false
    }
    
   
}).addTo(map);

// keyboard control to toggle focus view on/off

$(window).keypress(function (e) {
    //use e.which to know what key was pressed
    var keyCode = e.which;
    //console.log(e, keyCode, e.which)
    if (keyCode == 116) {
        if (tracker === false) {
            tracker = true;
        }
        else {
            tracker = false;
        }
        
    }
})

// Adding button to track iss 

L.easyButton('<img src="./img/track.png">', function(btn, map){
    
    if (!issTracker){
        //alert('Press "T" to toggle on/off focus on ISS')
        issTracker = true;
        tracker = true;
        map.setZoom(5.5);

        document.getElementById('issInfoBanner').style.visibility = "visible";

        function trackISS () {
            $.ajax({
                url: "./php/issTracker.php",
                type: 'GET',
                dataType: 'json',
                success: function(result){
                    //console.log(result.data.info.iss_position.latitude);
                    if(result){
                        updateISSMarker(result.data.info.iss_position.latitude, 
                            result.data.info.iss_position.longitude);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    alert(`Error in ISS pos: ${textStatus} ${errorThrown} ${jqXHR}`);
                }
            });
             issTimeoutID = setTimeout(trackISS, 1000); 
        }

        // ISS marker and circle update function
        function updateISSMarker(lat, lon) {
            if(issMarker != undefined) { 
                map.removeLayer(issMarker);
            }

            issMarker = new L.marker([lat, lon], {icon: issIcon}).addTo(map);
            if (tracker) {
                map.setView([lat, lon]);
            }
        }
        trackISS();
    }
    else {
        
        clearTimeout(issTimeoutID)
        //to avoid the iss icon printed on the map after disabling tracker
        setTimeout("map.removeLayer(issMarker);", 1050)
        document.getElementById('issInfoBanner').style.visibility = "hidden";
        issTracker = false;
    }        
}).addTo(map)

// Adding button for visited countries list

L.easyButton('<img src="./img/lista.png">', function(btn, map){
    
    popup = '<strong>Visited Countries: </strong><br><br>';

    for (var i = 0; i < visitedCountries.length; i++) {
        popup = popup + visitedCountries[i] + '<br>';
    }

    var countriesPopup = L.popup().setContent(popup);

    countriesPopup.setLatLng(map.getCenter()).openOn(map);
}).addTo(map);

