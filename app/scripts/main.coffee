'use strict';

window.KR = do ->
  map = null
  accidents_in_2012 = []
  accidentsSplitYear = []
  accidentsSplit = []
  isLoaded = false
  type = 'per_lakh'
  accidents_in_2012_total = []

  colors = [
    "#ffffcc"
    "#ffeda0"
    "#fed976"
    "#feb24c"
    "#fd8d3c"
    "#fc4e2a"
    "#e31a1c"
    "#b10026"
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
    _gotoViz()

  _hideLoader = ->
    if $('.intro').length is 0
      $('.loader').remove()

  _showLoader = ->
    $('.loader').fadeIn(1000)

  _showContent = ->
    $('.legend').removeClass('hide').addClass('fadeInUpBig')
    $('.details').removeClass('hide').addClass('fadeInRightBig')
    $('header').removeClass('hide').addClass('fadeInDownBig')

  _gotoViz = ->
    $('#gotoviz').on 'click', (e) ->
      if isLoaded is true
        $('.loader').remove()
      else
        $('.intro').remove()
        $('.inner-loader').removeClass('hide')


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
      isLoaded = true
      _hideLoader()
      _showContent()
      # google.maps.event.trigger(map.data, 'click');
      return

  _clearHighlight = ->
    $('.legend-list li').removeClass('active')

  _handleClickOnState = (event) ->
    map.data.revertStyle()
    map.data.overrideStyle(event.feature, {fillColor: 'red', strokeColor: 'white', strokeWeight: 2})
    _handleMouseOver(event)

  _handleMouseOver = (event) ->
    currentState = event.feature.getProperty('NAME_1')
    accidentsIn2012 = event.feature.getProperty(type)
    range = _getColor(accidentsIn2012)
    _clearHighlight()
    $(".legend-list li:nth-child(#{range})").addClass('active')
    # event.feature.setProperty "state", "hover" if event isnt null
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
        # _handleMouseOver(null)

  _loadAccidents2012Data = ->
    $.ajax
      url: "data/total-accidents-2009-2012.json"
      dataType: "JSON"
      success: (response) ->
        response.data.forEach (item) ->
          state = map.data.getFeatureById($.trim(item[0]) + "")
          state.setProperty "per_lakh", parseFloat(item[8])
          state.setProperty "total", parseFloat(item[4])
          accidents_in_2012.push parseFloat(item[8])
          accidents_in_2012_total.push parseInt(item[4])
          accidentsSplitYear[$.trim(item[0])] = {
            total: [
              {
                key: "Total Accidents"
                values: [
                  {
                    x: "2009"
                    y: parseFloat(item[5])
                  }
                  {
                    x: "2010"
                    y: parseFloat(item[6])
                  }
                  {
                    x: "2011"
                    y: parseFloat(item[7])
                  }
                  {
                    x: "2012"
                    y: parseFloat(item[8])
                  }
                ]
              }
            ]
          }
        generateScale()

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
      d3.select("#detailedSplitChart svg").datum(accidentsSplit[state].values).call chart #Finally, render the chart!
      nv.utils.windowResize ->
        chart.update()
        return
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


  _styleFeature = (feature) ->
    # determine whether to show this shape or not
    showRow = true
    showRow = false  if not feature.getProperty(type)? or isNaN(feature.getProperty(type))
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
    fillColor: colors[_getColor(feature.getProperty(type))]
    fillOpacity: 0.9
    #visible: showRow

  _getColor = (value) ->
    color = d3.scale.quantile().domain(accidents_in_2012).range(d3.range(8))(value)
    parseInt(color)

  _getRange = ->
    d3.scale.quantile().domain(accidents_in_2012).range(d3.range(8)).quantiles()

  getColors: ->
    return colors

  generateScale = ->
    i = 0
    range = _getRange()
    lis = ''
    while i < range.length
      li = """
        <li class='legend-list-item'>
          <span class='color' style='background-color: #{colors[i]}'> </span>
          <span> #{parseFloat(range[i-1] || 0.00).toFixed(4)} - #{parseFloat(range[i]).toFixed(4)} </span>
        </li>
      """
      $('.legend-list').append($(li))
      i++

  init: ->
    _init()
    return true

$(KR.init)
