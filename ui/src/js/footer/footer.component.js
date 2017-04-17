;(function (angular, global) {
  "use strict";

  angular.module("footer")
         .component("footer", {
           "templateUrl": global.templateDir + "/footer.html",
           "controller" : ["$rootScope", "$state", "$filter", "$interval",

             function ($rootScope, $state, $filter, $interval) {

               var that = this;

             }
           ],
           "bindings": {
           }
         });
}(window.angular, window.BS));
