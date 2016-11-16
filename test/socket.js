import chai from 'chai';
import chaiHttp from 'chai-http';
import io from 'socket.io-client';

import server from '../res/server';
import Example from '../res/model/Example';

chai.use(chaiHttp);
chai.should();

const url = 'http://localhost:3000';

const example = {
  number: 42,
  string: 'key',
  boolean: true
};


describe('Tests for RealTime subscriptions', () => {
  /**
   * Empty Example Model before each test
   */
  beforeEach((done) => {
    Example.remove((err) => {
      done();
    });
  });

  /**
   * Test updates after changes
   */
  describe('Subscriptions from updates', () => {
    it('it should receive updates on push', (done) => {
      const client = io.connect(url);

      client.once('connect', () => {
        client.on('update', (res) => {
          res.should.be.a('object');
          res.should.have.property('model');
          res.model.should.be.eql('example');
          res.data.should.be.a('array');
          res.data.length.should.be.eql(1);

          client.disconnect();
          done();
        });

        client.emit('subscribe', 'example');

        chai.request(server)
          .post('/api/example')
          .send(example)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.not.have.property('errors');
          });
      });
    });

    it('it should receive updates on put', (done) => {
      const client = io.connect(url);

      const instance = new Example(example);
      const change = { boolean: false };

      client.once('connect', () => {
        client.on('update', (res) => {
          res.should.be.a('object');
          res.should.have.property('model');
          res.model.should.be.eql('example');
          res.data.should.be.a('array');
          res.data.length.should.be.eql(1);

          client.disconnect();
          done();
        });

        client.emit('subscribe', 'example');

        instance.save((err, document) => {
          chai.request(server)
            .put('/api/example/' + document.id)
            .send(change)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.not.have.property('errors');
            });
        });
      });
    });

    it('it should receive updates on delete', (done) => {
      const client = io.connect(url);

      const instance = new Example(example);

      client.once('connect', () => {
        client.on('update', (res) => {
          res.should.be.a('object');
          res.should.have.property('model');
          res.model.should.be.eql('example');
          res.data.should.be.a('array');
          res.data.length.should.be.eql(0);

          client.disconnect();
          done();
        });

        client.emit('subscribe', 'example');

        instance.save((err, document) => {
          chai.request(server)
            .delete('/api/example/' + document.id)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('ok').eql(1);
              res.body.should.have.property('n').eql(1);
            });
        });
      });
    });
  });

  describe('Unsubscriptions from updates', () => {
    it('it should stopping receiving updates', (done) => {
      const client = io.connect(url);

      client.once('connect', () => {
        client.on('update', (res) => {
          res.should.be.a('object');
          res.should.have.property('model');
          res.model.should.be.eql('example');
          res.data.should.be.a('array');
          res.data.length.should.be.eql(1);
        });

        client.emit('subscribe', 'example');

        chai.request(server)
          .post('/api/example')
          .send(example)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.not.have.property('errors');

            client.emit('unsubscribe', 'example');

            chai.request(server)
              .post('/api/example')
              .send(example)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.not.have.property('errors');

                setTimeout(done, 200);
              });
          });
      });
    });
  });

});
