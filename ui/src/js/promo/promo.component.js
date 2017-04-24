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
                that.startDate = null;
                that.endDate = null;
                that.awaitingResponse = false;
                that.hideLoading();


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

                    if(!graph.nodes.length){

                      $('#promo-container').html($('#no_data_msg').html());
                    }

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
                                  d.target.name + "\n" + format(d.value)+ "%"; });
                    link.append("data-toogle")
                          .text("tooltip");
                    $('[data-toggle="tooltip"]').tooltip(); 

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
                    'start_date': that.startDate || null,
                    'end_date': that.endDate || null
                  }
                  return q_obj;
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
              $('.date-picker').daterangepicker({
                  format: 'DD/MM/YYYY',
                  "drops": "down",
                  "autoApply": true,
                  autoUpdateInput: false,
              });
              $('.date-picker').on('apply.daterangepicker', function(ev, picker) {
                $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
                $scope.$apply(function(){
                  that.startDate = picker.startDate.format('YYYY-MM-DD');
                  that.endDate = picker.endDate.format('YYYY-MM-DD');
                  that.sankey_draw();
                });
            });

            $('.date-picker').on('cancel.daterangepicker', function(ev, picker) {
                $(this).val('');
            });

             }
           ],
           "bindings": {

             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular, window.BS));
