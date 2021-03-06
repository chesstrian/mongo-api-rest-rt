import EventEmitter from 'events';
import { Router } from 'express';
import util from 'util';

import logger from './logger';


export const emitter = new EventEmitter();

export default (io) => {

  emitter.on('notify', (Model) => {
    Model.find((err, documents) => {
      if (err) return;

      io.to(Model.modelName).emit('notify', { model: Model.modelName, data: documents });
    });
  });

  io.on('connection', (socket) => {
    socket.on('subscribe', (modelName) => {
      logger('Client subscribed to %s.', modelName);
      socket.join(modelName);
    });

    socket.on('unsubscribe', (modelName) => {
      logger('Client unsubscribed from %s.', modelName);
      socket.leave(modelName);
    });
  });

  return (Models) => {

    let api = Router({ caseSensitive: true });

    if (!(Models instanceof Array)) Models = [Models];

    Models.forEach((Model) => {
      api.route(util.format('/%s', Model.modelName))
        .get((req, res) => {
          Model.find(function (err, results) {
            if (err) return res.send(err);

            return res.json(results);
          });
        })
        .post((req, res) => {
          const instance = new Model(req.body);

          instance.save((err, result) => {
            if (err) return res.send(err);

            logger('New document saved on model %s.', Model.modelName);
            emitter.emit('notify', Model);
            return res.json(result);
          });
        })
      ;

      api.route(util.format('/%s/:id', Model.modelName))
        .get((req, res) => {
          Model.findById(req.params.id, (err, result) => {
            if (err) return res.send(err);

            return res.json(result);
          })
        })
        .put((req, res) => {
          Model.findById(req.params.id, (err, document) => {
            if (err) return res.send(err);

            Object.assign(document, req.body).save((err, result) => {
              if(err) return res.send(err);

              logger('Document updated on model %s.', Model.modelName);
              emitter.emit('notify', Model);
              return res.json(result);
            });
          })
        })
        .delete((req, res) => {
          Model.remove({_id: req.params.id}, (err, result) => {
            if (err) return res.send(err);

            logger('Document deleted on model %s.', Model.modelName);
            emitter.emit('notify', Model);
            return res.json(result);
          })
        })
      ;
    });

    return api;
  };
};
