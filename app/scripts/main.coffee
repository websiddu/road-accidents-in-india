'use strict';

window.KR = do ->
  map = null
  accidents_in_2012 = []
  accidentsSplitYear = []
  accidentsSplit = []

  colors = [
    "#FFE4D9"
    "#fcbba1"
    "#fc9272"
    "#fb6a4a"
    "#ef3b2c"
    "#cb181d"
    "#99000d"
  ]

  featureOptions = [
    {
      elementType: "geometry"
      stylers: [
        {
          visibility: "simplified"
        }
        {
          saturation: -45
        }
        {
          lightness: 13
        }
        {
          gamma: 0.7
        }
        {
          weight: 0.3
        }
        {
          hue: "#0077ff"
        }
      ]
    }
    {
      elementType: "labels"
      stylers: [visibility: "simplified"]
    }
    {
      elementType: "geometry.stroke"
      stylers: [color: "#000000"]
    }
  ]

  _init = ->
    _initMap()

  _hideLoader = ->
    $('.loader').fadeOut(-> $(this).remove())

  _showLoader = ->
    $('.loader').fadeIn(1000)

  _showContent = ->
    $('.legend').removeClass('hide').addClass('fadeInUpBig')
    $('.details').removeClass('hide').addClass('fadeInRightBig')
    $('header').removeClass('hide').addClass('fadeInDownBig')

  _initMap = ->
    map = new google.maps.Map(document.getElementById("map"),
      center: new google.maps.LatLng(23.5674244, 85.7557826)
      zoom: 5
      maxZoom: 9
      minZoom: 3
      mapTypeControlOptions:
        mapTypeIds: [
          google.maps.MapTypeId.ROADMAP
          "custom"
        ]
      mapTypeId: "custom"
      streetViewControl: false
    )

    map.data.loadGeoJson "./data/india.geojson",
      idPropertyName: "NAME_1"

    _initEventListners()

    customMapType = new google.maps.StyledMapType(featureOptions,
      name: "Jass"
    )
    map.mapTypes.set "custom", customMapType
    map.data.setStyle _styleFeature

    google.maps.event.addListenerOnce map.data, "addfeature", ->
      _loadAccidents2012Data()
      _loadSplitData()
      _hideLoader()
      _showContent()
      # google.maps.event.trigger(map.data, 'click');
      return

  _clearHighlight = ->
    $('.legend-list li').removeClass('active')

  _handleClickOnState = (event) ->
    map.data.revertStyle() if event.feature.getProperty "state" is "active"
    event.feature.setProperty "state", "active"
    _handleMouseOver(event)

  _handleMouseOver = (event) ->
    currentState = if event isnt null then event.feature.getProperty('NAME_1') else 'Andhra Pradesh'
    accidentsIn2012 = if event isnt null then event.feature.getProperty('value') else accidents_in_2012[0]
    range = _getRange(accidentsIn2012)
    _clearHighlight()
    $(".legend-list li:nth-child(#{range + 1})").addClass('active')
    event.feature.setProperty "state", "hover" if event isnt null
    $('.state-name').text(currentState)
    $('.accidents_2012').text(accidentsIn2012)
    _loadLineChart(currentState)
    _loadPieChart(currentState)

  _handleClickOutState = (event) ->
    event.feature.setProperty "state", "normal"
    _clearHighlight()

  _initEventListners = ->
    # map.data.addListener "mouseover", _handleMouseOver
    map.data.addListener 'click', _handleClickOnState
    # map.data.addListener 'mouseout', _handleClickOutState

  _loadSplitData = (state) ->
    $.ajax
      url: "data/accident-cause-2012.json"
      dataType: "JSON"
      success: (response) ->
        response.data.forEach (item) ->
          state = map.data.getFeatureById($.trim(item[0]) + "")
          accidentsSplit[$.trim(item[0]) + ""] = {
            key: $.trim(item[0]) + ""
            values: [
              {
                label: "Fault of Driver"
                value: item[1]
              }
              {
                label: "Fault of Cyclist"
                value: item[4]
              }
              {
                label: "Fault of Pedestrian"
                value: item[7]
              }
              {
                label: "Condition of Motor Vehicle"
                value: item[10]
              }
              {
                label: "Defect in Road Condition"
                value: item[13]
              }
              {
                label: "Weather Condition"
                value: item[16]
              }
              {
                label: "Other Causes"
                value: item[19]
              }

            ]
          }
        _handleMouseOver(null)

  _loadAccidents2012Data = ->
    $.ajax
      url: "data/total-accidents-2003-2012.json"
      dataType: "JSON"
      success: (response) ->
        response.data.forEach (item) ->
          state = map.data.getFeatureById($.trim(item[0]) + "")
          state.setProperty "value", parseInt(item[1])
          accidents_in_2012.push item[1]
          accidentsSplitYear[$.trim(item[0])] = {
            total: [
              {
                key: "Total Accidents"
                values: [
                  {
                    x: "2003"
                    y: parseInt(item[1])
                  }
                  {
                    x: "2004"
                    y: parseInt(item[2])
                  }
                  {
                    x: "2005"
                    y: parseInt(item[3])
                  }
                  {
                    x: "2006"
                    y: parseInt(item[4])
                  }
                  {
                    x: "2007"
                    y: parseInt(item[5])
                  }
                  {
                    x: "2008"
                    y: parseInt(item[6])
                  }
                  {
                    x: "2009"
                    y: parseInt(item[7])
                  }
                  {
                    x: "2010"
                    y: parseInt(item[8])
                  }
                  {
                    x: "2011"
                    y: parseInt(item[9])
                  }
                  {
                    x: "2012"
                    y: parseInt(item[10])
                  }
                ]
              }
            ]
          }

  _loadPieChart = (state) ->
    nv.addGraph ->
      chart = nv.models.pieChart()
        .x( (d) -> d.label )
        .y( (d) -> parseInt(d.value) )
        .labelType("percent")
        .showLabels(false)
        .valueFormat(d3.format(''))
        .tooltipContent( (key, y, e, graph) ->
          "<h3>#{key}</h3> <p>#{y}</p>"
        )

      # chart.pie.pieLabelsOutside(false).labelType("percent");

      d3.select("#detailedSplitChart svg").datum(accidentsSplit[state].values).call chart #Finally, render the chart!
      nv.utils.windowResize ->
        chart.update()
        return

      # d3.select(".nv-legendWrap").attr("transform", "translate(100,100)")
      chart


  _loadLineChart = (state) ->
    nv.addGraph ->
      chart = nv.models.lineChart()
        .useInteractiveGuideline(true)
        .transitionDuration(400)
        .showLegend(true)
        .showYAxis(true)
        .showXAxis(true)
      chart.xAxis.axisLabel("Year")
      chart.yAxis.axisLabel("Accidents")
      d3.select("#detailedChart svg").datum(accidentsSplitYear[state].total).call chart #Finally, render the chart!
      nv.utils.windowResize ->
        chart.update()
        return
      chart

  _loadYearlyData = ->


  _getRange = (value) ->
    range = 0
    if value > 0 and value < 500
      range = 0
    else if value > 500 and value < 3000
      range = 1
    else if value > 3000 and value < 6000
      range = 2
    else if value > 6000 and value < 12000
      range = 3
    else if value > 12000 and value < 24000
      range = 4
    else if value > 24000 and value < 48000
      range = 5
    else range = 6  if value > 48000 and value < 70000

    return range

  _styleFeature = (feature) ->
    # determine whether to show this shape or not
    showRow = true
    showRow = false  if not feature.getProperty("value")? or isNaN(feature.getProperty("value"))
    outlineWeight = 0.5
    zIndex = 1
    if feature.getProperty("state") is "hover"
      outlineWeight = 1.5
      zIndex = 2
    if feature.getProperty('state') is "active"
      outlineWeight = 1.5
      zIndex = 2
      strokeColor = "#000"
    strokeWeight: outlineWeight
    strokeColor: "#fff"
    zIndex: zIndex
    fillColor: colors[_getRange(feature.getProperty("value"))]
    fillOpacity: 0.9
    visible: showRow

  init: ->
    _init()
    return true

$(KR.init)
