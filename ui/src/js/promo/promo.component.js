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

                that.getData();
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

                    that.getData();
                  });

                }


                this.onProjectChange = function(){

                  that.getData();
                }


                this.onDateChange = function(){

                  that.getData();
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
                  that.getData();
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
