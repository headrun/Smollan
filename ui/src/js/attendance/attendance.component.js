;(function (angular, global) {
  "use strict";

  angular.module("attendance")
         .component("attendance", {
           "templateUrl": global.templateDir + "/attendance.html",
           "controller" : ["$rootScope", "$state", "$http",

             function ($rootScope, $state, $http) {

              var that = this,
                 filter_map = {
                  "all": "countrycode",
                  "countrycode": "project",
                  "project": "project"
                 };

              that.currentState = null;
              that.country = null;
              that.project = null;

              function get_series_params(chart, e){

                var series_name = chart.series[0].name,
                  country, project;
                if(series_name == 'all'){
                  country = 'all';
                  project = 'all';
                }else if(series_name == 'countries'){
                  country = e.point.name;
                  project = null;
                }else if(series_name == 'projects'){
                  country = e.point.name;
                  project = e.point.name;
                }
                return [country, project]
              }
              // Create the chart
              var att_chart = Highcharts.chart('attendance-container', {
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
                      text: 'Attendance Report'
                  },
                  xAxis: {
                      type: 'category'
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

                  drilldown: {
                      series: []
                  }
              });


              function getData(country, project, chrt, is_drill_down, point) {

                country = country || null;
                project = project || null;
                var response = null;

                $http({
                  url: "/api/attendance", 
                  method: "GET",
                  params: {"country": country, "project": project}
                })
                    .then(function (resp) {

                      console.log(resp);
                      resp = resp.data;

                      if (resp.error) {

                        return;
                      }
                      if(is_drill_down){

                        chrt.addSeriesAsDrilldown(point, resp.result);
                      }else{
                        att_chart.addSeries(resp.result)
                      }
                      that.hideLoading();
                    }).then(function () {

                      that.awaitingResponse = true;
                    });
              }
              getData(that.country, that.project, att_chart, false);
              // Highchart end

             }
           ],
           "bindings": {

             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular, window.BS));
