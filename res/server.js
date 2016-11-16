import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import socketIo from 'socket.io';

import apiIo from '../src';
import Example from './model/Example';

mongoose.connect('mongodb://localhost:27017/test');
mongoose.Promise = global.Promise;

const app = express();
const server = http.Server(app);
const io = socketIo(server);

const api = apiIo(io);

app.use(bodyParser.json());
app.use('/api', api(Example));

export default server.listen(3000);
