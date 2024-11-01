// pages/api/lendToken.js
import clientPromise from '../../../lib/mongodb';

export async function POST(req) {
    const { lender, borrower } = await req.json();
    if (!lender || !borrower) {
        return new Response(JSON.stringify({ message: 'Lender and borrower are required' }), {
            status: 400,
        });
    }

    try {
        const client = await clientPromise;
        const database = client.db("tabTracker");
        const users = database.collection("users");

        const lenderUser = await users.findOne({ Name: lender });
        const borrowerUser = await users.findOne({ Name: borrower });

        if (!lenderUser || !borrowerUser) {
            return new Response(JSON.stringify({ message: 'Lender or borrower not found.' }), {
                status: 404,
            });
        }

        // Check if lender owes any tokens to the borrower
        const owes = lenderUser.Owes[borrower] || 0;

        if (owes > 0) {
            // If lender owes tokens to borrower, deduct one from lender's owed tokens
            await users.updateOne(
                { Name: lender },
                { $inc: { [`Owes.${borrower}`]: -1 } } // Deduct 1 from lender's owed tokens
            );
        } else {
            // If lender does not owe any tokens to borrower, update borrower's record
            await users.updateOne(
                { Name: borrower },
                { $inc: { [`Owes.${lender}`]: 1 } } // Borrower owes one more to lender
            );
        }

        return new Response(JSON.stringify({ message: `Token lent from ${lender} to ${borrower} successfully.` }), {
            status: 200
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, message: 'Error lending token.' }), {
            status: 500
        });
    }
}
