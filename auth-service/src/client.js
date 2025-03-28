const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.resolve(__dirname, '../../protos/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;



const client = new userProto.UserService(
    `0.0.0.0:5002`,
    grpc.credentials.createInsecure()
);


const newUser = {
    authId: 'auth123',
    firstName: 'John',
    lastName: 'Doe',
    userName: 'johndoe',
    phoneNumber: '1234567890',
    email: 'johndoe@example.com',
    address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'Anystate',
        postalCode: '12345',
        country: 'USA',
    },
    status: 'active',
    userType: 'regular',
};

client.CreateUser(newUser, (error, response) => {
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('User created:', response);
    }
});


// const userRequest = { authId: 'auth123' };

// client.GetUser(userRequest, (error, response) => {
//     if (error) {
//         console.error('Error:', error.message);
//     } else {
//         console.log('User details:', response);
//     }
// });
