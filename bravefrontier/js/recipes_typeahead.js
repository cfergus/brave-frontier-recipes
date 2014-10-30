function initialize_typeahead( item_data ) {

  var bloodhound = new Bloodhound( {
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: $.map(item_data, function(item) { return { value: item.name, id: item.id }; })
  });

  bloodhound.initialize();

  $('.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'Items',
    displayKey: 'value',
    source: bloodhound.ttAdapter()
  });
}


$('#typeahead-search').bind('typeahead:selected', function( obj, datum, name ) {
  update_tree_diagram( raw_item_data[datum.id] );
});
