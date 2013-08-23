var width = $('#pov-pex-1970')[0].scrollWidth,
    height = 300;

var projection = d3.geo.albers()
    .center([0, 46.2])
    .parallels([42, 50])
    .rotate([90,0])
    .scale(5000)
    .translate([width / 2, height / 2]);

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

var topology, centroids, coefs, lookup, color, max, min;
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
    sx.range([5,width-15])


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

 
 svg.style("background-color", "rgb(240, 240, 240)");

    var pos = out.filter(function(x) {return x>0}).sort(d3.ascending)
    var neg = out.filter(function(x) {return x<0}).sort(d3.ascending)



  min = d3.min(out)
  max = d3.max(out)
  
  //Color scale:
  var rpos = d3.scale.linear().domain([0,max]).range([255,230])
  var gpos = d3.scale.linear().domain([0,max]).range([255,97])
  var bpos = d3.scale.linear().domain([0,max]).range([255,1])
  var colpos = function(x) { return 'rgb(' + String(d3.round(rpos(x))) + ',' + String(d3.round(gpos(x))) + ',' + String(d3.round(bpos(x))) + ')' }
  
  var rneg = d3.scale.linear().domain([0,min]).range([255,94])
  var gneg = d3.scale.linear().domain([0,min]).range([255,60])
  var bneg = d3.scale.linear().domain([0,min]).range([255,153])
  var colneg = function(x) { return 'rgb(' + String(d3.round(rneg(x))) + ',' + String(d3.round(gneg(x))) + ',' + String(d3.round(bneg(x))) + ')' }
  
  var color = function(x) { if (x<=0) {return colneg(x)} else {return colpos(x)} }

  svg.selectAll("path")
      .data(features)
      .enter().append("path")      
      .attr("d", path)
      .style("fill", function(d) {
        var valid = !isNaN(d.out);
        if(valid) { return color(d.out); }
        else { return "#ccc"; }
      })
      .style('stroke', 'rgb(220,220,220)')
      .style('stroke-width', '0.5px');
      
  var indx = d3.range(5);
  var legend = [min, min/2, 0, max/2, max]
  svg.selectAll("rect")
    .data(legend)
    .enter()
    .append("rect")
    .attr("x",20)
    .attr('y', function(d,i) {return yrange * width/xrange - 15 - 25*i})
    .attr('width',24)
    .attr('height',24)
    .attr('fill', function(d,i) {return color(d)});
    
  var tags = [String(d3.round(min,1)),
    "",
    "0",
    "",
    String(d3.round(max,1))];
    
  svg.selectAll("text")
    .data(legend)
    .enter()
    .append("text")
    .attr("x",50)
    .attr('y', function(d,i) {return yrange * width/xrange +1 - 25*i})
    .text(function(d,i) {return tags[i]})
    .attr('font-weight','bold');
    
  svg.append('text').attr('x',5).attr('y',yrange * width/xrange - 125).text('Odds Ratio').attr('font-weight','bold');
}
