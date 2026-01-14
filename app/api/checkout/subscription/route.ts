import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { dodopayments } from "@/lib/dodo-payments";
import { APIError } from "dodopayments";
import { getCountryCode } from "@/lib/helpers/getCountryCode";

const schema = z.object({
    productId: z.string(),
    email: z.email(),
    userId: z.string(),
});

export const POST = async (request: NextRequest) => {
    const countryCode = getCountryCode(request);
    const body = await request.json();
    const validatedBody = schema.safeParse(body);
    if (!validatedBody.success) {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
    const { productId, email, userId } = validatedBody.data;
    try {
        const subscription = await dodopayments.subscriptions.create({
            billing: {
                country: countryCode,
                state: "",
                city: "",
                street: "",
                zipcode: "",
            },
            customer: {
                email: email,
                name: "",
            },
            metadata: {
                userId: userId,
            },
            payment_link: true,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
            product_id: productId,
            quantity: 1,
        });
        return NextResponse.json(subscription);
    } catch (error) {
        const dodoPaymentError = error as APIError;
        return NextResponse.json(
            { message: dodoPaymentError.message },
            { status: dodoPaymentError.status }
        );
    }
};
