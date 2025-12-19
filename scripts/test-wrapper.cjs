
const api = require("fordonsuppgifter-api-wrapper");

async function test() {
    try {
        console.log("Fetching vehicle info for UPR79Z...");
        const res = await api.GetVehicleInformation("UPR79Z");
        console.log("Result:", JSON.stringify(res, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
