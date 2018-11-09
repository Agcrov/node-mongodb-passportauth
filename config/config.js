const config = {
    dev:{
        port: 8080,
        database: 'mongodb://127.0.0.1:27017/basedb',
        secret: 'mysecret'
    },
    test:{
        port: 8081,
        database: 'mongodb://127.0.0.1:27017/basedbTest',
        secret: 'mysecret'
    },
    prod:{
        port: 4200,
        database: 'mongodb://127.0.0.1:27017/basedb',
        secret: 'mysecret'
    }
};
const env = process.env.NODE_ENV.trim().toString();
module.exports = config[env];