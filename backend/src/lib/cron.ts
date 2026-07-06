import { CronJob } from "cron";
import https from "https";

// This cron job runs every 14 minutes to ping the API URL
// this is because Render's free tier services go to sleep after 15 minutes of inactivity
const job = new CronJob("*/14 * * * *", function () {
    https.get(process.env.API_URL!, (res) => {
        if (res.statusCode === 200) {
            console.log("Cron job executed successfully at", new Date());
        } else {
            console.error("Failed to execute cron job. Status code:", res.statusCode);
        }
    }).on("error", (err) => {
        console.error("Error executing cron job:", err);
    });
});

export default job;