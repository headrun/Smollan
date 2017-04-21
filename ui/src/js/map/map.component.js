;(function (angular, global) {
  "use strict";

  angular.module("map")
         .component("map", {
           "templateUrl": global.templateDir + "/map.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

                $.getJSON('/api/heatmap/', function (data) {


                    data = data.result;
                    // Add lower case codes to the data set for inclusion in the tooltip.pointFormat
                    $.each(data, function () {
                        this.flag = this.code.replace('UK', 'GB').toLowerCase();
                    });

                    // Initiate the chart
                    Highcharts.mapChart('map-container', {

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
           ],
           "bindings": {

             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular, window.BS));
