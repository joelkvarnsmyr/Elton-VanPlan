
import fetch from 'node-fetch';

const REGION = 'europe-west1';
const PROJECT_ID = 'eltonvanplan';
const FUNCTION_NAME = 'scrapeVehicleData';
const URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${FUNCTION_NAME}`;

async function verifyEndpoint() {
    const regNo = process.argv[2] || 'JSN398';

    console.log(`Testing endpoint: ${URL}`);
    console.log(`Payload: { data: { regNo: "${regNo}" } }`);

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: { regNo } })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        const text = await response.text();
        try {
            const json = JSON.parse(text);
            console.log('Response JSON:', JSON.stringify(json, null, 2));

            if (response.ok && json.result?.success) {
                console.log('✅ PASS: Function returned success.');
            } else if (response.ok && json.result?.error) {
                console.log('⚠️ PARTIAL PASS: Function ran but returned application error:', json.result.error);
            } else {
                console.log('❌ FAIL: Function returned error or bad structure.');
            }

        } catch (e) {
            console.log('Response Text (Not JSON):', text);
            console.log('❌ FAIL: Could not parse JSON response.');
        }

    } catch (error) {
        console.error('Network Error:', error);
    }
}

verifyEndpoint();
