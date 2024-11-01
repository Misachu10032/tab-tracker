// pages/api/returnTokenToBank.js
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

        // Check if the user owes anything to the bank
        if (userDoc.Owes.bank <= 0) {
            return new Response(JSON.stringify({ message: 'User does not owe anything to the bank.' }), {
                status: 400,
            });
        }

        // Decrement the debt to the bank
        await users.updateOne(
            { Name: user },
            { $inc: { 'Owes.bank': -1 } } // Decrement the amount owed to the bank
        );

        return new Response(JSON.stringify({ message: `1 token returned to the bank by ${user}.` }), {
            status: 200
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, message: 'Error returning token to bank.' }), {
            status: 500
        });
    }
}
