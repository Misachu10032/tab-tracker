// pages/api/borrowFromBank.js
import clientPromise from '../../../lib/mongodb';

export async function POST(req) {
    const { user } = await req.json();
    if (!user) {
        return new Response(JSON.stringify({ message: 'User name is required' }), {
            status: 400,
        });
    }

    try {
        const client = await clientPromise;
        const database = client.db("tabTracker");
        const users = database.collection("users");

        const userDoc = await users.findOne({ Name: user });

        if (!userDoc) {
            return new Response(JSON.stringify({ message: 'User not found.' }), {
                status: 404,
            });
        }

        // Increment the debt to the bank
        await users.updateOne(
            { Name: user },
            { $inc: { 'Owes.bank': 1 } } // Increment the amount owed to the bank
        );

        return new Response(JSON.stringify({ message: `Token borrowed from the bank by ${user}.` }), {
            status: 200
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, message: 'Error borrowing token from bank.' }), {
            status: 500
        });
    }
}
