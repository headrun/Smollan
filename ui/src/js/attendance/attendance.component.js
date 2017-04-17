;(function (angular, global) {
  "use strict";

  angular.module("attendance")
         .component("attendance", {
           "templateUrl": global.templateDir + "/attendance.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

             }
           ],
           "bindings": {

           }
         });
}(window.angular, window.BS));
