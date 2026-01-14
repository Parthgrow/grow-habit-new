import { NextResponse } from "next/server";
import { dodopayments } from "@/lib/dodo-payments";

export async function GET() {
    const plans = await dodopayments.products.list();
    return NextResponse.json(plans.items);
}
