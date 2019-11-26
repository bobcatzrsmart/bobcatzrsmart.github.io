var citiesWeatherWaterID = {
  "Lady Bird Lake Paddling Trail": ["4726491", "08158000"],
  "Guadalupe River State Park Paddling Trail": ["4677392", "08167200"],
  "Pecan Bayou Paddling Trail": ["4677392", "08167200"],
  "South Llano Paddling Trail": ["4677392", "08167200"],
  "Upper Guadalupe – Nichol's Landing Paddling Trail": ["4677392", "08167200"]
}


require([
  "esri/Map",
  "esri/layers/FeatureLayer",
  "esri/views/MapView",
  "esri/widgets/Legend",
  "esri/widgets/Search",
  "esri/geometry/geometryEngine",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/tasks/support/Query",
  "esri/tasks/QueryTask",
  "esri/tasks/support/FeatureSet",
  "dojo/dom",
  "dojo/_base/array"
], function(Map, FeatureLayer, MapView, Legend, Search, geometryEngine, Graphic, GraphicsLayer, Query, QueryTask, FeatureSet, dom, arrayUtils) {
  // Create the map
  var map = new Map({
    basemap: "streets"
  });

  // Create the MapView
  var view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 6,
    center: [-99.062047, 31.405194]
  });

  //view.ui.add(new Legend({ view: view }), "bottom-left");
  var legendWidget = new Legend({
    view: view,
  }, "legendWidget")

  var paddlingTrailsPopupTemplate = {
    // autocasts as new PopupTemplate()
    title: "{TrailName}",
    outFields: ["*"],
    content: "<div id=\"customPopup\"><p style=\"color:#000000;font-size:12px;font-family:Avenir Next W00;\"><b><u>Trail Info: </u></b><br>TPWD Link: <a href=\"{TPWDLink}\" target=\"_blank\">Visit</a><br>Trail Length: {MaxLength} miles<br>Minimum Float Time: {TimeMin} hrs<br>Maximum Float Time: {TimeMax} hrs<br><br></div>"
  };

  var paddlingTrailsRenderer = {
    type: "simple",
    label: "Texas Paddling Trails",
    symbol: {
      type: "simple-line",
      color: "darkblue",
      width: 2,
    }
  };

  var accessPointsRenderer = {
    type: "simple",
    label: "Access Points",
    symbol: {
      type: "simple-marker",
      color: "orange",
      outline: {
        style: "solid",
        width: "1px",
        color: "black"
      }
    }
  }

  var accessPointsPopupTemplate = {
    title: "Access Point - {Name}",
    content: [
      {
        // It is also possible to set the fieldInfos outside of the content
        // directly in the popupTemplate. If no fieldInfos is specifically set
        // in the content, it defaults to whatever may be set within the popupTemplate.
        type: "fields",
        fieldInfos: [
          {
            fieldName: "LatDD",
            label: "Lat"
          },
          {
            fieldName: "LonDD",
            label: "Lon",
            format: {
              digitSeparator: true,
              places: 0
            }
          }
        ]
      }
    ]
  };

  var paddlingTrails = new FeatureLayer({
    url: "https://services1.arcgis.com/Hug9pbs2TYetbCha/arcgis/rest/services/WebMappingFinalProject/FeatureServer/1",
    title: "Paddling Trails",
    renderer: paddlingTrailsRenderer,
    popupTemplate: paddlingTrailsPopupTemplate
  });

  var accessPoints = new FeatureLayer({
    url:
      "https://services1.arcgis.com/Hug9pbs2TYetbCha/arcgis/rest/services/WebMappingFinalProject/FeatureServer/0",
    popupTemplate: accessPointsPopupTemplate,
    title: "Access Points",
    renderer: accessPointsRenderer,
  });

  var popupTemplate = {
    title: "{TrailName}",
  };

  searchQueryWidget = new Search({
    view: view,
    popupEnabled: false,
    container: "searchWidget"
  }, "searchWidget");


  map.add(accessPoints);
  map.add(paddlingTrails);



  view.when(function () {
    view.popup.watch("selectedFeature", function(graphic) {
      // Make sure selected feature is from Paddling Trails feature layer
      if (graphic && "TrailName" in graphic.attributes) {
        console.log(graphic.attributes["TrailName"]);
        var graphicTemplate = graphic.getEffectivePopupTemplate();
        weatherID = citiesWeatherWaterID[graphic.attributes["TrailName"]][0];
        waterID = citiesWeatherWaterID[graphic.attributes["TrailName"]][1];

        // AJAX call to retrieve water and weather data from APIs
        getWaterWeatherData(waterID, weatherID)
        // Once promise is resolved, create HTML output from JSONs
        .then(function(response) {
          currentWeather = response[1]['weather'][0]['main'];
          currentWeatherDescription = response[1]['weather'][0]['description'];
          currentTemp = k_to_f(response[1]['main']['temp']);
          currentWindSpeed = mps_to_mph(response[1]['wind']['speed']);
          currentWindDir = find_wind_dir(response[1]['wind']['deg']);
          weatherDataOutput = "<b><u>Current Weather Info:</b></u><br>Conditions: " + currentWeatherDescription + "<br>Temperature: " + currentTemp + "&deg;F<br>Wind: " + currentWindSpeed + "mph " + currentWindDir;

          siteName = response[0]['value']['timeSeries'][0]['sourceInfo']['siteName'];
          siteDischarge = response[0]['value']['timeSeries'][0]['values'][0]['value'][0]['value'] + 'cfs';
          dateTime = response[0]['value']['timeSeries'][0]['values'][0]['value'][0]['dateTime'];
          myDate = dateTime.substr(5,2) + '/' + dateTime.substr(8,2) + '/' + dateTime.substr(0,4);
          myTime = dateTime.substr(11,5);
          myTZ = dateTime.substr(23);
          waterDataOutput = "<b><u>Current Water Info:</b></u><br>Site: " + siteName + "<br>Discharge: " + siteDischarge + "<br>Reading Date: " + myDate + " " + myTime;

          contentHeader = "<div id=\"customPopup\"><p style=\"color:#000000;font-size: 12px;font-family:Avenir Next W00;\"><b><u>Trail Info: </u></b><br>TPWD Link: <a href=\"{TPWDLink}\" target=\"_blank\">Visit</a><br>Trail Length: {MaxLength} miles<br>Minimum Float Time: {TimeMin} hrs<br>Maximum Float Time: {TimeMax} hrs<br><br>";
          weatherWaterOutput = contentHeader + weatherDataOutput + "<br><br>" + waterDataOutput + "</p></div>";
          graphicTemplate["content"] = weatherWaterOutput;
        });
      }
    });
  });


  searchQueryWidget.on("select-result", function(event) {
    if(typeof bufferGraphic != 'undefined') {
      console.log("buffer graphic exists!");
      view.graphics.remove(bufferGraphic);
    }
    console.log("event started");
    var resultGeometry = event.result.feature.geometry;
    resultsLayer = new GraphicsLayer();

    var bufferRadius = dom.byId("bufferRadius").value;
    console.log("made it");
    var zoomLevel = 11;

    // Base custom zoom level on bufferRadius parameter
    switch (bufferRadius) {
      case "25":
        zoomLevel = 10;
        break;
      case "50":
        zoomLevel = 9;
        break;
      case "100":
        zoomLevel = 7;
        break;
      default:
        zoomLevel = 11;
    }

    // Set new custom zoom level and zoom to it
    var newTarget = {
      target: resultGeometry,
      zoom: zoomLevel
    };
    view.goTo(newTarget);

    // Create geometry around the result point with a predefined radius
    var pointBuffer = geometryEngine.geodesicBuffer(resultGeometry, bufferRadius, "miles");

    bufferGraphic = new Graphic({
      geometry: pointBuffer,
      symbol: {
        type: "simple-fill",
        color: [140, 140, 222, 0.3],
        outline: {
          color: [0, 0, 0, 0.5],
          width: 2
        }
      }
    });

    // Add the buffer to the view
    view.graphics.add(bufferGraphic);

    var queryTask = new QueryTask({
      url: "https://services1.arcgis.com/Hug9pbs2TYetbCha/arcgis/rest/services/WebMappingFinalProject/FeatureServer/1"
    });

    var query = paddlingTrails.createQuery();
    query.geometry = pointBuffer;
    query.spatialRelationship = "contains";
    query.returnGeometry = "true";


    queryTask.execute(query)
    .then(function(results) {
      var popResults = arrayUtils.map(results.features, function (feature) {
        feature.popupTemplate = popupTemplate;
        return feature;
      });
      if(popResults.length > 0) {
        resultsLayer.addMany(popResults);
        view.popup.open({
          features: popResults,
          featureMenuOpen: true,
          updateLocationEnabled: true
        });
      }
    });


  });


});

async function getWaterWeatherData(waterID, weatherID) {
  var waterCode = waterID;
  var requestURL = 'https://waterservices.usgs.gov/nwis/iv/?format=json&sites=' + waterCode;
  const response1 = await fetch(requestURL)
  const myJSON_water = await response1.json();
  console.log(myJSON_water);

  var weatherCode = weatherID;
  var requestURL = 'http://api.openweathermap.org/data/2.5/weather?id=' + weatherCode + '&appid=1cdac353307447c60e378c1947253f7b';
  const response2 = await fetch(requestURL)
  const myJSON_weather = await response2.json();

  waterWeatherResultsArray = [myJSON_water, myJSON_weather]
  return waterWeatherResultsArray;
}

/*
async function getWeatherData(stationID) {
  var cityID = stationID;
  var requestURL = 'http://api.openweathermap.org/data/2.5/weather?id=' + cityID + '&appid=1cdac353307447c60e378c1947253f7b';
  const response = await fetch(requestURL)
  const myJSON = await response.json();
  console.log("another async attempt");
  console.log(myJSON);
  return myJSON;
}
*/

function k_to_f(kTemp) {
  fTemp = kTemp * (9/5) - 459.67;
  return Math.round(fTemp);
}

function mps_to_mph(mps) {
  mph = mps * 2.237;
  return Math.round(mph);
}

function find_wind_dir(deg) {
  if (deg > 348.75 || deg <= 11.25) {
    return 'N';
  }
  else if (11.25 < deg <= 33.75) {
    return 'NNE';
  }
  else if (33.75 < deg <= 56.25) {
    return 'NE';
  }
  else if (56.25 < deg <= 78.75) {
    return 'ENE';
  }
  else if (78.75 < deg <= 101.25) {
    return 'E';
  }
  else if (78.75 < deg <= 101.25) {
    return 'E';
  }
  else if (101.25 < deg <= 123.75) {
    return 'ESE';
  }
  else if (123.75 < deg <= 146.25) {
    return 'SE';
  }
  else if (146.25 < deg <= 168.75) {
    return 'SSE';
  }
  else if (168.75 < deg <= 191.25) {
    return 'S';
  }
  else if (191.25 < deg <= 213.75) {
    return 'SSW';
  }
  else if (213.75 < deg <= 236.25) {
    return 'SW';
  }
  else if (236.25 < deg <= 258.75) {
    return 'WSW';
  }
  else if (258.75 < deg <= 281.25) {
    return 'W';
  }
  else if (281.25 < deg <= 303.75) {
    return 'WNW';
  }
  else if (303.75 < deg <= 326.25) {
    return 'NW';
  }
  else if (326.25 < deg <= 348.75) {
    return 'NNW';
  }
  else {
    return null;
  }
}
