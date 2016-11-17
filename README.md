# GrüvReceiver
ChromeCast Receiver for GrüvCast App

Steps to set up:  

1. Pull from github  
2. Change directories to public  
3. run cmd 'npm install'  
4. check gulp works by running 'gulp'  
  * default gulp task compiles and pushes to firebase
      * other tasks:
      * 'gulp compile' to only compile
      * 'gulp deploy' to only push to firebase
      
5. check dev server works by running 'npm run dev'  
  * runs a local server for easy web dev instead of having to constant push to firebase. But you need to push to firebase to update chromecast.
  * will automatically open browser tab with address localhost:8080
  * can update address used by editting gulpfile.js

