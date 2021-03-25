import BasemapToggle from "https://js.arcgis.com/4.18/@arcgis/core/widgets/BasemapToggle.js";
import GeoJSONLayer from "https://js.arcgis.com/4.18/@arcgis/core/layers/GeoJSONLayer.js";
import Map from "https://js.arcgis.com/4.18/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.18/@arcgis/core/views/MapView.js";
import Search from "https://js.arcgis.com/4.18/@arcgis/core/widgets/Search.js";

// create the Map
const map = new Map({
  basemap: "streets-navigation-vector",
});

// create the MapView
const view = new MapView({
  container: "mapDiv",
  map: map,
  center: [-75.56, 43.0],
  zoom: 6,
});

// add map info when ready
view.when(function () {
  const info = document.getElementById("mapInfo");
  info.style.display = "block";
  view.ui.add(info, "top-right");
});

// add widgets
const bmToggleWidget = new BasemapToggle({ view: view, nextBasemap: "hybrid" });
view.ui.add(bmToggleWidget, "bottom-right");

const searchWidget = new Search({ view: view });
view.ui.add(searchWidget, "bottom-left");

// popup template
const countyPopupTemplate = {
  title: "{NAME} County",
  outFields: ["*"],
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "NAME",
          label: "County",
        },
        {
          fieldName: "NYSP_ZONE",
          label: "NAD83 SP Zone",
        },
      ],
    },
  ],
};

// create the jsonLayer
const countyLayer = new GeoJSONLayer({
  url: "./ny-counties.geojson",
  popupTemplate: countyPopupTemplate,
  id: "county",
});

// conditionally color the county polygons by zone
countyLayer.renderer = {
  type: "unique-value",
  field: "NYSP_ZONE",
  defaultSymbol: {
    type: "simple-fill",
    color: "red",
  },
  uniqueValueInfos: [
    {
      value: "East",
      symbol: {
        type: "simple-fill",
        color: [255, 0, 0, 0.3],
        style: "solid",
        outline: {
          color: "black",
          width: 2,
        },
      },
    },
    {
      value: "Central",
      symbol: {
        type: "simple-fill",
        color: [0, 0, 255, 0.3],
        style: "solid",
        outline: {
          color: "black",
          width: 2,
        },
      },
    },
    {
      value: "Long Island",
      symbol: {
        type: "simple-fill",
        color: [0, 255, 0, 0.3],
        style: "solid",
        outline: {
          color: "black",
          width: 2,
        },
      },
    },
    {
      value: "West",
      symbol: {
        type: "simple-fill",
        color: [255, 255, 0, 0.3],
        style: "solid",
        outline: {
          color: "black",
          width: 2,
        },
      },
    },
  ],
};

// add the jsonLayer to the map
map.add(countyLayer);

// set up a hover event handler for counties
view.on("pointer-move", (e) => {
  // only include graphics from counties in the hitTest
  const opts = { include: countyLayer };
  view.hitTest(e, opts).then(countyHoverHandler);
});

// handle hover events on counties
function countyHoverHandler(response) {
  if (response.results.length) {
    // hovering over a county
    document.getElementById("mapDiv").style.cursor = "pointer";
  } else {
    // not hovering over a county
    document.getElementById("mapDiv").style.cursor = "default";
  }
}
