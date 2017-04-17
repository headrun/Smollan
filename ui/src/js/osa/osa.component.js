;(function (angular, global) {
  "use strict";

  angular.module("osa")
         .component("osa", {
           "templateUrl": global.templateDir + "/osa.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

             }
           ],
           "bindings": {

           }
         });
}(window.angular, window.BS));
