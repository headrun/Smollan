;(function (angular, global) {
  "use strict";

  angular.module("promo")
         .component("promo", {
           "templateUrl": global.templateDir + "/promo.html",
           "controller" : ["$rootScope", "$state", "$http",

             function ($rootScope, $state, $http) {

               var that = this;

              var promo_chart = Highcharts.chart('promo-container', {
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
              });

              function getData(day) {

                var response = null;

                $http({
                  url: "/api/promo", 
                  method: "GET",
                  params: {"day": day}
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
                      promo_chart.addSeries(series_obj);
                      that.hideLoading();
                    }).then(function () {

                      that.awaitingResponse = true;
                  });
              }
              getData();
              //Series end

             }
           ],
           "bindings": {

             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular, window.BS));
