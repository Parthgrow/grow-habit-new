import { WebhookPayload } from "dodopayments/resources/webhook-events.mjs";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/firebase"; // your Firestore instance

function toDateOrNull(ts?: number | null) {
    return ts ? new Date(ts * 1000) : null;
}

function toTsFromISO(iso?: string | null) {
    return iso ? Timestamp.fromDate(new Date(iso)) : null;
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();

        const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY ?? "";
        if (!webhookSecret) {
            console.error("Missing DODO_PAYMENTS_WEBHOOK_KEY");
            return NextResponse.json(
                { error: "Server misconfigured" },
                { status: 500 }
            );
        }
        const webhook = new Webhook(webhookSecret);

        const webhookHeaders = {
            "webhook-id": request.headers.get("webhook-id") ?? "",
            "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
            "webhook-signature": request.headers.get("webhook-signature") ?? "",
        };

        // verify payload signature
        await webhook.verify(rawBody, webhookHeaders);

        const payload = JSON.parse(rawBody) as WebhookPayload;
        // console.log("Payload:", payload);

        if (payload.data.payload_type === "Subscription") {
            const subscriptionId = payload.data.subscription_id;
            const userId = payload.data.metadata?.userId;

            if (!userId) {
                console.error("Missing userId in subscription metadata");
                return NextResponse.json({ received: true }, { status: 200 });
            }
            // Prepare the billing doc data we'll upsert
            const billingDocRef = db.collection("billing").doc(subscriptionId);

            const billingData = {
                type: "subscription",
                provider: "dodo",
                providerId: subscriptionId,
                userId: userId ?? null,
                planId: payload.data.product_id ?? null,
                planInterval: payload.data.payment_frequency_interval ?? null,
                planAmount: payload.data.recurring_pre_tax_amount ?? null, // in cents
                currency: payload.data.currency ?? null,
                status: payload.data.status ?? null,
                currentPeriodStart: toTsFromISO(
                    payload.data.previous_billing_date ??
                        payload.data.created_at
                ),
                currentPeriodEnd: toTsFromISO(
                    payload.data.next_billing_date ?? payload.data.expires_at
                ),
                metadata: payload.data.metadata ?? {},
                raw: payload.data, // store raw object for later debugging / audit
                updatedAt: Timestamp.now(),
            };

            // Upsert billing doc for subscription
            await billingDocRef.set(billingData, { merge: true });

            // Now update user doc if we can
            if (userId) {
                const userRef = db.collection("users").doc(userId);

                // Decide how to set user fields depending on event type
                switch (payload.type) {
                    case "subscription.active":
                    case "subscription.renewed":
                    case "subscription.updated":
                    case "subscription.plan_changed": {
                        // If subscription is active, mark user as pro and set expiry
                        if (billingData.status === "active") {
                            const interval =
                                billingData.planInterval?.toLowerCase();
                            await userRef.set(
                                {
                                    isPro: true,
                                    proPlan:
                                        interval === "month"
                                            ? "monthly"
                                            : "yearly",
                                    proSince: Timestamp.now(),
                                    proExpiresAt:
                                        billingData.currentPeriodEnd ?? null,
                                    subscriptionStatus: billingData.status, // Update from "free" when user buys plan
                                },
                                { merge: true }
                            );
                        } else {
                            // non-active update: keep pro flags but update the expiry/status
                            await userRef.set(
                                {
                                    proExpiresAt:
                                        billingData.currentPeriodEnd ?? null,
                                },
                                { merge: true }
                            );
                        }
                        break;
                    }

                    case "subscription.on_hold":
                    case "subscription.failed": {
                        // mark user's subscription state but do not immediately remove pro access
                        await userRef.set(
                            {
                                subscriptionStatus: billingData.status,
                                // optionally keep isPro true until expiry
                            },
                            { merge: true }
                        );
                        break;
                    }

                    case "subscription.cancelled":
                    case "subscription.expired": {
                        // Keep access until currentPeriodEnd; if already past, mark not pro
                        const now = Timestamp.now();
                        const expiresAt = billingData.currentPeriodEnd;
                        if (expiresAt && expiresAt > now) {
                            // Keep isPro true until expiry, but store cancel flag
                            await userRef.set(
                                {
                                    isPro: true,
                                    subscriptionCancelled: true,
                                    proExpiresAt: expiresAt,
                                    subscriptionStatus: "cancelled",
                                },
                                { merge: true }
                            );
                        } else {
                            // already expired -> revoke pro
                            await userRef.set(
                                {
                                    isPro: false,
                                    proPlan: null,
                                    proExpiresAt: null,
                                    subscriptionStatus: "expired",
                                },
                                { merge: true }
                            );
                        }
                        break;
                    }

                    default:
                        // default: just sync expiry/status fields
                        await userRef.set(
                            {
                                proExpiresAt:
                                    billingData.currentPeriodEnd ?? null,
                                subscriptionStatus: billingData.status,
                            },
                            { merge: true }
                        );
                }
            } else {
                console.warn(
                    "No userId in subscription metadata for subscription:",
                    subscriptionId
                );
            }
        }
        // TODO: One-time payment handling - currently disabled, focusing on subscriptions only
        // else if (payload.data.payload_type === "Payment") {
        //     const paymentId = payload.data.payment_id;
        //     const payment = await dodopayments.payments.retrieve(paymentId);

        //     // Idempotency: if payment record already exists, ignore
        //     const paymentDocRef = db.collection("billing").doc(paymentId);
        //     const paymentDoc = await paymentDocRef.get();
        //     if (paymentDoc.exists) {
        //         console.log("Payment already processed, skipping:", paymentId);
        //     } else {
        //         // Get userId from customer email
        //         const userEmail = payload.data.customer?.email;
        //         if (!userEmail) {
        //             console.warn("Payment has no customer email:", paymentId);
        //             return NextResponse.json({ received: true }, { status: 200 });
        //         }

        //         // Fetch userId from users collection by email
        //         const userDoc = await db
        //             .collection("users")
        //             .where("email", "==", userEmail)
        //             .get();
        //         if (userDoc.empty) {
        //             console.error("User not found for payment:", userEmail);
        //             return NextResponse.json({ received: true }, { status: 200 });
        //         }
        //         const userId = userDoc.docs[0].id;

        //         // Write payment doc
        //         const paymentData = {
        //             type: "payment",
        //             provider: "dodo",
        //             providerId: paymentId,
        //             userId: userId ?? null,
        //             subscriptionId: payment.metadata?.subscriptionId ?? payment.metadata?.subscription_id ?? null,
        //             amount: payment.amount ?? payload.data.amount ?? null, // in cents
        //             currency: payment.currency ?? payload.data.currency ?? null,
        //             status: payment.status ?? payload.data.status ?? "unknown",
        //             metadata: payment.metadata ?? payload.data.metadata ?? {},
        //             raw: payment,
        //             createdAt: new Date(payment.created_at ? payment.created_at * 1000 : Date.now()),
        //             updatedAt: new Date(),
        //         };
        //         await paymentDocRef.set(paymentData);

        //         // If this payment belongs to a subscription and succeeded, extend user's pro expiry
        //         const subId = paymentData.subscriptionId;
        //         if (userId && paymentData.status === "success") {
        //             const userRef = db.collection("users").doc(userId);
        //             // if subscription data present from payment metadata, try to update user's expiry
        //             if (subId) {
        //                 const subDoc = await db
        //                     .collection("billing")
        //                     .doc(subId)
        //                     .get();
        //                 if (subDoc.exists) {
        //                     const subObj: any = subDoc.data();
        //                     const expiresAt = subObj?.currentPeriodEnd
        //                         ? subObj.currentPeriodEnd.toDate
        //                             ? subObj.currentPeriodEnd.toDate()
        //                             : new Date(subObj.currentPeriodEnd)
        //                         : null;
        //                     // set user pro flags
        //                     await userRef.set(
        //                         {
        //                             isPro: true,
        //                             proPlan:
        //                                 subObj?.planInterval === "Month"
        //                                     ? "monthly"
        //                                     : "yearly",
        //                             proExpiresAt: expiresAt ?? null,
        //                         },
        //                         { merge: true }
        //                     );
        //                 } else {
        //                     // No subscription record yet — best-effort: mark user pro if payment succeeded
        //                     await userRef.set(
        //                         {
        //                             isPro: true,
        //                             proSince: new Date(),
        //                         },
        //                         { merge: true }
        //                     );
        //                 }
        //             } else {
        //                 // Payment without subscription metadata — if success, mark user as pro briefly (depends on your flow)
        //                 await userRef.set(
        //                     {
        //                         isPro: true,
        //                         proSince: new Date(),
        //                     },
        //                     { merge: true }
        //                 );
        //             }
        //         }
        //     }
        // }
        else {
            console.log("Unhandled payload type:", payload.data.payload_type);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (err) {
        console.error("Webhook processing failed:", err);
        return NextResponse.json(
            { error: "Webhook verification/processing failed" },
            { status: 403 }
        );
    }
}
