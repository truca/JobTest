#Job Interview

App and Server for Job Interview

##Requirements

Aside from node and npm/yarn, you will need

- XDE (Expo Development Enviroment)
- ngrok (to use the server locally)
- Expo App in a phone

##Instructions

###Server

````
cd server
yarn
yarn start
````

in other terminal:

````
ngrok http 5050
````

that will give you two forwarding URL's, copy the http one in the file (instead of "http://1906b75d.ngrok.io/")

````
app/constants/Server
````

###App

````
cd ../app
yarn
````

Now that you changed the Server URL, Open the app folder with XDE, wait and use share to open with the Expo app of the phone (or open it in an emulator)