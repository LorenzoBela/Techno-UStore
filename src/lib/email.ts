"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/db";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender configuration
const FROM_EMAIL = "Adamson UStore <onboarding@resend.dev>";

// Adamson Blue color from website
const ADAMSON_BLUE = "#1f3a93";

// Logo hosted on Vercel deployment
const LOGO_URL = "https://techno-u-store.vercel.app/adamson-logo.png";

// =============================================================================
// BASE EMAIL TEMPLATE
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
        :root {
            color-scheme: light;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
        }
        .wrapper {
            width: 100%;
            background-color: #f3f4f6;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: ${ADAMSON_BLUE};
            padding: 32px 24px;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-color: #ffffff;
            margin: 0 auto 16px;
        }
        .header-title {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            line-height: 1.3;
        }
        .content {
            padding: 32px 24px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
        }
        .message {
            font-size: 15px;
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .info-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        .info-value {
            font-size: 14px;
            color: #1f2937;
            font-weight: 600;
            text-align: right;
        }
        .button {
            display: inline-block;
            background-color: ${ADAMSON_BLUE};
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
        }
        .button:hover {
            background-color: #162d75;
        }
        .button-container {
            text-align: center;
            margin: 24px 0;
        }
        .footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-text {
            font-size: 13px;
            color: #9ca3af;
            line-height: 1.5;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-success {
            background-color: #dcfce7;
            color: #166534;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-info {
            background-color: #e8edf7;
            color: ${ADAMSON_BLUE};
        }
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }
        .item-table th {
            background-color: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        .item-table td {
            padding: 12px;
            font-size: 14px;
            color: #4b5563;
            border-bottom: 1px solid #e5e7eb;
        }
        .item-table .total-row {
            background-color: #f9fafb;
            font-weight: 700;
        }
        .item-table .total-row td {
            color: #1f2937;
            font-size: 16px;
        }
        /* Mobile Responsive */
        @media only screen and (max-width: 600px) {
            .wrapper {
                padding: 20px 12px !important;
            }
            .container {
                border-radius: 8px !important;
            }
            .header {
                padding: 24px 16px !important;
            }
            .header-title {
                font-size: 20px !important;
            }
            .content {
                padding: 24px 16px !important;
            }
            .info-box {
                padding: 16px !important;
            }
            .button {
                display: block !important;
                width: 100% !important;
            }
            .item-table th,
            .item-table td {
                padding: 8px !important;
                font-size: 13px !important;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center">
                    <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0">
                        <!-- Header -->
                        <tr>
                            <td class="header">
                                <img src="${LOGO_URL}" alt="Adamson University" style="width: 80px; height: 80px; border-radius: 50%; background-color: #ffffff; margin-bottom: 16px; object-fit: contain;">
                                <h1 class="header-title">${title}</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td class="content">
                                ${content}
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td class="footer">
                                <p class="footer-text">
                                    Adamson University Store<br>
                                    San Marcelino St., Ermita, Manila<br>
                                    <br>
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
// EMAIL TEMPLATES
// =============================================================================

function getPaymentReceivedTemplate(order: OrderEmailData, proofImageUrl: string): string {
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
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">#${order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Customer</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">${order.customerName}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-size: 14px; color: #6b7280;">Email</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">${order.customerEmail}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="font-size: 14px; color: #6b7280;">Total Amount</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="font-size: 16px; color: ${ADAMSON_BLUE}; font-weight: 700;">₱${order.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
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

function getOrderAcceptedTemplate(order: OrderEmailData): string {
    const content = `
        <p class="greeting">Hello ${order.customerName}!</p>
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
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">#${order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="font-size: 14px; color: #6b7280;">Total Amount</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="font-size: 16px; color: ${ADAMSON_BLUE}; font-weight: 700;">₱${order.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </td>
                </tr>
            </table>
        </div>

        <p class="message">We'll notify you again once your order is ready for pickup. Thank you for shopping with Adamson UStore!</p>
    `;
    return getBaseTemplate(content, "Order Accepted!");
}

function getReadyForPickupTemplate(order: OrderEmailData, pickupDate?: string): string {
    const pickupInfo = pickupDate
        ? `<tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="font-size: 14px; color: #6b7280;">Scheduled Pickup</span>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="font-size: 14px; color: #1f2937; font-weight: 600;">${new Date(pickupDate).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </td>
        </tr>`
        : '';

    const content = `
        <p class="greeting">Hello ${order.customerName}!</p>
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
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">#${order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                </tr>
                ${pickupInfo}
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="font-size: 14px; color: #6b7280;">Total Amount</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="font-size: 16px; color: ${ADAMSON_BLUE}; font-weight: 700;">₱${order.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
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

function getOrderCompletedTemplate(order: OrderEmailData, items: OrderItemData[]): string {
    const itemRows = items.map(item => `
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
        <p class="greeting">Thank you, ${order.customerName}!</p>
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
                        <span style="font-size: 14px; color: #1f2937; font-weight: 600;">${order.id.slice(0, 8).toUpperCase()}</span>
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

        <!-- Items Table -->
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
                        ₱${order.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
// TYPE DEFINITIONS
// =============================================================================

interface OrderEmailData {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalAmount: number;
}

interface OrderItemData {
    name: string;
    quantity: number;
    price: number;
}

// =============================================================================
// PUBLIC EMAIL FUNCTIONS
// =============================================================================

/**
 * Notify all admin users when a new payment proof is uploaded
 */
export async function notifyAdminsPaymentReceived(orderId: string, proofImageUrl: string) {
    try {
        // Fetch order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                totalAmount: true,
            }
        });

        if (!order) {
            console.error("Order not found for email notification:", orderId);
            return { success: false, error: "Order not found" };
        }

        // Fetch all admin emails
        const admins = await prisma.user.findMany({
            where: { role: "admin" },
            select: { email: true, name: true }
        });

        if (admins.length === 0) {
            console.warn("No admin users found to notify");
            return { success: false, error: "No admins to notify" };
        }

        const orderData: OrderEmailData = {
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            totalAmount: Number(order.totalAmount)
        };

        const html = getPaymentReceivedTemplate(orderData, proofImageUrl);
        const adminEmails = admins.map(a => a.email);

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: adminEmails,
            subject: `🧾 New Payment Proof - Order #${order.id.slice(0, 8).toUpperCase()}`,
            html: html,
        });

        if (error) {
            console.error("Failed to send admin notification:", error);
            return { success: false, error: error.message };
        }

        console.log("Admin notification sent:", data?.id);
        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error("Error in notifyAdminsPaymentReceived:", error);
        return { success: false, error: "Failed to send notification" };
    }
}

/**
 * Notify customer when their order is accepted (payment verified)
 */
export async function notifyUserOrderAccepted(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                totalAmount: true,
            }
        });

        if (!order) {
            console.error("Order not found for email notification:", orderId);
            return { success: false, error: "Order not found" };
        }

        const orderData: OrderEmailData = {
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            totalAmount: Number(order.totalAmount)
        };

        const html = getOrderAcceptedTemplate(orderData);

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: order.customerEmail,
            subject: `✅ Order Accepted - #${order.id.slice(0, 8).toUpperCase()}`,
            html: html,
        });

        if (error) {
            console.error("Failed to send order accepted email:", error);
            return { success: false, error: error.message };
        }

        console.log("Order accepted notification sent:", data?.id);
        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error("Error in notifyUserOrderAccepted:", error);
        return { success: false, error: "Failed to send notification" };
    }
}

/**
 * Notify customer when their order is ready for pickup
 */
export async function notifyUserReadyForPickup(orderId: string, pickupDate?: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                totalAmount: true,
                scheduledPickupDate: true,
            }
        });

        if (!order) {
            console.error("Order not found for email notification:", orderId);
            return { success: false, error: "Order not found" };
        }

        const orderData: OrderEmailData = {
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            totalAmount: Number(order.totalAmount)
        };

        const scheduledDate = pickupDate || order.scheduledPickupDate?.toISOString();
        const html = getReadyForPickupTemplate(orderData, scheduledDate);

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: order.customerEmail,
            subject: `📦 Ready for Pickup - Order #${order.id.slice(0, 8).toUpperCase()}`,
            html: html,
        });

        if (error) {
            console.error("Failed to send ready for pickup email:", error);
            return { success: false, error: error.message };
        }

        console.log("Ready for pickup notification sent:", data?.id);
        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error("Error in notifyUserReadyForPickup:", error);
        return { success: false, error: "Failed to send notification" };
    }
}

/**
 * Send receipt to customer when order is completed (claimed)
 */
export async function notifyUserOrderCompleted(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        if (!order) {
            console.error("Order not found for email notification:", orderId);
            return { success: false, error: "Order not found" };
        }

        const orderData: OrderEmailData = {
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            totalAmount: Number(order.totalAmount)
        };

        const itemsData: OrderItemData[] = order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.price)
        }));

        const html = getOrderCompletedTemplate(orderData, itemsData);

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: order.customerEmail,
            subject: `🧾 Your Receipt - Order #${order.id.slice(0, 8).toUpperCase()}`,
            html: html,
        });

        if (error) {
            console.error("Failed to send order completed email:", error);
            return { success: false, error: error.message };
        }

        console.log("Order completed receipt sent:", data?.id);
        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error("Error in notifyUserOrderCompleted:", error);
        return { success: false, error: "Failed to send notification" };
    }
}
