let mocha = require('mocha');
let chai = require('chai');
let User = require('../models/user');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

var app = require('../app');

describe('Users',() => {
    beforeEach((done) => { //Before each test we empty the users collection
        User.deleteMany({}, (err) => {
            if (err) throw err;

            done();
        });
    });
    describe('User routes', ()=>{
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
            it('Should POST a user with invalid email and return success = false ', (done) => {
                let user = {
                    name: "Tasty Test",
                    email: "testtest.com",
                    username: "madman_tester",
                    password: "qwerty"
                };
                chai.request(app)
                    .post('/users/register')
                    .send(user)
                    .end((err,res)=>{
                        res.body.should.to.be.a('object');
                        res.body.should.have.property('success').to.equal(false);
                        res.body.should.have.property('message').to.equal('Failed to register user');
                        res.body.should.have.property('error');
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
        });
        it('getUserByEmail should return no user because user email not found', (done) => {
            let u = new User({
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            });
            User.addUser(u, ( ) => {
                User.getUserByEmail("notFound@notFound.com",(err, user) =>{
                    chai.expect(err).to.be.a('null');
                    chai.expect(user).to.be.a('null');
                    done();
                })
            });
        });
        it('getUserById should return no user due collection is empty', (done) => {
            User.getUserById("5be5f82d7e52f832526c7530",(err, user) =>{
                chai.expect(err).to.be.a('null');
                chai.expect(user).to.be.a('null');
                done();
            })
        });
        it('getUserById should return user', (done) => {
            let u = new User({
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            });
            User.addUser(u,(err, newUser) =>{
                if(err) throw err;
                User.getUserById(newUser._id,(err, user) =>{
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
        });
        it('getUserById should return no user because user id not found', (done) => {
            let u = new User({
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            });
            User.addUser(u, ( ) => {
                User.getUserById("5be5f82d7e52f832526c7530",(err, user) =>{
                    chai.expect(err).to.be.a('null');
                    chai.expect(user).to.be.a('null');
                    done();
                })
            });
        });
        it('getUserByUsername should return no user due collection is empty', (done) => {
            User.getUserByUsername("madman_tester",(err, user) =>{
                chai.expect(err).to.be.a('null');
                chai.expect(user).to.be.a('null');
                done();
            })
        });
        it('getUserByUsername should return user', (done) => {
            let u = new User({
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            });
            User.addUser(u,(err, newUser) =>{
                if(err) throw err;
                User.getUserByUsername(newUser.username,(err, user) =>{
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
        });
        it('getUserByUsername should return no user because user username not found', (done) => {
            let u = new User({
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            });
            User.addUser(u, ( ) => {
                User.getUserByUsername("AnotherUsername",(err, user) =>{
                    chai.expect(err).to.be.a('null');
                    chai.expect(user).to.be.a('null');
                    done();
                })
            });
        });
        it('addUser should save user to collection', (done) => {
            let user = new User({
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            });
            User.addUser(user, (err, newUser) =>{
                chai.expect(err).to.be.a('null');
                newUser.should.to.be.a('object');
                newUser.should.have.property('_id');
                newUser.should.have.property('name').equal(user.name);
                newUser.should.have.property('username').equal(user.username);
                newUser.should.have.property('email').equal(user.email);
                newUser.should.have.property('createdAt');
                newUser.should.have.property('updatedAt');
                User.getUserById(user._id,(err, fetchedUser)=>{
                    chai.expect(err).to.be.a('null');
                    fetchedUser.should.to.be.a('object');
                    fetchedUser.should.have.property('_id');
                    fetchedUser.should.have.property('name').equal(user.name);
                    fetchedUser.should.have.property('username').equal(user.username);
                    fetchedUser.should.have.property('email').equal(user.email);
                    fetchedUser.should.have.property('createdAt');
                    fetchedUser.should.have.property('updatedAt');
                });
                done();
            });
        });
        it('addUser should not save a user without password', (done) => {
            let user = new User({
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester"
            });
            // For chai to catch the error, functions should be wrapped in another function for context
            chai.expect(() => User.addUser(user,()=>{})).to.throw('Trying to save user. Missing parameters.');
            done();
        });
        it('addUser should not save a user without email', (done) => {
            let user = new User({
                name: "Tasty Test",
                password: "qwerty",
                username: "madman_tester"
            });
            // For chai to catch the error, functions should be wrapped in another function for context
            chai.expect(() => User.addUser(user,()=>{})).to.throw('Trying to save user. Missing parameters.');
            done();
        });
        it('addUser should not save a user without name', (done) => {
            let user = new User({
                paswword: "qwerty",
                email: "test@test.com",
                username: "madman_tester"
            });
            // For chai to catch the error, functions should be wrapped in another function for context
            chai.expect(() => User.addUser(user,()=>{})).to.throw('Trying to save user. Missing parameters.');
            done();
        });
        it('addUser should not save a user without username', (done) => {
            let user = new User({
                name: "Tasty Test",
                email: "test@test.com",
                password: "qwerty"
            });
            // For chai to catch the error, functions should be wrapped in another function for context
            chai.expect(() => User.addUser(user,()=>{})).to.throw('Trying to save user. Missing parameters.');
            done();
        });
        it('comparePassword should compare hashed password to candidate password, CASE: MATCHED', (done) => {
            let user = new User({
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            });
            User.addUser(user, (err,user)=>{
               if (err) throw err;
               User.comparePassword('qwerty',user.password,(err,isMatch)=>{
                   chai.expect(isMatch).to.equal(true);
                   done();
               });
            });
        });
        it('comparePassword should compare hashed password to candidate password, CASE: DIFFERENT', (done) => {
            let user = new User({
                name: "Tasty Test",
                email: "test@test.com",
                username: "madman_tester",
                password: "qwerty"
            });
            User.addUser(user, (err,user)=>{
                if (err) throw err;
                User.comparePassword('',user.password,(err,isMatch)=>{
                    chai.expect(isMatch).to.equal(false);
                    done();
                });
            });
        });
        it('validateEmail should validate email, CASE: Valid', (done) => {
            chai.expect(User.validateEmail('valid_32123123@test.com.ar')).to.equal(true);
            chai.expect(User.validateEmail('valid_321-23123@test.edu')).to.equal(true);
            done();
        });
        it('validateEmail should validate email, CASE: Invalid', (done) => {
            chai.expect(User.validateEmail('testtest.com')).to.equal(false);
            chai.expect(User.validateEmail('tes$t@test.com')).to.equal(false);
            chai.expect(User.validateEmail('tes*t@test.com')).to.equal(false);
            chai.expect(User.validateEmail('tes%t@test.com')).to.equal(false);
            chai.expect(User.validateEmail('testtestcom')).to.equal(false);
            chai.expect(User.validateEmail('testtest')).to.equal(false);
            chai.expect(User.validateEmail('')).to.equal(false);
            let lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi gravida nec mauris eu vestibulum. Mauris sollicitudin sem id vehicula blandit. Nam malesuada id odio sed consectetur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in odio nisl. Maecenas nibh tellus, sagittis vel auctor at, egestas a urna. Nulla nec tincidunt mi. Integer volutpat quam nulla, eget volutpat metus volutpat a. Mauris viverra, quam vitae congue scelerisque, massa metus interdum quam, fermentum luctus diam ligula efficitur sem. Etiam nibh libero, accumsan vel neque at, luctus lacinia odio. Quisque quis sodales felis, ac sollicitudin ipsum. Aenean rutrum elit vel imperdiet laoreet. Aliquam suscipit neque maximus risus tincidunt varius in sed elit.";
            chai.expect(User.validateEmail(lorem)).to.equal(false);
            done();
        });
    });
});

