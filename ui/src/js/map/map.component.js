;(function (angular, global) {
  "use strict";

  angular.module("map")
         .component("map", {
           "templateUrl": global.templateDir + "/map.html",
           "controller" : ["$rootScope", "$state", "$http", "$scope",

             function ($rootScope, $state, $http, $scope) {

               var that = this;


                that.countries = null;
                that.projects = null;
                that.selectedCountry = null;
                that.selectedProject = null;
                that.dateRange = null;
                that.awaitingResponse = false;
                that.map_chart = null;

                that.refreshChart = function(){

                    var url = 'api/heatmap/',
                        params = {
                            'country': that.selectedCountry || null,
                            'project': that.selectedProject || null,
                            'start_date': that.dateRange || null,
                            'end_date': that.dateRange || null
                        }

                    $.getJSON(url, params, function (data) {


                        data = data.result;
                        // Add lower case codes to the data set for inclusion in the tooltip.pointFormat
                        $.each(data, function () {
                            this.flag = this.code.replace('UK', 'GB').toLowerCase();
                        });

                        // Initiate the chart
                        that.map_chart = Highcharts.mapChart('map-container', {

                            title: {
                                text: 'Attendance density'
                            },

                            legend: {
                                title: {
                                    text: 'Attendance density per km²',
                                    style: {
                                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                                    }
                                }
                            },

                            mapNavigation: {
                                enabled: true,
                                buttonOptions: {
                                    verticalAlign: 'bottom'
                                }
                            },

                            tooltip: {
                                backgroundColor: 'none',
                                borderWidth: 0,
                                shadow: false,
                                useHTML: true,
                                padding: 0,
                                pointFormat: '<span class="f32"><span class="flag {point.flag}"></span></span>' +
                                    ' {point.name}: <b>{point.value}</b>/km²',
                                positioner: function () {
                                    return { x: 0, y: 250 };
                                }
                            },

                            colorAxis: {
                                min: 1,
                                max: 1000,
                                type: 'logarithmic'
                            },

                            series: [{
                                data: data,
                                mapData: Highcharts.maps['custom/world'],
                                joinBy: ['iso-a2', 'code'],
                                name: 'Attendance density',
                                states: {
                                    hover: {
                                        color: '#a4edba'
                                    }
                                }
                            }]
                        });
                    });
                    that.hideLoading();

                }


                //Series end
                that.refreshChart();

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

                    that.refreshChart();
                  });

                }


                this.onProjectChange = function(){

                  that.refreshChart();
                }


                this.onDateChange = function(){

                  that.refreshChart();
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
                  that.dateRange = date.date.format('YYYY-MM-DD');
                  that.refreshChart();
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
