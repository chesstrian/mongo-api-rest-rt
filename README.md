# mongo-api-rest-rt

[![Build Status](https://travis-ci.org/chesstrian/mongo-api-rest-rt.svg?branch=master)](https://travis-ci.org/chesstrian/mongo-api-rest-rt)

API Rest RealTime for Express with MongoDB.

RealTime API notifying changes over a model. 

## Install

```bash
npm install --save mongo-api-rest-rt
```

## Use

This library is intended to be used with Express, Socket.io and Mongoose:

```bash
npm install --save express socket.io mongoose body-parser
```

### Server

```js
import apiIo from 'mongo-api-rest-rt';
import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import socketIo from 'socket.io';

import Model from './model/Model';

mongoose.connect('mongodb://localhost:27017/db');
mongoose.Promise = global.Promise;

const app = express();
const server = http.Server(app);
const io = socketIo(server);

const api = apiIo(io); // Initialize library with socket.io

app.use(bodyParser.json());
app.use('/api', api(Model)); // Setup routes for a model. Routes will start with /api/model
// app.use('/api', api([Model1, Model2])); // An array of models is accepted.

server.listen(3000);

```

### Model
```js
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default mongoose.model('name', new Schema({
  ...
}));

```

### Client

```js
var socket = io.connect();

socket.on('connect', function () {
  // Receive updates
  socket.on('update', function (result) {
    console.log(result.model);
    console.log(result.data);
  });

  // Subscribe to a model
  socket.emit('subscribe', 'model');
});

$('button#unsubscribe').on('click', function () {
  // Stop receiving updates
  socket.emit('unsubscribe', 'model');
});

```

### Custom notifications

Performing updates to MongoDB from other places in your code is highly probable, in those cases use the emitter from the library and emit `notify` event with the Model:

```js
import { emitter } from 'mongo-api-rest-rt';

import Model from '../../model/Model';

const instance = new Model({
  field1: 'value1',
  field2: 'value2',
});

instance.save((err, document) => {
  if (err) return;

  emitter.emit('notify', Model);
});
```

## Test

```bash
npm install babel-cli babel-preset-es2015 babel-register chai chai-http mocha socket.io-client
npm test
```

## Improves

Please feel free to open issues, propose tests and make pull requests for new features, I want to know your thoughts about this library.

## License

MIT
