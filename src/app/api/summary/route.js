import clientPromise from '../../../lib/mongodb';

export async function GET() {
    try {
        // Connect to MongoDB and fetch all user data
        const client = await clientPromise;
        const database = client.db("tabTracker");
        const users = await database.collection("users").find({}).toArray();

        // Format the data for a summary without AI
        const summary = users.map(user => {
            const debts = Object.entries(user.Owes)
                .filter(([_, amount]) => amount > 0) // Only include non-zero debts
                .map(([name, amount]) => `${name} ${amount}`)
                .join(', ');
            
            return `${user.Name} owes: ${debts || 'no one'}`;
        }).join('\n');

        // Return the summary as a JSON response
        return new Response(JSON.stringify({ message: summary }), {
            status: 200
        });
 
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, message: 'Summary failed' }), {
            status: 500
        });
    }
}
