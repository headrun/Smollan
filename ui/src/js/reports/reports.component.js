;(function (angular, global) {
  "use strict";

  angular.module("reports")
         .component("reports", {
           "templateUrl": global.templateDir + "/reports.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

             }
           ],
           "bindings": {

           }
         });
}(window.angular, window.BS));
