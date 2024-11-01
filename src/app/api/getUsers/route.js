// pages/api/getUsers.js
import clientPromise from '../../../lib/mongodb';

export async function GET(req) {
    try {
        const client = await clientPromise;
        const database = client.db("tabTracker");
        const users = database.collection("users");
        
        const userList = await users.find({}).toArray(); // Fetch all users

        const usersWithNames = userList.map(user => user.Name); // Extract user names

        return new Response(JSON.stringify({ users: usersWithNames }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, message: 'Error fetching users.' }), {
            status: 500,
        });
    }
}
