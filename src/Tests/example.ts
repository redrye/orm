import Database from '../Services/Database';
import User from '../Models/User';

async function example() {
    try {
        await Database.getInstance().connect();
        
        const user = await User.create({
            name: 'John Doe',
            email: 'john@example.com'
        });

        // Find a user by ID
        const foundUser = await User.find<UserData>(user.id!);

        console.log(foundUser);
        // Get all users
        const allUsers = await User.all<UserData>();
        console.log(allUsers);
        // Update a user
        const updatedUser = await User.update<UserData>(user.id!, {
            name: 'Jane Doe'
        });
        console.log(updatedUser);

        // Delete a user
        await User.delete(user.id!);
    } catch (error) {
        console.error('Error:', error);
    }
}

example();