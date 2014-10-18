(function() {
  'use strict';
  window.KR = (function() {
    var accidentsSplit, accidentsSplitYear, accidents_in_2012, colors, featureOptions, generateScale, infoWindow, isLoaded, map, _clearHighlight, _getColor, _getRange, _gotoViz, _handleClickOnState, _handleClickOutState, _handleMouseOver, _hideLoader, _hideToolTip, _init, _initEventListners, _initMap, _loadAccidents2012Data, _loadLineChart, _loadPieChart, _loadSplitData, _setDisableStyle, _showContent, _showLoader, _showToolTip, _styleFeature, _updatedAccidentsCause, _updatedAccidentsPerYear;
    map = null;
    accidents_in_2012 = [];
    accidentsSplitYear = [];
    accidentsSplit = [];
    isLoaded = false;
    infoWindow = new google.maps.InfoWindow({
      content: ""
    });
    colors = ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"];
    featureOptions = [
      {
        elementType: "geometry",
        stylers: [
          {
            visibility: "simplified"
          }, {
            saturation: -45
          }, {
            lightness: 13
          }, {
            gamma: 0.7
          }, {
            weight: 0.3
          }, {
            hue: "#0077ff"
          }
        ]
      }, {
        elementType: "labels",
        stylers: [
          {
            visibility: "simplified"
          }
        ]
      }, {
        elementType: "geometry.stroke",
        stylers: [
          {
            color: "#000000"
          }
        ]
      }
    ];
    _init = function() {
      _initMap();
      return _gotoViz();
    };
    _hideLoader = function() {
      if ($('.intro').length === 0) {
        return $('.loader').remove();
      }
    };
    _showLoader = function() {
      return $('.loader').fadeIn(1000);
    };
    _showContent = function() {
      $('.legend').removeClass('hide').addClass('fadeInUpBig');
      $('.details').removeClass('hide').addClass('fadeInRightBig');
      return $('header').removeClass('hide').addClass('fadeInDownBig');
    };
    _gotoViz = function() {
      return $('#gotoviz').on('click', function(e) {
        if (isLoaded === true) {
          return $('.loader').remove();
        } else {
          $('.intro').remove();
          return $('.inner-loader').removeClass('hide');
        }
      });
    };
    _initMap = function() {
      var customMapType;
      map = new google.maps.Map(document.getElementById("map"), {
        center: new google.maps.LatLng(23.5674244, 85.7557826),
        zoom: 5,
        maxZoom: 9,
        minZoom: 3,
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, "custom"]
        },
        mapTypeId: "custom",
        streetViewControl: false
      });
      map.data.loadGeoJson("./data/india.geojson", {
        idPropertyName: "NAME_1"
      });
      _initEventListners();
      customMapType = new google.maps.StyledMapType(featureOptions, {
        name: "Jass"
      });
      map.mapTypes.set("custom", customMapType);
      map.data.setStyle(_styleFeature);
      return google.maps.event.addListenerOnce(map.data, "addfeature", function() {
        _loadAccidents2012Data();
        _loadSplitData();
        isLoaded = true;
        _hideLoader();
        _showContent();
      });
    };
    _clearHighlight = function() {
      return $('.legend-list li').removeClass('active');
    };
    _handleClickOnState = function(event) {
      if (!event.feature.getProperty('state')) {
        map.data.forEach(function(_feature) {
          return _feature.removeProperty('state');
        });
        map.data.setStyle(_setDisableStyle);
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, {
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#000'
        });
        _handleMouseOver(event);
        return event.feature.setProperty("state", "active");
      } else {
        map.data.setStyle(_styleFeature);
        map.data.revertStyle();
        event.feature.removeProperty("state");
      }
    };
    _handleMouseOver = function(event) {
      var accidentsIn2012, accidentsIn2012Total, currentState, range;
      currentState = event.feature.getProperty('NAME_1');
      accidentsIn2012 = event.feature.getProperty('value');
      accidentsIn2012Total = event.feature.getProperty('total_accidents');
      range = _getColor(accidentsIn2012);
      _clearHighlight();
      $(".legend-list li:nth-child(" + range + ")").addClass('active');
      $('.state-name').text(currentState);
      $('.accidents_2012').text(accidentsIn2012);
      $('.accidents_2012_total').text(accidentsIn2012Total);
      _loadLineChart(currentState);
      return _loadPieChart(currentState);
    };
    _handleClickOutState = function(event) {
      event.feature.setProperty("state", "normal");
      return _clearHighlight();
    };
    _initEventListners = function() {
      map.data.addListener('click', _handleClickOnState);
      return map.data.addListener('mouseout', _hideToolTip);
    };
    _hideToolTip = function() {};
    _showToolTip = function(event) {
      var anchor;
      map.data.overrideStyle(event.feature, {
        strokeColor: 'white',
        strokeWeight: 2
      });
      infoWindow.setContent("supberb awesome cooll sutff...");
      anchor = new google.maps.MVCObject();
      anchor.set("position", event.latLng);
      return infoWindow.open(map, anchor);
    };
    _loadSplitData = function(state) {
      return $.ajax({
        url: "data/accident-cause-2012.json",
        dataType: "JSON",
        success: function(response) {
          return response.data.forEach(function(item) {
            state = map.data.getFeatureById($.trim(item[0]) + "");
            return _updatedAccidentsCause(item);
          });
        }
      });
    };
    _updatedAccidentsCause = function(item) {
      return accidentsSplit[$.trim(item[0]) + ""] = {
        key: $.trim(item[0]) + "",
        values: [
          {
            label: "Fault of Driver",
            value: item[1]
          }, {
            label: "Fault of Cyclist",
            value: item[4]
          }, {
            label: "Fault of Pedestrian",
            value: item[7]
          }, {
            label: "Condition of Motor Vehicle",
            value: item[10]
          }, {
            label: "Defect in Road Condition",
            value: item[13]
          }, {
            label: "Weather Condition",
            value: item[16]
          }, {
            label: "Other Causes",
            value: item[19]
          }
        ]
      };
    };
    _loadAccidents2012Data = function() {
      return $.ajax({
        url: "data/total-accidents-2009-2012.json",
        dataType: "JSON",
        success: function(response) {
          response.data.forEach(function(item) {
            var state;
            state = map.data.getFeatureById($.trim(item[0]) + "");
            state.setProperty("value", parseFloat(item[8]));
            state.setProperty('total_accidents', parseInt(item[1]));
            accidents_in_2012.push(parseFloat(item[8]));
            return _updatedAccidentsPerYear(item);
          });
          return generateScale();
        }
      });
    };
    _updatedAccidentsPerYear = function(item) {
      return accidentsSplitYear[$.trim(item[0])] = {
        total: [
          {
            key: "Total Accidents",
            values: [
              {
                x: "2009",
                y: parseFloat(item[1])
              }, {
                x: "2010",
                y: parseFloat(item[2])
              }, {
                x: "2011",
                y: parseFloat(item[3])
              }, {
                x: "2012",
                y: parseFloat(item[4])
              }
            ]
          }
        ]
      };
    };
    _setDisableStyle = function(feature) {
      var showRow;
      showRow = true;
      if ((feature.getProperty("value") == null) || isNaN(feature.getProperty("value"))) {
        showRow = false;
      }
      return {
        strokeWeight: 0.5,
        strokeColor: "#fff",
        fillColor: colors[_getColor(feature.getProperty('value'))],
        fillOpacity: 0.5,
        visible: showRow
      };
    };
    _styleFeature = function(feature) {
      var outlineWeight, showRow, strokeColor, zIndex;
      showRow = true;
      if ((feature.getProperty("value") == null) || isNaN(feature.getProperty("value"))) {
        showRow = false;
      }
      outlineWeight = 0.5;
      zIndex = 1;
      if (feature.getProperty("state") === "hover") {
        outlineWeight = 1.5;
        zIndex = 2;
      }
      if (feature.getProperty('state') === "active") {
        outlineWeight = 1.5;
        zIndex = 2;
        strokeColor = "#000";
      }
      return {
        strokeWeight: outlineWeight,
        strokeColor: "#fff",
        zIndex: zIndex,
        fillColor: colors[_getColor(feature.getProperty('value'))],
        fillOpacity: 0.9,
        visible: showRow
      };
    };
    _getColor = function(value) {
      var color;
      color = d3.scale.quantile().domain(accidents_in_2012).range(d3.range(8))(value);
      return parseInt(color);
    };
    _getRange = function() {
      return d3.scale.quantile().domain(accidents_in_2012).range(d3.range(8)).quantiles();
    };
    generateScale = function() {
      var i, li, lis, range, _results;
      i = 0;
      range = _getRange();
      lis = '';
      _results = [];
      while (i < range.length) {
        li = "<li class='legend-list-item'>\n  <span class='color' style='background-color: " + colors[i] + "'> </span>\n  <span> " + (parseFloat(range[i - 1] || 0.00).toFixed(4)) + " - " + (parseFloat(range[i]).toFixed(4)) + " </span>\n</li>";
        $('.legend-list').append($(li));
        _results.push(i++);
      }
      return _results;
    };
    _loadPieChart = function(state) {
      return nv.addGraph(function() {
        var chart;
        chart = nv.models.pieChart().x(function(d) {
          return d.label;
        }).y(function(d) {
          return parseInt(d.value);
        }).labelType("percent").showLabels(false).valueFormat(d3.format('')).tooltipContent(function(key, y, e, graph) {
          return "<h3>" + key + "</h3> <p>" + y + "</p>";
        });
        d3.select("#detailedSplitChart svg").datum(accidentsSplit[state].values).call(chart);
        nv.utils.windowResize(function() {
          chart.update();
        });
        return chart;
      });
    };
    _loadLineChart = function(state) {
      return nv.addGraph(function() {
        var chart;
        chart = nv.models.lineChart().useInteractiveGuideline(true).transitionDuration(400).showLegend(true).showYAxis(true).showXAxis(true);
        chart.xAxis.axisLabel("Year");
        chart.yAxis.axisLabel("Accidents");
        d3.select("#detailedChart svg").datum(accidentsSplitYear[state].total).call(chart);
        nv.utils.windowResize(function() {
          chart.update();
        });
        return chart;
      });
    };
    return {
      map: function() {
        return map;
      },
      init: function() {
        _init();
        return true;
      }
    };
  })();

  $(KR.init);

}).call(this);
