"use client";
import { ProductListResponse } from "dodopayments/resources/index.mjs";
import React from "react";
import PlansCard from "./PlansCard";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const PlansList = ({ plans }: { plans: ProductListResponse[] }) => {
    const { user } = useAuth();
    const router = useRouter();
    const handlePayClick = async (plan: ProductListResponse) => {
        const response = await fetch("/api/checkout/subscription", {
            method: "POST",
            body: JSON.stringify({
                productId: plan.product_id,
                email: user?.email ?? "",
                userId: user?.uid ?? "",
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        if (data.payment_link) {
            router.push(data.payment_link);
        } else {
            console.error("Failed to create payment link", data);
        }
    };
    if (!plans || plans.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No plans available</p>
            </div>
        );
    }

    return (
        <div className="w-full py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 sm:mb-8 lg:mb-12 text-center">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
                        Choose Your Plan
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Select the perfect plan for your needs
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
                    {plans.map((plan: ProductListResponse) => (
                        <div
                            key={plan.product_id}
                            className="w-full sm:flex-[0_1_calc(50%-0.75rem)] lg:flex-[0_1_calc(33.333%-1.33rem)] max-w-sm"
                        >
                            <PlansCard
                                id={plan.product_id}
                                name={plan.name ?? ""}
                                description={plan.description ?? ""}
                                currency={plan.currency ?? ""}
                                price={plan.price ?? 0}
                                planType={
                                    plan.price_detail &&
                                    "payment_frequency_interval" in
                                        plan.price_detail
                                        ? plan.price_detail
                                              .payment_frequency_interval
                                        : "month"
                                }
                                onPayClick={() => handlePayClick(plan)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlansList;
