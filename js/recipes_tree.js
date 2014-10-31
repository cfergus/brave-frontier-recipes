function children_of_item( item ) {
  children = [];
  if( item.recipe ) {
    materials = item.recipe.materials;
    for( i in materials ) {
      children.push( raw_item_data[ materials[i].id ] );
    }

    // if( item.recipe.karma ) {
    //   children.push( raw_item_data[-1] );
    // }
  }

  return children;
}

function convert_item_data_to_array_format( raw_item_data ) {
  item_data = [];
  for( key in raw_item_data ) {
    item_data.push( raw_item_data[key] );
  }
  return item_data;
}


var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 1200 - margin.right - margin.left,
    height = 500 - margin.top - margin.bottom;

function initialize_tree( ) {

  var svg = d3.select('#graph-content')
      .append('svg')
      .attr('id', 'svg-1')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom);

  var draw_space = svg.append('g')
      .attr('id', 'primary-drawing-space')
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // Tree

  tree = d3.layout.tree()
      .size([height,width])
      .children( children_of_item );

  // root = raw_item_data['20000']; // Cure - 2 level
  root = raw_item_data['41700']; // Wyvern Studs - 6 level

  update_tree_diagram( root );
}

// shorthand for svg translate function
function tr( x, y ) {
  return "translate(" + x + "," + y + ")"
}


// http://bl.ocks.org/d3noob/8375092
function update_tree_diagram(source) {

  source.x0 = height / 2;
  source.y0 = 0;

  var svg = d3.select('#primary-drawing-space')

  var diagonal = d3.svg.diagonal()
     .projection(function(d) { return [d.y, d.x]; });

  // Compute the new tree layout.
  var nodes = tree.nodes(source).reverse(),
     links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id; });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
          return tr(source.y0, source.x0); })
      .on("click", node_click);;

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", "#fff");

  nodeEnter.append("image")
      .attr('xlink:href', function(d) {
          if( d.name === 'Karma' ) {
            return '/img/Karma_drop.gif';
          } else {
            return imgprefix + d.thumbnail;
          }
        } )
      .attr('x', -16)
      .attr('y', -16)
      .attr('width',  32)
      .attr('height', 32);

  nodeEnter.append("text")
      .attr("x", function(d) {
          return d.children || d._children ? -13 : 13; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) { return tr( d.y, d.x ); });

  nodeUpdate.select("circle")
	  .attr("r", 10)
	  .style("fill", "#fff");

  nodeUpdate.select("text")
	  .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
	  .duration(duration)
	  .attr("transform", function(d) { return tr( source.y, source.x); })
	  .remove();

  nodeExit.select("circle")
	   .attr("r", 1e-6);

  nodeExit.select("text")
	   .style("fill-opacity", 1e-6);


  // Declare the links
  var link = svg.selectAll("g.path")
      .data(links, function(d) { return d.target.id; });

  // Enter the links.
  var link_container = link.enter()
      .insert("g", "g")
      .attr("class", "path");
  link_container
      .insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
          });

  // Add label for number of items required by recipe

  link_label = link_container.append("text")
      .attr("class","link-label")
      .attr("x", function(d) {return d.source.y })
      .attr("y", function(d) {return d.source.x })
      .attr("dy", "0.3em")
      .attr("opacity", 1e-6 )
      .text(function(d) {
        // TODO : Can we assign data to links in tree object instead?
        materials_array = d.source.recipe.materials.filter( function(m) { return m.id === d.target.id } );
        if( materials_array.length === 1 ) {
          return materials_array[0].count;
        }
      });


  // Transition links to their new position.
  link.transition()
      .select("path.link")
      .duration(duration)
      .attr("d", diagonal);
  link.transition()
      .select("text.link-label")
      .duration(duration)
      .attr("x", function(d) {return (d.source.y + d.target.y) / 2; })
      .attr("y", function(d) {return (d.source.x + d.target.x) / 2; })
      .attr("opacity", 1);

  // link_label.transition()
  //     .duration(duration)
  //     .attr("opacity", 0.8 );

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .select("path.link")
  	  .duration(duration)
  	  .attr("d", function(d) {
    		var o = {x: source.x, y: source.y};
    		return diagonal({source: o, target: o});
  	  })
  	  .remove();
  link.exit().transition()
      .select("text.link-label")
      .duration(duration)
      .attr("opacity", 1e-6)
      .remove();
  link.exit().transition().remove();


  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}


// Show data in another view when a node is clicked
function node_click(d) {
  d3.select('#item-field-name')
    .html( d.name );
  d3.select('#item-field-description')
    .html( d.desc );
  d3.select('#item-field-rarity')
    .html( d.rarity );

  // Sell price stuff
  sell_graphic_width = 10;
  sell_graphic_height = 50;
  sell = d3.select('#item-field-sell-price');
  sell
    .html( d.sell_price );
  // sell_graphic = sell
  //   .append('svg')
  //     .attr("width", sell_graphic_width)
  //     .attr("height", 50)
  //   .append('g');
  //
  // // TODO : Compute this once during dataset initialization
  // sell_price_range = [
  //   d3.min( item_data, function(d) { return d.sell_price } ),
  //   d3.max( item_data, function(d) { return d.sell_price } )
  // ]
  //
  // sell_graphic.append("rect")
  //   .attr("height", sell_graphic_height)
  //   .attr("width", sell_graphic_width)
  //   .classed("sell-price-max", true);
  // height = ( d.sell_price / sell_price_range[1] ) * sell_graphic_height;
  // sell_graphic.append("rect")
  //   .attr("height", height )
  //   .attr("width", sell_graphic_width)
  //   .attr("y", sell_graphic_height - height)
  //   .classed("sell-price", true);
}
