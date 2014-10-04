(function() {
  'use strict';
  window.KR = (function() {
    var accidentsSplit, accidentsSplitYear, accidents_in_2012, colors, featureOptions, map, _clearHighlight, _getRange, _handleClickOnState, _handleClickOutState, _handleMouseOver, _hideLoader, _init, _initEventListners, _initMap, _loadAccidents2012Data, _loadLineChart, _loadPieChart, _loadSplitData, _loadYearlyData, _showContent, _showLoader, _styleFeature;
    map = null;
    accidents_in_2012 = [];
    accidentsSplitYear = [];
    accidentsSplit = [];
    colors = ["#FFE4D9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"];
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
      return _initMap();
    };
    _hideLoader = function() {
      return $('.loader').fadeOut(function() {
        return $(this).remove();
      });
    };
    _showLoader = function() {
      return $('.loader').fadeIn(1000);
    };
    _showContent = function() {
      $('.legend').removeClass('hide').addClass('fadeInUpBig');
      $('.details').removeClass('hide').addClass('fadeInRightBig');
      return $('header').removeClass('hide').addClass('fadeInDownBig');
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
        _hideLoader();
        _showContent();
      });
    };
    _clearHighlight = function() {
      return $('.legend-list li').removeClass('active');
    };
    _handleClickOnState = function(event) {
      if (event.feature.getProperty("state" === "active")) {
        map.data.revertStyle();
      }
      event.feature.setProperty("state", "active");
      return _handleMouseOver(event);
    };
    _handleMouseOver = function(event) {
      var accidentsIn2012, currentState, range;
      currentState = event !== null ? event.feature.getProperty('NAME_1') : 'Andhra Pradesh';
      accidentsIn2012 = event !== null ? event.feature.getProperty('value') : accidents_in_2012[0];
      range = _getRange(accidentsIn2012);
      _clearHighlight();
      $(".legend-list li:nth-child(" + (range + 1) + ")").addClass('active');
      if (event !== null) {
        event.feature.setProperty("state", "hover");
      }
      $('.state-name').text(currentState);
      $('.accidents_2012').text(accidentsIn2012);
      _loadLineChart(currentState);
      return _loadPieChart(currentState);
    };
    _handleClickOutState = function(event) {
      event.feature.setProperty("state", "normal");
      return _clearHighlight();
    };
    _initEventListners = function() {
      return map.data.addListener('click', _handleClickOnState);
    };
    _loadSplitData = function(state) {
      return $.ajax({
        url: "data/accident-cause-2012.json",
        dataType: "JSON",
        success: function(response) {
          response.data.forEach(function(item) {
            state = map.data.getFeatureById($.trim(item[0]) + "");
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
          });
          return _handleMouseOver(null);
        }
      });
    };
    _loadAccidents2012Data = function() {
      return $.ajax({
        url: "data/total-accidents-2003-2012.json",
        dataType: "JSON",
        success: function(response) {
          return response.data.forEach(function(item) {
            var state;
            state = map.data.getFeatureById($.trim(item[0]) + "");
            state.setProperty("value", parseInt(item[1]));
            accidents_in_2012.push(item[1]);
            return accidentsSplitYear[$.trim(item[0])] = {
              total: [
                {
                  key: "Total Accidents",
                  values: [
                    {
                      x: "2003",
                      y: parseInt(item[1])
                    }, {
                      x: "2004",
                      y: parseInt(item[2])
                    }, {
                      x: "2005",
                      y: parseInt(item[3])
                    }, {
                      x: "2006",
                      y: parseInt(item[4])
                    }, {
                      x: "2007",
                      y: parseInt(item[5])
                    }, {
                      x: "2008",
                      y: parseInt(item[6])
                    }, {
                      x: "2009",
                      y: parseInt(item[7])
                    }, {
                      x: "2010",
                      y: parseInt(item[8])
                    }, {
                      x: "2011",
                      y: parseInt(item[9])
                    }, {
                      x: "2012",
                      y: parseInt(item[10])
                    }
                  ]
                }
              ]
            };
          });
        }
      });
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
    _loadYearlyData = function() {};
    _getRange = function(value) {
      var range;
      range = 0;
      if (value > 0 && value < 500) {
        range = 0;
      } else if (value > 500 && value < 3000) {
        range = 1;
      } else if (value > 3000 && value < 6000) {
        range = 2;
      } else if (value > 6000 && value < 12000) {
        range = 3;
      } else if (value > 12000 && value < 24000) {
        range = 4;
      } else if (value > 24000 && value < 48000) {
        range = 5;
      } else {
        if (value > 48000 && value < 70000) {
          range = 6;
        }
      }
      return range;
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
        fillColor: colors[_getRange(feature.getProperty("value"))],
        fillOpacity: 0.9,
        visible: showRow
      };
    };
    return {
      init: function() {
        _init();
        return true;
      }
    };
  })();

  $(KR.init);

}).call(this);
