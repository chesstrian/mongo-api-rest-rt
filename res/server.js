import bodyParser from 'body-parser';
import Express from 'express';
import mongoose from 'mongoose';
import { Server } from 'http';
import socketIo from 'socket.io';

import apiIo from '../src';
import Example from './model/Example';

mongoose.connect('mongodb://localhost:27017/test');
mongoose.Promise = global.Promise;

const app = new Express();
const server = new Server(app);
const io = socketIo(server);

const api = apiIo(io);

app.use(bodyParser.json());
app.use('/api', api(Example));

export default server.listen(3000);
