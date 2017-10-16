/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    app.receivedEvent('deviceready');
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');
    
    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');
    
    console.log('Received Event: ' + id);
  }
};


// window.Tesseract = Tesseract.create({
//     langPath: 'lang/',
//     corePath: 'js/tesseract.core.js',
// })

// window.Tesseract = Tesseract.create({
//     workerPath: 'js/tesseract.worker.js',
//     langPath: 'lang/',
//     corePath: 'js/tesseract.core.js',
// })

// window.Tesseract = Tesseract.create({
//     workerPath: 'https://cdn.rawgit.com/naptha/tesseract.js/1.0.10/dist/worker.js',
//     langPath: 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/3.02/',
//     corePath: 'https://cdn.rawgit.com/naptha/tesseract.js-core/0.1.0/index.js'
// })

var baseUrl= location.protocol + '//' + location.host ;

console.log('baseurl='+baseUrl);
// 
// window.Tesseract = Tesseract.create({
//   workerPath: baseUrl+'/js/tesseract.worker.js',
//   langPath: baseUrl+'/js/',
//   corePath: baseUrl+'/js/tesseract.core.js'
// })



var cropper ;

var pictureSource;   // picture source
var destinationType; // sets the format of returned value 
// Wait for PhoneGap to connect with the device
//
document.addEventListener("deviceready",onDeviceReady,false);
// PhoneGap is ready to be used!
//
function onDeviceReady() {
  pictureSource=navigator.camera.PictureSourceType;
  destinationType=navigator.camera.DestinationType;
}

function onPhotoSuccess(imageURI) {
  
  console.log('imageURI' +imageURI);
  
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  
  var image = new Image(200, 400);   // using optional size for image
  // load an image of intrinsic size 300x227 in CSS pixels
  image.src = imageURI;
  
  image.onload = drawImageActualSize; // draw when image has loaded
  
  function drawImageActualSize() {
    // use the intrinsic size of image in CSS pixels for the canvas element
    console.log('naturalWidth '+this.naturalWidth+' '+this.width);
    console.log('naturalHeight '+this.naturalHeight+' '+this.height);
    
    canvas.width = this.naturalWidth;
    canvas.height = this.naturalHeight;
    
    
    // will draw the image as 300x227 ignoring the custom size of 60x45
    // given in the constructor
    ctx.drawImage(this, 0, 0);
    
    // To use the custom size we'll have to specify the scale parameters 
    // using the element's width and height properties - lets draw one 
    // on top in the corner:
    // ctx.drawImage(this, 0, 0, this.width, this.height);
    
    if(cropper){
      cropper.destroy();
    }
    
    cropper = new Cropper(canvas, {
      modal:true,
      background:true,
      zoomable:false,
      viewMode:2,
      crop: function(e) {
        disableButtons(false);
        // console.log(e.detail.x);
        // console.log(e.detail.y);
        // console.log(e.detail.width);
        // console.log(e.detail.height);
        // console.log(e.detail.rotate);
        // console.log(e.detail.scaleX);
        // console.log(e.detail.scaleY);
      }
    });
  }
}


function getTestImage(){
  disableButtons(true);
  
  onPhotoSuccess('img/test.jpg');
}

function capturePhoto() {
  disableButtons(true);
  
  navigator.camera.getPicture(onPhotoSuccess, onFail, { 
    quality: 100,  
    correctOrientation: true,
    destinationType: Camera.DestinationType.FILE_URI 
  });
}

// A button will call this function
//
function getPhotoFromGallery() {
  disableButtons(true);
  
  // Retrieve image file location from specified source
  navigator.camera.getPicture(onPhotoSuccess, onFail, { 
    quality: 100, 
    correctOrientation: true,
    destinationType: destinationType.FILE_URI,
    sourceType: pictureSource.PHOTOLIBRARY }
  );
}


// Called if something bad happens.
// 
function onFail(message) {
  alert('Failed because: ' + message);
}

function ocr(){
  disableButtons(true);
  
  console.log('ocr '+cropper);
  
  var canvas= cropper.getCroppedCanvas({
    maxWidth: 4096,
    maxHeight: 4096
  });
  
  console.log('canvas width '+canvas.width + ' '+canvas.scrollWidth);
  console.log('canvas height '+canvas.height + ' '+canvas.scrollHeight);
  
  var ocrButton=document.getElementById('ocrButton');
  
  Tesseract.recognize(canvas,{
    lang: 'eng'
  })
  .progress(function(message){
    
    if(message.status==='recognizing text'){
      ocrButton.innerText='OCR '+Math.round(message.progress*100)+'%';
    }else{
      console.log(message.status);
      ocrButton.innerText='OCR 1%';
    }
  } )
  .catch(err => ocrButton.innerText='OCR error')
  .then(function(result){
    console.log(result);
    document.getElementById('plain').innerHTML=result.text;
    
    disableButtons(false);
    
  })
  .finally(resultOrError => ocrButton.innerText='OCR')
}

function disableButtons(disabled){
  document.querySelectorAll('#menu BUTTON').forEach(function (item){
    item.disabled=disabled;
  });
  if(disabled){
    document.getElementById('plain').innerHTML="";
  }
}
