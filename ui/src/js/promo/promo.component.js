;(function (angular, global) {
  "use strict";

  angular.module("promo")
         .component("promo", {
           "templateUrl": global.templateDir + "/promo.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

             }
           ],
           "bindings": {

           }
         });
}(window.angular, window.BS));
