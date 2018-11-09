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
            console.log('Se borro todo');
            if (err) throw err;

            done();
        });
    });
    describe('USERS ROUTES', ()=>{
        describe('POST /users/register', () => {
            it('Should POST a user and register it', (done) => {
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
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('success').equal(true);
                        res.body.should.have.property('message').equal('User registered');
                        res.body.should.have.property('user').to.be.a('object');
                        res.body.user.should.have.property('name').equal(user.name);
                        res.body.user.should.have.property('email').equal(user.email);
                        res.body.user.should.have.property('username').equal(user.username);
                        done();
                    });
            });
            it('Should send status 400 because req body missing parameter', (done) => {
                let user = {
                    email: "test@test.com",
                    username: "madman_tester",
                    password: "qwerty"
                };
                chai.request(app)
                    .post('/users/register')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(400);
                        done();
                    });
            });
        });
        describe('POST /users/authenticate',() => {
            it('Should authenticate a user and return a JWT in the response',  (done) => {
                let user = {
                    name: "Tasty Test",
                    email: "test@test.com",
                    username: "madman_tester",
                    password: "qwerty"
                };
                let req = {
                    email: "test@test.com",
                    password: "qwerty"
                };
                chai.request(app)
                    .post('/users/register')
                    .send(user)
                    .then( res =>{
                        if (res.body.success){
                            user._id = res.body.user._id;
                            chai.request(app)
                                .post('/users/authenticate')
                                .send(req)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('success').equal(true);
                                    res.body.should.have.property('user').to.be.a('object');
                                    res.body.user.should.have.property('_id').equal(user._id);
                                    res.body.user.should.have.property('name').equal(user.name);
                                    res.body.user.should.have.property('email').equal(user.email);
                                    res.body.user.should.have.property('username').equal(user.username);
                                    res.body.user.should.not.have.property('password');
                                    res.body.should.have.property('token').to.be.a('string');
                                });
                        }
                        done();
                    })
                    .catch(err => {
                        if (err) throw err;
                    });
            });
            it('Should not find user, soo it should return alert message', (done) => {
                let user = {
                    name: "Tasty Test",
                    email: "test@test.com",
                    username: "madman_tester",
                    password: "qwerty"
                };
                let req = {
                    email: "notFound@notFound.com",
                    password: "qwerty"
                };
                chai.request(app)
                    .post('/users/register')
                    .send(user)
                    .then( res =>{
                        if (res.body.success){
                            user._id = res.body.user._id;
                            chai.request(app)
                                .post('/users/authenticate')
                                .send(req)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('success').equal(false);
                                    res.body.should.have.property('message').equal('User not found');
                                });
                        }
                        done();
                    })
                    .catch(err => {
                        if (err) throw err;
                    });
            });
            it(`Should find user, but password doesn't match soo it should return alert message`, (done) => {
                let user = {
                    name: "Tasty Test",
                    email: "test@test.com",
                    username: "madman_tester",
                    password: "qwerty"
                };
                let req = {
                    email: "test@test.com",
                    password: "NO_MATCH"
                };
                chai.request(app)
                    .post('/users/register')
                    .send(user)
                    .then( res =>{
                        if (res.body.success){
                            user._id = res.body.user._id;
                            chai.request(app)
                                .post('/users/authenticate')
                                .send(req)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('success').equal(false);
                                    res.body.should.have.property('message').equal('Wrong password');
                                });
                        }
                        done();
                    })
                    .catch(err => {
                        if (err) throw err;
                    });
            });
            it('Should not authenticate with missing body parameter and send status 400', (done) => {
                let user = {
                    name: "Tasty Test",
                    email: "test@test.com",
                    username: "madman_tester",
                    password: "qwerty"
                };
                let req = {
                    password: "qwerty"
                };
                chai.request(app)
                    .post('/users/register')
                    .send(user)
                    .then( res =>{
                        if (res.body.success){
                            user._id = res.body.user._id;
                            chai.request(app)
                                .post('/users/authenticate')
                                .send(req)
                                .end((err, res) => {
                                    res.should.have.status(400);
                                });
                        }
                        done();
                    })
                    .catch(err => {
                        if (err) throw err;
                    });
            });
        });
        describe('GET PROTECTED ROUTE /users/profile',()=>{
            it('Should send unauthorized 401',(done)=>{
                chai.request(app)
                    .get('/users/profile')
                    .then( res =>{
                        res.should.have.status(401);
                        done();
                    });
            });
            it('Should return user profile by user email',(done)=>{
                let user = {
                    name: "Tasty Test",
                    email: "test@test.com",
                    username: "madman_tester",
                    password: "qwerty"
                };
                let req = {
                    email: "test@test.com",
                    password: "qwerty"
                };
                chai.request(app)
                    .post('/users/register')
                    .send(user)
                    .then( res =>{
                        if (res.body.success){
                            chai.request(app)
                                .post('/users/authenticate')
                                .send(req)
                                .then(res =>{
                                    if (res.body.success){
                                        let token = res.body.token;
                                        let email = res.body.user.email;
                                        user._id = res.body.user._id;
                                        chai.request(app)
                                            .get('/users/profile')
                                            .set('Authorization',token)
                                            .send({email})
                                            .end((err, res) =>{
                                                res.should.have.status(200);
                                                res.body.should.have.property('success').equal(true);
                                                res.body.should.have.property('user').to.be.a('object');
                                                res.body.user.should.have.property('_id').equal(user._id);
                                                res.body.user.should.have.property('name').equal(user.name);
                                                res.body.user.should.have.property('email').equal(user.email);
                                                res.body.user.should.have.property('username').equal(user.username);
                                                res.body.user.should.not.have.property('password');
                                                done();
                                            });
                                    }
                                })
                                .catch(err =>{
                                    if (err) throw err;
                                })
                        }
                    })
                    .catch(err => {
                        if (err) throw err;
                    });
            });
            it('Should return bad request because missing parameter',(done)=>{
                let user = {
                    name: "Tasty Test",
                    email: "test@test.com",
                    username: "madman_tester",
                    password: "qwerty"
                };
                let req = {
                    email: "test@test.com",
                    password: "qwerty"
                };
                chai.request(app)
                    .post('/users/register')
                    .send(user)
                    .then( res =>{
                        if (res.body.success){
                            chai.request(app)
                                .post('/users/authenticate')
                                .send(req)
                                .then(res =>{
                                    if (res.body.success){
                                        let token = res.body.token;
                                        chai.request(app)
                                            .get('/users/profile')
                                            .set('Authorization',token)
                                            .end((err, res) =>{
                                                res.should.have.status(400);
                                                done();
                                            });
                                    }
                                })
                                .catch(err =>{
                                    if (err) throw err;
                                })
                        }
                    })
                    .catch(err => {
                        if (err) throw err;
                    });
            });
            it('Should NOT return user profile because user not found',(done)=>{
                let user = {
                    name: "Tasty Test",
                    email: "test@test.com",
                    username: "madman_tester",
                    password: "qwerty"
                };
                let req = {
                    email: "test@test.com",
                    password: "qwerty"
                };
                chai.request(app)
                    .post('/users/register')
                    .send(user)
                    .then( res =>{
                        if (res.body.success){
                            chai.request(app)
                                .post('/users/authenticate')
                                .send(req)
                                .then(res =>{
                                    if (res.body.success){
                                        let token = res.body.token;
                                        let email = "notFound@notFound.com";
                                        chai.request(app)
                                            .get('/users/profile')
                                            .set('Authorization',token)
                                            .send({email})
                                            .end((err, res) =>{
                                                res.should.have.status(200);
                                                res.body.should.have.property('success').equal(false);
                                                res.body.should.have.property('message').equal("User not found");
                                                done();
                                            });
                                    }
                                })
                                .catch(err =>{
                                    if (err) throw err;
                                })
                        }
                    })
                    .catch(err => {
                        if (err) throw err;
                    });
            });
        });
    });
    describe('User model functions',()=>{
        it('getUserByEmail should return no user due collection is empty', (done) => {
            User.getUserByEmail("test@test.com",(err, user) =>{
                chai.expect(err).to.be.a('null');
                chai.expect(user).to.be.a('null');
                done();
            })
        });
        it('getUserByEmail should return user', (done) => {
            let u = new User({
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            });
            User.addUser(u,(err, newUser) =>{
                if(err) throw err;
                console.log(newUser);
                User.getUserByEmail(newUser.email,(err, user) =>{
                    chai.expect(err).to.be.a('null');
                    user.should.to.be.a('object');
                    user.should.have.property('_id');
                    user.should.have.property('name').equal(u.name);
                    user.should.have.property('username').equal(u.username);
                    user.should.have.property('email').equal(u.email);
                    user.should.have.property('createdAt');
                    user.should.have.property('updatedAt');
                    done();
                });
            });
            // chai.request(app)
            //     .post('/users/register')
            //     .send(u)
            //     .then(res => {
            //         if (res.body.success){
            //             User.getUserByEmail("test@test.com",(err, user) =>{
            //                 chai.expect(err).to.be.a('null');
            //                 user.should.to.be.a('object');
            //                 user.should.have.property('_id');
            //                 user.should.have.property('name').equal(u.name);
            //                 user.should.have.property('username').equal(u.username);
            //                 user.should.have.property('email').equal(u.email);
            //                 user.should.have.property('createdAt');
            //                 user.should.have.property('updatedAt');
            //                 done();
            //             })
            //         }
            //     })
            //     .catch(err => {
            //         if (err) throw err;
            //     });
        });
        it('getUserByEmail should return no user because user email not found', (done) => {
            let u = {
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            };
            chai.request(app)
                .post('/users/register')
                .send(u)
                .then(res => {
                    if (res.body.success){
                        User.getUserByEmail("notFound@notFound.com",(err, user) =>{
                            console.log(err,user);
                            chai.expect(err).to.be.a('null');
                            chai.expect(user).to.be.a('null');
                            done();
                        })
                    }
                })
                .catch(err => {
                    if (err) throw err;
                });
        });
    });
});

