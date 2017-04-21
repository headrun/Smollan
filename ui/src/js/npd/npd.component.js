;(function (angular, global) {
  "use strict";

  angular.module("npd")
         .component("npd", {
           "templateUrl": global.templateDir + "/npd.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

                $('#npd_table tfoot td').each( function () {
                    var title = $(this).text();
                    $(this).html( '<input type="text"  style="width:100%" placeholder="Search '+title+'" />' );
                } );               

               var npd_table = $('#npd_table').DataTable( {
                    "ajax":{
                      url: "/api/npd/",
                      "dataSrc": function(json){
                        $.each(json.result, function(ind,entry){
                          entry['slno'] = ind+1;
                        });
                        return json.result;
                      }
                    }, 
                    "columns": [
                        { "data": "slno" },
                        { "data": "countrycode" },
                        { "data": "project" },
                        { "data": "moc" },
                        { "data": "npd_target" },
                        { "data": "npd_available" },
                        { "data": "npd_percent" }                  
                    ]
                } );



                npd_table.columns().every( function () {
                    var that = this;
             
                    $( 'input', this.footer() ).on( 'keyup change', function () {
                        if ( that.search() !== this.value ) {
                            that
                                .search( this.value )
                                .draw();
                        }
                    } );
                } );
              //Datatable end
              that.hideLoading();

             }
           ],
           "bindings": {

             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular, window.BS));
