;(function (angular, global) {
  "use strict";

  angular.module("map")
         .component("map", {
           "templateUrl": global.templateDir + "/map.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

             }
           ],
           "bindings": {

           }
         });
}(window.angular, window.BS));
