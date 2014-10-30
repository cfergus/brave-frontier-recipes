var item_data = [];
var raw_item_data = {};

var i = 0,
    duration = 750,
    root;

var tree;

imgprefix="http://3.cdn.bravefrontier.gumi.sg/content/item/";

d3.json('/data/items.json', function( error, raw_item_data_json ) {

  if(error) return console.warn(error);

  // Hack. We add karma as an item in the list
  // raw_item_data_json[-1] = {
  //   "desc": "Karma",
  //   "name": "Karma",
  //   "id": -1
  // }

  raw_item_data = raw_item_data_json

  // A transform to make karma references consistent with other items
  // This expands the amount of data by O(n), but I just don't care
  // This is your RAM in your browser, and I have no emotional attachment to it
  karma_objects = [];
  for( i in raw_item_data ) {
    item = raw_item_data[i];
    if( item.recipe && item.recipe.karma ) {
      karma_count = item.recipe.karma;
      if( karma_count !== "0" ) {

        // create a distinct karma object
        karma_object = create_karma_object();
        karma_objects.push( karma_object );

        // create a reference to the new karma object
        karma_material_reference = {
          'count': parseInt( karma_count ),
          'id': karma_object['id']
        }
        item.recipe.materials.push( karma_material_reference );
      }
    }
  }
  for( k in karma_objects ) {
    k_o = karma_objects[k];
    raw_item_data[ k_o['id'] ] = k_o;
  }

  item_data = convert_item_data_to_array_format( raw_item_data );

  initialize_typeahead( item_data );

  initialize_tree( item_data )
});

var karma_index = 0;
function create_karma_object() {
  return {
    "desc": "Karma",
    "name": "Karma",
    "id": 'karma-' + karma_index++
  }
}

/* Example datum
 *
 {
    "desc": "Slightly replenishes one ally's HP.",
    "effect": {
        "effect": [
            {
                "heal high": 500,
                "heal low": 500,
                "rec added% (heal)": 110.0
            }
        ],
        "target_area": "single",
        "target_type": "party"
    },
    "id": 20000,
    "max equipped": 10,
    "max_stack": 99,
    "name": "Cure",
    "rarity": 3,
    "recipe": {
        "karma": "0",
        "materials": [
            {
                "count": 1,
                "id": 10000
            },
            {
                "count": 1,
                "id": 10300
            }
        ]
    },
    "sell_price": 30,
    "thumbnail": "item_thum_20000.png",
    "type": "consumable"
  }

 */
