import clientPromise from '../../../lib/mongodb';

export async function POST(req) {
    const { name } = await req.json();
    if (!name) {
        return new Response(JSON.stringify({ message: 'Name is required' }), {
            status: 400,
        });
    }

    try {
        const client = await clientPromise;
        const database = client.db("tabTracker");
        const users = database.collection("users");

        const existingUser = await users.findOne({ Name: name });
        
        if (existingUser) {
            return new Response(JSON.stringify({ message: `User ${name} already exists.` }), {
                status: 409
            });
        }

        await users.insertOne({
            Name: name,
            Owes: { bank: 1 }  // Set default to owe 1 token to the bank
        });
        
        return new Response(JSON.stringify({ message: `${name} added.` }), {
            status: 201
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message , message: error.message}), {
            status: 500
        });
    }
}
