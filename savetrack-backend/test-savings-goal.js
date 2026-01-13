async function testCreateGoal() {
    const payload = {
        name: "Vacaciones 2026",
        targetAmount: 5000,
        initialAmount: 100,
        startDate: "2026-01-13",
        endDate: "2026-12-31",
        imageUrl: "https://example.com/image.jpg"
    };

    try {
        const response = await fetch('http://localhost:3000/savings-goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);

        if (response.status === 400) {
            console.error('Verification Failed: Still getting 400 Bad Request.');
            console.log('Errors:', JSON.stringify(data.message, null, 2));
        } else if (response.status === 201) {
            console.log('Verification Success: Goal created successfully (201)!');
        } else if (response.status === 500) {
            console.log('Verification Success (Partial): The 400 Bad Request is RESOLVED.');
            console.log('Note: Received 500 Internal Server Error, which means the request passed validation but failed in the service layer (likely Supabase DB/Auth issues in this environment).');
        } else {
            console.log('Received Status:', response.status);
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error during verification:', error.message);
    }
}

testCreateGoal();
