const nodemailer = require('nodemailer');
const { app } = require('@azure/functions');

// Configure the Gmail SMTP transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD // Your Gmail App Password
    }
});

app.http('mailchimpWebHookNewContact', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Parse the webhook payload from Mailchimp
            const body = await request.json();

            // Check for a new subscription event
            if (body.type === 'subscribe') {
                const email = body.data.email; // Subscriber's email
                const firstName = body.data.merges.FNAME || 'Subscriber'; // First name (if available)

                context.log(`New subscriber: ${firstName} (${email})`);

                // Send email notification
                await sendEmailNotification(email, firstName);

                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'Email sent successfully!' })
                };
            } else {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Unsupported webhook event type' })
                };
            }
        } catch (error) {
            context.log('Error:', error);

            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Internal server error' })
            };
        }
    }
});

// Function to send email notifications
async function sendEmailNotification(subscriberEmail, subscriberName) {
    const mailOptions = {
        from: process.env.GMAIL_USER, // Sender email
        to: process.env.RECIPIENT_EMAIL, // Email to send the notification
        subject: `New Mailchimp Subscriber: ${subscriberName}`,
        text: `A new subscriber has registered:\n\nName: ${subscriberName}\nEmail: ${subscriberEmail}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email notification');
    }
}
