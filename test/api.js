import chai from 'chai';
import chaiHttp from 'chai-http';

import server from '../res/server';
import Example from '../res/model/Example';

chai.use(chaiHttp);
const should = chai.should();

const example = {
  number: 42,
  string: 'key',
  boolean: true
};


describe('Tests for API Services', () => {
  /**
   * Empty Example Model before each test
   */
  beforeEach((done) => {
    Example.remove((err) => {
      done();
    });
  });

  /**
   * Test GET route
   */
  describe('GET service', () => {
    it('it should get all documents', (done) => {
      chai.request(server)
        .get('/api/example')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);

          done();
        });
    });
  });

  /**
   * Test POST route
   */
  describe('POST service', () => {
    it('it should post and create a new document', (done) => {
      chai.request(server)
        .post('/api/example')
        .send(example)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('number');
          res.body.number.should.be.eql(42);

          done();
        });
    })
  });

  /**
   * Test GET route with id
   */
  describe('GET :id service', () => {
    it('it should get null due to document does not exist', (done) => {
      chai.request(server)
        .get('/api/example/000000000000000000000000')
        .end((err, res) => {
          res.should.have.status(200);
          should.not.exist(res.body);

          done();
        });
    });

    it('it should get an existing document with a valid id', (done) => {
      const instance = new Example(example);

      instance.save((err, document) => {
        chai.request(server)
          .get('/api/example/' + document.id)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('number');
            res.body.should.have.property('string');
            res.body.should.have.property('boolean');
            res.body.should.have.property('_id').eql(document.id);

            done();
          });
      });
    });
  });

  /**
   * Test PUT route
   */
  describe('PUT service', () => {
    it('it should update an existing document', (done) => {
      const instance = new Example(example);
      const change = { boolean: false };

      instance.save((err, document) => {
        chai.request(server)
          .put('/api/example/' + document.id)
          .send(change)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('boolean').eql(false);

            done();
          });
      });
    });
  });

  /**
   * Test DELETE
   */
  describe('DELETE service', () => {
    it('it should delete an existing document', (done) => {
      const instance = new Example(example);

      instance.save((err, document) => {
        chai.request(server)
          .delete('/api/example/' + document.id)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('ok').eql(1);
            res.body.should.have.property('n').eql(1);

            done();
          });
      });
    });
  });

});
