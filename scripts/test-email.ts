// Test script for all 4 email templates
// Run with: npx tsx scripts/test-email.ts

import { Resend } from "resend";

const resend = new Resend("re_HQdXCFNq_7SwBf93QHFyA8vH3KTzsv8kT");

const FROM_EMAIL = "Adamson UStore <onboarding@resend.dev>";
const TEST_EMAIL = "lorenzo91145@gmail.com";

// Adamson Blue from the website
const ADAMSON_BLUE = "#1f3a93";

// Logo from the actual Vercel deployment (corrected URL)
const LOGO_URL = "https://techno-u-store.vercel.app/adamson-logo.png";

// Sample order data for testing
const sampleOrder = {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    customerName: "Lorenzo Bela",
    customerEmail: TEST_EMAIL,
    customerPhone: "+63 912 345 6789",
    totalAmount: 1250.00
};

const sampleItems = [
    { name: "Adamson University ID Lace", quantity: 2, price: 150.00 },
    { name: "College of Engineering Shirt (Large)", quantity: 1, price: 450.00 },
    { name: "Adamson Notebook Set", quantity: 3, price: 166.67 }
];

// =============================================================================
// BASE TEMPLATE
// =============================================================================
function getBaseTemplate(content: string, title: string): string {
    return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office">
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <style>
        td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
    </style>
    <![endif]-->
    <style>
        :root { color-scheme: light; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            background-color: #f3f4f6;
            margin: 0; padding: 0;
        }
        .wrapper { width: 100%; background-color: #f3f4f6; padding: 40px 20px; }
        .container {
            max-width: 600px; margin: 0 auto; background-color: #ffffff;
            border-radius: 12px; overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: ${ADAMSON_BLUE};
            padding: 32px 24px;
            text-align: center;
        }
        .header-title { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.3; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
        .message { font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
        .info-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .button {
            display: inline-block;
            background-color: ${ADAMSON_BLUE};
            color: #ffffff !important; text-decoration: none;
            padding: 14px 28px; border-radius: 8px;
            font-weight: 600; font-size: 15px; text-align: center;
        }
        .button-container { text-align: center; margin: 24px 0; }
        .footer { background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-text { font-size: 13px; color: #9ca3af; line-height: 1.5; }
        .status-badge {
            display: inline-block; padding: 6px 16px; border-radius: 20px;
            font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .status-success { background-color: #dcfce7; color: #166534; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-info { background-color: #e8edf7; color: ${ADAMSON_BLUE}; }
        @media only screen and (max-width: 600px) {
            .wrapper { padding: 20px 12px !important; }
            .container { border-radius: 8px !important; }
            .header { padding: 24px 16px !important; }
            .header-title { font-size: 20px !important; }
            .content { padding: 24px 16px !important; }
            .info-box { padding: 16px !important; }
            .button { display: block !important; width: 100% !important; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center">
                    <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td class="header">
                                <img src="${LOGO_URL}" alt="Adamson University" style="width: 80px; height: 80px; border-radius: 50%; background-color: #ffffff; margin-bottom: 16px; object-fit: contain;">
                                <h1 class="header-title">${title}</h1>
                            </td>
                        </tr>
                        <tr>
                            <td class="content">
                                ${content}
                            </td>
                        </tr>
                        <tr>
                            <td class="footer">
                                <p class="footer-text">
                                    Adamson University Store<br>
                                    San Marcelino St., Ermita, Manila<br><br>
                                    This is an automated message. Please do not reply directly to this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;
}

// =============================================================================
// EMAIL TEMPLATE 1: Payment Received (for Admins)
// =============================================================================
function getPaymentReceivedTemplate(): string {
    const proofImageUrl = "https://example.com/payment-proof.jpg";
    const content = `
        <p class="greeting">New Payment Received!</p>
        <p class="message">A customer has uploaded their payment proof and is awaiting verification.</p>
        
        <div class="info-box">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Order ID</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">#${sampleOrder.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Customer</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">${sampleOrder.customerName}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Email</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">${sampleOrder.customerEmail}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="font-size: 14px; color: #6b7280;">Total Amount</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="font-size: 16px; color: ${ADAMSON_BLUE}; font-weight: 700;">₱${sampleOrder.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </td>
                </tr>
            </table>
        </div>

        <div class="button-container">
            <a href="${proofImageUrl}" class="button" style="color: #ffffff;">View Payment Proof</a>
        </div>

        <p class="message" style="text-align: center; margin-top: 24px;">
            Please review and verify this payment in the admin dashboard.
        </p>
    `;
    return getBaseTemplate(content, "Payment Proof Received");
}

// =============================================================================
// EMAIL TEMPLATE 2: Order Accepted (for Customer)
// =============================================================================
function getOrderAcceptedTemplate(): string {
    const content = `
        <p class="greeting">Hello ${sampleOrder.customerName}!</p>
        <p class="message">Great news! Your payment has been verified and your order has been accepted. We're now preparing your items.</p>
        
        <div style="text-align: center; margin: 24px 0;">
            <span class="status-badge status-success">✓ Payment Verified</span>
        </div>

        <div class="info-box">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Order ID</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">#${sampleOrder.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="font-size: 14px; color: #6b7280;">Total Amount</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="font-size: 16px; color: ${ADAMSON_BLUE}; font-weight: 700;">₱${sampleOrder.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </td>
                </tr>
            </table>
        </div>

        <p class="message">We'll notify you again once your order is ready for pickup. Thank you for shopping with Adamson UStore!</p>
    `;
    return getBaseTemplate(content, "Order Accepted!");
}

// =============================================================================
// EMAIL TEMPLATE 3: Ready for Pickup (for Customer)
// =============================================================================
function getReadyForPickupTemplate(): string {
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 2); // 2 days from now

    const content = `
        <p class="greeting">Hello ${sampleOrder.customerName}!</p>
        <p class="message">Your order is now ready for pickup! Please visit the Adamson UStore to claim your items.</p>
        
        <div style="text-align: center; margin: 24px 0;">
            <span class="status-badge status-info">📦 Ready for Pickup</span>
        </div>

        <div class="info-box">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Order ID</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">#${sampleOrder.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Scheduled Pickup</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">${pickupDate.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="font-size: 14px; color: #6b7280;">Total Amount</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="font-size: 16px; color: ${ADAMSON_BLUE}; font-weight: 700;">₱${sampleOrder.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </td>
                </tr>
            </table>
        </div>

        <p class="message" style="background-color: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <strong>📍 Pickup Location:</strong><br>
            Adamson University Store<br>
            San Marcelino St., Ermita, Manila<br><br>
            <strong>⏰ Store Hours:</strong> Monday - Saturday, 8:00 AM - 5:00 PM
        </p>

        <p class="message" style="margin-top: 24px;">Please bring a valid ID and this order confirmation when picking up your items.</p>
    `;
    return getBaseTemplate(content, "Order Ready for Pickup!");
}

// =============================================================================
// EMAIL TEMPLATE 4: Order Completed / Receipt (for Customer)
// =============================================================================
function getOrderCompletedTemplate(): string {
    const itemRows = sampleItems.map(item => `
        <tr>
            <td style="padding: 12px; font-size: 14px; color: #4b5563; border-bottom: 1px solid #e5e7eb;">
                ${item.name}
            </td>
            <td style="padding: 12px; font-size: 14px; color: #4b5563; border-bottom: 1px solid #e5e7eb; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 12px; font-size: 14px; color: #4b5563; border-bottom: 1px solid #e5e7eb; text-align: right;">
                ₱${item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </td>
            <td style="padding: 12px; font-size: 14px; color: #4b5563; border-bottom: 1px solid #e5e7eb; text-align: right;">
                ₱${(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </td>
        </tr>
    `).join('');

    const content = `
        <p class="greeting">Thank you, ${sampleOrder.customerName}!</p>
        <p class="message">Your order has been successfully completed. Here is your official receipt for your records.</p>
        
        <div style="text-align: center; margin: 24px 0;">
            <span class="status-badge status-success">✓ Order Completed</span>
        </div>

        <div class="info-box" style="margin-bottom: 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Receipt #</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">${sampleOrder.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Date</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="font-size: 14px; color: #6b7280;">Payment Method</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">GCash</span>
                    </td>
                </tr>
            </table>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="background-color: #f3f4f6; padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Item</th>
                    <th style="background-color: #f3f4f6; padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="background-color: #f3f4f6; padding: 12px; text-align: right; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Price</th>
                    <th style="background-color: #f3f4f6; padding: 12px; text-align: right; font-size: 13px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows}
                <tr style="background-color: #f9fafb;">
                    <td colspan="3" style="padding: 12px; font-size: 16px; color: #1f2937; font-weight: 700; text-align: right;">
                        Total
                    </td>
                    <td style="padding: 12px; font-size: 18px; color: ${ADAMSON_BLUE}; font-weight: 700; text-align: right;">
                        ₱${sampleOrder.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                </tr>
            </tbody>
        </table>

        <p class="message" style="text-align: center;">
            Thank you for shopping with Adamson UStore! We hope to serve you again soon.
        </p>
    `;
    return getBaseTemplate(content, "Order Receipt");
}

// =============================================================================
// SEND ALL 4 EMAIL TYPES
// =============================================================================
async function sendAllTestEmails() {
    console.log("📧 Sending ALL 4 email types to:", TEST_EMAIL);
    console.log("   Using logo from:", LOGO_URL);
    console.log("");

    const emails = [
        {
            name: "1. Payment Received (Admin)",
            subject: `🧾 New Payment Proof - Order #${sampleOrder.id.slice(0, 8).toUpperCase()}`,
            html: getPaymentReceivedTemplate()
        },
        {
            name: "2. Order Accepted (Customer)",
            subject: `✅ Order Accepted - #${sampleOrder.id.slice(0, 8).toUpperCase()}`,
            html: getOrderAcceptedTemplate()
        },
        {
            name: "3. Ready for Pickup (Customer)",
            subject: `📦 Ready for Pickup - Order #${sampleOrder.id.slice(0, 8).toUpperCase()}`,
            html: getReadyForPickupTemplate()
        },
        {
            name: "4. Order Completed / Receipt (Customer)",
            subject: `🧾 Your Receipt - Order #${sampleOrder.id.slice(0, 8).toUpperCase()}`,
            html: getOrderCompletedTemplate()
        }
    ];

    for (const email of emails) {
        try {
            console.log(`Sending: ${email.name}...`);

            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: TEST_EMAIL,
                subject: email.subject,
                html: email.html,
            });

            if (error) {
                console.error(`   ❌ Failed: ${error.message}`);
            } else {
                console.log(`   ✅ Sent! ID: ${data?.id}`);
            }

            // Small delay between emails to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (err) {
            console.error(`   ❌ Error:`, err);
        }
    }

    console.log("\n📬 Check your inbox at:", TEST_EMAIL);
    console.log("   You should receive 4 emails!");
}

sendAllTestEmails();
