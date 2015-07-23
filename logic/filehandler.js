var config = require('../config'),
    crypto = require( 'crypto' ),
    mime = require( 'mime-magic' ),
    //DropboxClient = require('dropbox-node').DropboxClient,
    us = require('underscore'),
    fs = require('fs'),
    im = require('imagemagick'),
    AWS = require('aws-sdk'),
    uuid = require('node-uuid');


AWS.config.update(config.system.AMAZON);
var s3 = new AWS.S3();

exports.createS3Policy = function(req, res, callback ) {
  var _date, s3Policy;
  _date = new Date();
  s3Policy = {
    "expiration": "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 1) + "-" + (_date.getDate()) + "T" + (_date.getHours() + 1) + ":" + (_date.getMinutes()) + ":" + (_date.getSeconds()) + "Z",
    "conditions": [
      {"bucket": "coperable-storage" },
      ["starts-with", "$Content-Disposition", ""],
      ["starts-with", "$key", ""],
      {"acl": "public-read" },
      {"success_action_redirect": "http://coperable.net/uploadsuccess" },
      ["content-length-range", 0, 2147483648]
    ]
  };

  var secret = config.system.AMAZON.secretAccessKey;
  var s3PolicyBase64 = new Buffer( JSON.stringify( s3Policy ) ).toString( 'base64' );
  var s3Signature = crypto.createHmac( "sha1", secret ).update( JSON.stringify( s3Policy ) ).digest( "base64" );

  var s3Credentials = {
    policy64: s3PolicyBase64,
    signature: s3Signature,
    key: req.body.doc.title,
    aws_key: config.system.AMAZON.accessKeyId,
    redirect: 'http://coperable.net/uploadsuccess',
    policy: s3Policy
  };

  res.type('application/json');
  res.send(s3Credentials);
};



/// Post files
exports.upload= function(req, res, callback ) {
    
    console.log("[filehandler::upload] File uploaded:");
    var fileUploaded = req.files.files[0];
    var imageName = fileUploaded.name;

    /// If there's an error
    if(!imageName){
      console.error("[filehandler::upload] Error! A file was uploaded with no name.");
      res.redirect("/");
      res.end();
      return;
    } else {
      /**
       * Extension extraction method taken from:
       * http://stackoverflow.com/a/1203361/260389
       */
      var extensionArray = imageName.split("."),
      imageName = uuid.v4();
      if( !( extensionArray.length === 1 || ( extensionArray[0] === "" && extensionArray.length === 2 ) ) ) {
        imageName += "." + extensionArray.pop().toLowerCase();
      }

      var newPath = __dirname + "/../public/uploads/fullsize/" + imageName;
      var thumbPath = __dirname + "/../public/uploads/thumbs/" + imageName;
    }
    fs.rename(fileUploaded.path, newPath, function (err) {
      if(err){
        console.error("[filehandler::upload] Error! An error ocurred while moving the file from [%s] to [%s]: %j",
          fileUploaded.path, newPath, err);
        res.end();
        return;
      }
      try {
        im.identify(['-strip', newPath], function(err, features){
            console.log(err);
            if (err) throw err;
            console.log(features);
            // { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
            im.crop({
                srcPath: newPath,
                dstPath: thumbPath,
                width:   280,
                height:   120
            }, function(err, stdout, stderr){
                console.log(stdout);
                console.log(stderr);
                if (err) {
                    console.error("[filehandler::upload] Error! An error ocurred while cropping the file [%s]: %j", newPath, err);
                }
                var result = {
                    "files": [{
                        "name": imageName,
                        "size": fileUploaded.size,
                        "url": "/static/uploaded/fullsize/"+imageName,
                        "thumbnailUrl": "/static/uploads/thumbs/"+imageName,
                        "deleteUrl": "/static/uploads/fullsize/"+imageName,
                        "deleteType": "DELETE"
                    }]
                };
                console.log("[filehandler::upload] File uploaded to [%s] with thumbnail [%s]", newPath, thumbPath);
                res.send(result);
            });

        });

        } catch(e) {
            console.error("[filehandler::upload] "+e+" Error! An error ocurred while moving the file from [%s] to [%s]: %j",
              fileUploaded.path, newPath, err);
            res.redirect("/");
            res.end();
            return;

        }
   });
};

exports.upload_profile = function(req, res, callback ) {
    
    console.log("[filehandler::upload] File uploaded:");
    var fileUploaded = req.files.files[0];
    var imageName = fileUploaded.name;

    /// If there's an error
    if(!imageName){
      console.error("[filehandler::upload] Error! A file was uploaded with no name.");
      res.redirect("/");
      res.end();
      return;
    } else {
      /**
       * Extension extraction method taken from:
       * http://stackoverflow.com/a/1203361/260389
       */
      var extensionArray = imageName.split("."),
      imageName = uuid.v4();
      if( !( extensionArray.length === 1 || ( extensionArray[0] === "" && extensionArray.length === 2 ) ) ) {
        imageName += "." + extensionArray.pop().toLowerCase();
      }

      var newPath = __dirname + "/../public/uploads/fullsize/" + imageName;
      var thumbPath = __dirname + "/../public/uploads/thumbs/" + imageName;
    }
    fs.rename(fileUploaded.path, newPath, function (err) {
      if(err){
        console.error("[filehandler::upload] Error! An error ocurred while moving the file from [%s] to [%s]: %j",
          fileUploaded.path, newPath, err);
        res.redirect("/");
        res.end();
        return;
      }
      im.crop({
          srcPath: newPath,
          dstPath: thumbPath,
          width:   280,
          height:   120,
          gravity: 'Center'
      }, function(err, stdout, stderr){
        if (err) {
          console.error("[filehandler::upload] Error! An error ocurred while cropping the file [%s]: %j",
            newPath, err);
        }
        var result = {
          "files": [{
              "name": imageName,
              "size": fileUploaded.size,
              "url": "/static/uploaded/fullsize/"+imageName,
              "thumbnailUrl": "/static/uploads/thumbs/"+imageName,
              "deleteUrl": "/static/uploads/fullsize/"+imageName,
              "deleteType": "DELETE"
          }]
        };
        console.log("[filehandler::upload] File uploaded to [%s] with thumbnail [%s]", newPath, thumbPath);
        res.send(result);
      });
   });
};

