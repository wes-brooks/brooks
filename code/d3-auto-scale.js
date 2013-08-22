var width = $('#pov-pex-1970')[0].scrollWidth,
    height = 300;

var projection = d3.geo.albers()
    .center([0, 46.2])
    .parallels([42, 50])
    .rotate([90,0])
    .scale(5000)
    .translate([width / 2, height / 2]);

var color = d3.scale.quantize()
  .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

var svg = d3.select("#pov-pex-1970").append("svg")
    .attr("class", "img-responsive");

matchPolygons = function (geo, locs) {
    var indx = [];
    for(var i=0; i<geo.length; i++) {
        var found = false;
        for(var j=0; j<locs.length; j++) {
            if(pip(locs[j], geo[i].geometry.coordinates[0])) {
                indx.push(j)
                found=true;
                break;
            }
        }
        if(!found) { indx.push(NaN); }
    }
    return indx;
};

var topology, centroids, coefs, lookup;
queue()
    .defer(d3.csv, "//somesquares.org/static/csv/poverty/coefs-1970.csv")
    .defer(d3.csv, "//somesquares.org/static/csv/poverty/centroids.csv")
    .defer(d3.json, "//somesquares.org/static/json/co55_d00.json")
    .await(ready);

var out = [];
var features;
function ready(error, coefficients, cents, topo) {
  coefs=coefficients;
  centroids=cents;
  topology=topo;
  features = topojson.feature(topology, topology.objects.co55_d00).features;
  lookup = matchPolygons(features, centroids);
  
  
  var xy = features.map(function(x) {return x.geometry.coordinates[0]})

    var xx = xy.map(function(c) {return c.map(function(d) {return d[0]})})
    var xmin = Math.min.apply(Math, xx.map(function(x) {return Math.min.apply(Math, x)}))
    var xmax = Math.max.apply(Math, xx.map(function(x) {return Math.max.apply(Math, x)}))

    var yy = xy.map(function(c) {return c.map(function(d) {return d[1]})})
    var ymin = Math.min.apply(Math, yy.map(function(y) {return Math.min.apply(Math, y)}))
    var ymax = Math.max.apply(Math, yy.map(function(y) {return Math.max.apply(Math, y)}))

    var topright = projection([xmax, ymax])
    var bottomleft = projection([xmin, ymin])

    var xrange = topright[0] - bottomleft[0]
    var yrange = bottomleft[1] - topright[1]

    var width = $('#pov-pex-1970')[0].scrollWidth
    var sx = d3.scale.linear()
    sx.domain([bottomleft[0], topright[0]])
    sx.range([0,width])


    var sy = d3.scale.linear()
    sy.domain([topright[1], bottomleft[1]])
    sy.range([0,yrange*width/xrange])

    var scale = function(a) { return [sx(a[0]), sy(a[1])] }
    
    var proj = function(x) {return scale(projection(x))}

    var path = d3.geo.path().projection(proj);
  
  svg.attr("height", yrange*width/xrange + 15).attr('width',width)
  
  for(var i=0; i<lookup.length; i++) {
    if(!isNaN(lookup[i])) {
      out.push(parseFloat(coefs[lookup[i]]['pex']));
      features[i].out = parseFloat(coefs[lookup[i]]['pex']);
    }
    else {
      out.push(NaN);
      features[i].out = NaN;
    }
  }

  color.domain([
    d3.min(out), 
    d3.max(out)
  ]);

  svg.selectAll("path")
      .data(features)
      .enter().append("path")      
      .attr("d", path)
      .style("fill", function(d) {
        var valid = !isNaN(d.out);
        if(valid) { return color(d.out); }
        else { return "#ccc"; }
      });
}

