const platform = new H.service.Platform({
  apikey: api_key,
});

// Initialize the engine type:
const engineType = H.Map.EngineType["HARP"];

// Obtain the default map types from the platform object:
const defaultLayers = platform.createDefaultLayers({
  engineType,
});

const map = new H.Map(
  document.getElementById("mapContainer"),
  defaultLayers.vector.normal.map,
  {
    engineType,
    zoom: 13,
    center: {
      lat: coordinates[0],
      lng: coordinates[1],
    },
  }
);
const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Enable dynamic resizing of the map, based on the current size of the enclosing cntainer
window.addEventListener("resize", () => map.getViewPort().resize());

// Create the default UI:
const ui = H.ui.UI.createDefault(map, defaultLayers);

// Instantiate a circle object (using the default style):

var circle = new H.map.Circle(
  { lat: coordinates[0], lng: coordinates[1] },
  1000
);

// Add the circle to the map:
map.addObject(circle);
