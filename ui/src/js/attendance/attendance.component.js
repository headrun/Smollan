;(function (angular, global) {
  "use strict";

  angular.module("attendance")
         .component("attendance", {
           "templateUrl": global.templateDir + "/attendance.html",
           "controller" : ["$rootScope", "$state", "$http", "$scope",

             function ($rootScope, $state, $http, $scope) {

              var that = this,
                 filter_map = {
                  "South East Asia": "countrycode",
                  "countrycode": "project",
                  "project": "project"
                 };


              that.countries = null;
              that.projects = null;
              that.selectedCountry = null;
              that.selectedProject = null;
              that.dateRange = null;
              that.awaitingResponse = false;


              function get_series_params(chart, e){

                var series_name = chart.series[0].name,
                  country, project;
                if(series_name == 'South East Asia'){
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
                                      that.getData(parms[0], parms[1], chart, true, e.point);
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


              that.getData = function (country, project, chrt, is_drill_down, point) {

                var country = country || that.selectedCountry,
                  project = project || that.selectedProject,
                  daterange = that.dateRange || null;
                var response = null;

                $http({
                  url: "/api/attendance", 
                  method: "GET",
                  params: {
                    "country": country,
                    "project": project,
                    "start_date": daterange,
                    "end_date": daterange
                  }
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
                        console.log(att_chart.series);
                        _.each(att_chart.series, function(series){
                          series.remove();
                        });
                        console.log(att_chart.series);
                        att_chart.addSeries(resp.result)
                      }
                      that.hideLoading();
                    }).then(function () {

                      that.awaitingResponse = true;
                    });
              }

              that.getData(that.selectedCountry, that.selectedProject, att_chart, false);

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

                  that.getData(that.selectedCountry, that.selectedProject, att_chart, false);
                });

              }

              this.onProjectChange = function(){

                that.getData(that.selectedCountry, that.selectedProject, att_chart, false);
              }

              this.onDateChange = function(){

                that.getData(that.selectedCountry, that.selectedProject, att_chart, false);
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
                that.getData(that.selectedCountry, that.selectedProject, att_chart, false);
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
