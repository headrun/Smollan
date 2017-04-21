;(function (angular, global) {
  "use strict";

  angular.module("cca")
         .component("cca", {
           "templateUrl": global.templateDir + "/cca.html",
           "controller" : ["$rootScope", "$state",

             function ($rootScope, $state) {

               var that = this;

                $('#cca_table tfoot td').each( function () {
                    var title = $(this).text();
                    $(this).html( '<input type="text"  style="width:100%" placeholder="Search '+title+'" />' );
                } );               

               var cca_table = $('#cca_table').DataTable( {
                    "ajax":{
                      url: "/api/cca/",
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
                        { "data": "cca_target" },
                        { "data": "cca_available" },
                        { "data": "cca_percent" }                  
                    ]
                } );



                cca_table.columns().every( function () {
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
