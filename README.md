# Video Conference App

A video conference app along with messaging functionality for both private and group conversations.

## Features

- End-to-end message
- Peer-to-peer audio/video call
- Creation of custom room
- Group meeting
- Preferred username
- Enable/disable camera
- Mute/unmute audio

## Usage

To use this web app:

- go to [this url](https://video-conference-client.vercel.app/)
- wait untill the socket is initialized
- set username to distinguish from others (optional)
- wait for others to land on the web app or you can open another instance of this app on another tab/window
- now you are able to see other users
- start private communication
- create room/join existing room to meet up in a group call

## Installation

To run locally, do the following.

```bash
  1. $ git clone https://github.com/samiursakib/video-conference.git
  2. $ cd video-conference/server
  3. $ npm run dev
  4. go to client/src/utils/effects.js
  5. comment out existing host and uncomment localhost url
  6. $ cd video-conference/client
  7. $ npm start
```

By now you are ready to go!

## Screenshots

![Imgur](https://i.imgur.com/IN8Plsi.png)
