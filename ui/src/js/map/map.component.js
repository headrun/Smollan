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
                that.startDate = null;
                that.endDate = null;
                that.awaitingResponse = false;
                that.map_chart = null;

                that.refreshChart = function(){

                    var url = 'api/heatmap/',
                        params = {
                            'country': that.selectedCountry || null,
                            'project': that.selectedProject || null,
                            'start_date': that.startDate || null,
                            'end_date': that.endDate || null
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
                                text: 'Attendance percentage'
                            },

                            legend: {
                                title: {
                                    text: 'Attendance percentage',
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
                                    ' {point.name}: <b>{point.value}</b>',
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
                                name: 'Attendance Percentage',
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
                  that.refreshChart();
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
