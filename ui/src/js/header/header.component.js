;(function (angular, global) {
  "use strict";

  angular.module("header")
         .component("header", {
           "templateUrl": global.templateDir + "/header.html",
           "controller" : ["$rootScope", "$state", "$filter", "$interval",

             function ($rootScope, $state, $filter, $interval) {

               var that = this;

               this.collapsed = false;
               $('.dropdown-toggle').dropdown();

               this.toggleCollapse = function () {

                 this.collapsed = !this.collapsed;
               }
             }
           ],
           "bindings": {

             "tabsOrder": "<",
             "tabs"     : "<",
             "activeTab": "<"
           }
         });
}(window.angular, window.BS));
