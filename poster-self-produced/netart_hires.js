// actual size of generated image
var sizeh  = 400;
var sizew = 550;
var sizeImage = sizeh*sizew;

var x = document.getElementById("status");

// settings of nnet:
var networkSize = 12;
var nHidden = 5;
var colorLayers = 4; // r, g, b layers

var title = "your";
var title2 = "title";
var typeLightness = 255;
var typeOpacity = 230;
var typeSizeRange = 350;

// support variables:
var img;
var img2;
var G = new R.Graph(false);

var style = ['NORMAL', 'ITALIC', 'BOLD'];
var typeFace = 'Space Mono';

var initModel = function() {
  "use strict";

  var model = [];
  var i;

  var randomSize = 1;

  // define the model below:
  model.w_in = R.RandMat(networkSize, 3, 0, randomSize); // x, y, and bias

  for (i = 0; i < nHidden; i++) {
    model['w_'+i] = R.RandMat(networkSize, networkSize, 0, randomSize);
  }

  model.w_out = R.RandMat(colorLayers, networkSize, 0, randomSize); // output layer

  return model;
};

var model;

var forwardNetwork = function(G, model, x_, y_) {
  // x_, y_ is a normal javascript float, will be converted to a mat object below
  // G is a graph to amend ops to
  var x = new R.Mat(3, 1); // input
  var i;
  x.set(0, 0, x_);
  x.set(1, 0, y_);
  x.set(2, 0, 1.0); // bias.
  var out;
  out = G.tanh(G.mul(model.w_in, x));
  for (i = 0; i < nHidden; i++) {
    out = G.tanh(G.mul(model['w_'+i], out));
  }
  out = G.sigmoid(G.mul(model.w_out, out));
  return out;
};

function getColorAt(model, x, y) {
  // function that returns a color given coordintes (x, y)
  // (x, y) are scaled to -0.5 -> 0.5 for image recognition later
  // but it can be behond the +/- 0.5 for generation above and beyond
  // recognition limits
  var r, g, b;
  var out = forwardNetwork(G, model, x, y);

  r = out.w[0]*255.0;
  g = out.w[1]*255.0;
  b = out.w[2]*255.0;

  return color(r, g, b);
}

function genImage(img, model) {
  var i, j, m, n;
  img.loadPixels();
  for (i = 0, m=img.width; i < m; i++) {
    for (j = 0, n=img.height; j < n; j++) {
      img.set(i, j, getColorAt(model, i/sizeh-0.5,j/sizew-0.5));
    }
  }
  img.updatePixels();
}

function setup() {

  "use strict";
  var myCanvas;

  myCanvas = createCanvas(sizeh,sizew);

  myCanvas.parent('p5Container');

  var gui = new dat.GUI();
  gui.add(this, 'colorLayers', 1, 6);
  gui.add(this, 'title');
  gui.add(this, 'title2');
  gui.add(this, 'typeFace', [ 'sans-serif' ,'Pathway Gothic One','Space Mono','Eczar','Tenor Sans' ]);
  gui.add(this, 'typeLightness', 1, 255);
  gui.add(this, 'typeOpacity', 1, 255);
  gui.add(this, 'typeSizeRange', 10, 400);
  gui.add(this, "generate");
  gui.add(this, "downloadPoster");
  noLoop();
}

function downloadPoster() {
  save('unique-poster-'+Date()+'.png');
}

function generate() {
  x.style.display = "block";
  setTimeout(function(){   draw(); }, 100);
}

function showGoodbye() {
  x.style.display = "none";
}


function draw() {
  model = initModel();
  img = createImage(sizeh, sizew);
  genImage(img, model);
  image(img, 0, 0);
  textSize(random(30, typeSizeRange));
  fill(typeLightness, typeOpacity);
  noStroke();
  textFont(typeFace);
  text(title, random(1, sizeh-200), random(1, sizew-150));
  translate(random(1, width/4));
  textSize(random(30, typeSizeRange));
  text(title2, random(10, sizeh-30), random(10, sizew-30));
  translate(random(1, width/4));
  showGoodbye();
}
