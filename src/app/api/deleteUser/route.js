// pages/api/deleteUser.js
import clientPromise from '../../../lib/mongodb';

export async function DELETE(req) {
    const { user } = await req.json();

    if (!user) {
        return new Response(JSON.stringify({ message: 'User name is required' }), {
            status: 400,
        });
    }

    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const database = client.db("tabTracker");
        const users = database.collection("users");

        // Attempt to delete the user
        const result = await users.deleteOne({ Name: user });

        if (result.deletedCount === 0) {
            // No user found to delete
            return new Response(JSON.stringify({ message: 'User not found.' }), {
                status: 404,
            });
        }

        // Successful deletion
        return new Response(JSON.stringify({ message: `User ${user} deleted.` }), {
            status: 200,
        });
    } catch (error) {
        // Error during deletion
        console.error("Error deleting user:", error);
        return new Response(JSON.stringify({ message: 'Failed to delete user.', error: error.message }), {
            status: 500,
        });
    }
}
