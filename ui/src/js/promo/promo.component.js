;(function (angular, global) {
  "use strict";

  angular.module("promo")
         .component("promo", {
           "templateUrl": global.templateDir + "/promo.html",
           "controller" : ["$rootScope", "$state", "$http", "$scope",

             function ($rootScope, $state, $http, $scope) {

                var that = this;

                that.countries = null;
                that.projects = null;
                that.selectedCountry = null;
                that.selectedProject = null;
                that.dateRange = null;
                that.awaitingResponse = false;
                that.hideLoading();
               /* var promo_chart = Highcharts.chart('promo-container', {
                    chart: {
                        type: 'column',
                        events: {
                            drilldown: function (e) {
                                if (!e.seriesOptions) {

                                    var chart = this,
                                        detail_filter = filter_map[this.series[0].name]+'::'+e.point.name, 
                                        parms = get_series_params(this, e);
                                        getData(parms[0], parms[1], chart, true, e.point);
                                }

                            }
                        }
                    },
                    title: {
                        text: 'Promo Report'
                    },
                    xAxis: {
                        type: 'category',
                        type: 'datetime'
                    },

                    legend: {
                        enabled: false
                    },

                    plotOptions: {
                        series: {
                            borderWidth: 0,
                            dataLabels: {
                                enabled: true
                            }
                        }
                    },

                    series: [],
                });*/



                that.sankey_draw = function(){


                  $('#promo-container').html('');
                  var query_url = "/api/promo/?";
                  query_url += $.param(get_q_obj());

                  var units = "percent";

                  var margin = {top: 10, right: 10, bottom: 10, left: 10},
                      width = 1000 - margin.left - margin.right,
                      height = 590 - margin.top - margin.bottom;

                  var formatNumber = d3.format(",.0f"),    // zero decimal places
                      format = function(d) { return formatNumber(d) + " " + units; },
                      color = d3.scale.category20();

                  // append the svg canvas to the page
                  var svg = d3.select("#promo-container").append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                      .attr("transform", 
                            "translate(" + margin.left + "," + margin.top + ")");

                  // Set the sankey diagram properties
                  var sankey = d3.sankey()
                      .size([width, height]);

                  var path = sankey.link();

                  // load the data
                  d3.json(query_url, function(error, graph) {

                    graph = graph.result;
                    sankey
                        .nodes(graph.nodes)
                        .links(graph.links)
                        .layout(32);

                  // add in the links
                    var link = svg.append("g").selectAll(".link")
                        .data(graph.links)
                      .enter().append("path")
                        .attr("class", "link")
                        .attr("d", path)
                        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
                        .sort(function(a, b) { return b.dy - a.dy; });

                  // add the link titles
                    link.append("title")
                          .text(function(d) {
                          return d.source.name + " → " + 
                                  d.target.name + "\n" + format(d.value); });

                  // add in the nodes
                    var node = svg.append("g").selectAll(".node")
                        .data(graph.nodes)
                      .enter().append("g")
                        .attr("class", "node")
                        .attr("transform", function(d) { 
                        return "translate(" + d.x + "," + d.y + ")"; })
                      .call(d3.behavior.drag()
                        .origin(function(d) { return d; })
                        .on("dragstart", function() { 
                        this.parentNode.appendChild(this); })
                        .on("drag", dragmove));

                  // add the rectangles for the nodes
                    node.append("rect")
                        .attr("height", function(d) { return d.dy; })
                        .attr("width", sankey.nodeWidth())
                        .style("fill", function(d) { 
                        return d.color = color(d.name.replace(/ .*/, "")); })
                        .style("stroke", function(d) { 
                        return d3.rgb(d.color).darker(2); })
                      .append("title")
                        .text(function(d) { 
                        return d.name + "\n" + format(d.value); });

                  // add in the title for the nodes
                    node.append("text")
                        .attr("x", -6)
                        .attr("y", function(d) { return d.dy / 2; })
                        .attr("dy", ".35em")
                        .attr("text-anchor", "end")
                        .attr("transform", null)
                        .text(function(d) { return d.name; })
                      .filter(function(d) { return d.x < width / 2; })
                        .attr("x", 6 + sankey.nodeWidth())
                        .attr("text-anchor", "start");

                  // the function for moving the nodes
                    function dragmove(d) {
                      d3.select(this).attr("transform", 
                          "translate(" + d.x + "," + (
                                  d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                              ) + ")");
                      sankey.relayout();
                      link.attr("d", path);
                    }
                  });
                }












                function get_q_obj() {

                  var q_obj = {

                    'country': that.selectedCountry || null,
                    'project': that.selectedProject || null,
                    'date': that.dateRange || null
                  }
                  return q_obj;
                }





                that.getData = function (day) {

                  var response = null,
                    country = that.selectedCountry || null,
                    project = that.selectedProject || null,
                    start_date = that.dateRange || null,
                    end_date = that.dateRange || null;


                  return $http({
                    url: "/api/promo", 
                    method: "GET",
                    params: {
                      "country": country,
                      "project": project,
                      "start_date": start_date,
                      "end_date": end_date
                    }
                  })
                    .then(function (resp) {

                        console.log(resp);
                        resp = resp.data;

                        if (resp.error) {

                          return;
                        }

                        var series_obj = {
                          name: "Promo",
                          data: resp.result
                        }
                        promo_chart.series[0] && promo_chart.series[0].remove(true);
                        promo_chart.addSeries(series_obj);
                        that.hideLoading();
                      }).then(function () {

                        that.awaitingResponse = true;
                    });
                }

                that.sankey_draw();
                //Series end

                that.getCountriesData = function(){

                  var response = null,
                    country = that.selectedCountry || null;

                  return $http({
                    url: "/api/get_countries", 
                    method: "GET",
                    params: {}
                  })
                    .then(function (resp) {

                        console.log(resp);
                        resp = resp.data;

                        if (resp.error) {

                          return;
                        }

                        that.countries = resp.result;

                      }).then(function () {

                        that.awaitingResponse = true;
                    });

                }


                that.getProjectsData = function(){

                  var response = null,
                    country = that.selectedCountry || null;

                  return $http({
                    url: "/api/get_projects", 
                    method: "GET",
                    params: {country: country}
                  })
                    .then(function (resp) {

                        console.log(resp);
                        resp = resp.data;

                        if (resp.error) {

                          return;
                        }


                        that.projects = resp.result;
                      }).then(function () {

                        that.awaitingResponse = true;
                    });

                }

                that.getCountriesData();
                that.getProjectsData();
                // Filters initialization


                this.onCountryChange = function(){

                  that.selectedProject = null;
                  that.getProjectsData().then(function(){

                    that.sankey_draw();
                  });

                }


                this.onProjectChange = function(){

                  that.sankey_draw();
                }


                this.onDateChange = function(){

                  that.sankey_draw();
                }


                // Widget initializations
                $('.date-picker').datetimepicker({
                    format: 'DD/MM/YYYY',
                    useCurrent: false
                }).on('dp.show', function (e) {
                  var datepicker = $('body').find('.bootstrap-datetimepicker-widget:last'),
                      position = datepicker.offset(),
                      parent = datepicker.parent(),
                      parentPos = parent.offset(),
                      width = datepicker.width(),
                      parentWid = parent.width();

                  // move datepicker to the exact same place it was but attached to body
                  datepicker.appendTo('body');
                  datepicker.css({
                      position: 'absolute',
                      top: position.top,
                      bottom: 'auto',
                      left: position.left,
                      right: 'auto',
                      'z-index': 10
                  });

                  // if datepicker is wider than the thing it is attached to then move it so the centers line up
                  if (parentPos.left + parentWid < position.left + width) {
                      var newLeft = parentPos.left;
                      newLeft += parentWid / 2;
                      newLeft -= width / 2;
                      datepicker.css({left: newLeft});
                  }
              }).on('dp.change', function(date, oldDate){
                $scope.$apply(function(){
                  that.dateRange = date.date.format('DD/MM/YYYY');
                  that.sankey_draw();
                });
              });

             }
           ],
           "bindings": {

             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular, window.BS));
