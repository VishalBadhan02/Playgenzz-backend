const UserServiceRegister = () => {
    const createUser = (call, callback) => {
        const user = call.request;
        console.log('User:', user);
        callback(null, { message: 'User created successfully' });
    };
    const getUser = (call, callback) => {
        const user = call.request;
        console.log('User:', user);
        callback(null, { message: 'User details retrieved successfully' });
    };
    return {
        createUser,
        getUser,
    };
}