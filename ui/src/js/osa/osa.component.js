;(function (angular, global) {
  "use strict";

  angular.module("osa")
         .component("osa", {
           "templateUrl": global.templateDir + "/osa.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

                $('#osa_table tfoot td').each( function () {
                    var title = $(this).text();
                    $(this).html( '<input type="text"  style="width:100%" placeholder="Search '+title+'" />' );
                } );               

               var osa_table = $('#osa_table').DataTable( {
                    "ajax":{
                      url: "/api/osa/",
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
                        { "data": "osa_target" },
                        { "data": "osa_available" },
                        { "data": "osa_percent" }                  
                    ]
                } );



                osa_table.columns().every( function () {
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
