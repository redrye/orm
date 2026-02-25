// src/Config/DatabaseConfig.ts
const DATABASE_CONFIG = {
    name: 'myDatabase',
    version: 1,
    stores: {
        users: { keyPath: 'id', autoIncrement: true },
        posts: { keyPath: 'id', autoIncrement: true },
    }
};

export default DATABASE_CONFIG;