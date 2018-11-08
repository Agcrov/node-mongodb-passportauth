let mocha = require('mocha');
let chai = require('chai');
let User = require('../models/user');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

var app = require('../app');

describe('Users',() => {
    beforeEach((done) => { //Before each test we empty the users collection
        User.remove({}, (err) => {
            if (err) throw err;
            done();
        });
    });
    describe('/get',() =>{
        it('it should GET all the users', (done) => {
            chai.request(app)
                .get('/users/')
                .set('Content-Type','application/json')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('success');
                    res.body.should.have.property('message');
                    // res.body.should.be.a('array');
                    // res.body.length.should.be.eql(0);
                    done();
                });
        });
    });
    describe('POST /users/register', () => {
        it('it should POST a user and register it', (done) => {
            let user = {
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            };
            chai.request(app)
                .post('/users/register')
                .send(user)
                .end((err, res) => {
                    // expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success').equal(true);
                    res.body.should.have.property('message').equal('User registered');
                    res.body.should.have.property('user').to.be.a('object');
                    // res.body.errors.pages.should.have.property('kind').eql('required');
                    done();
                });
        });
    });
});

