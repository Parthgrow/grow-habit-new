"use client";
import React from "react";
import { PricingTableOne } from "@/components/billingsdk/pricing-table-one";
const ProPage = () => {
    const startCheckout = async (planId: string) => {
        const productCart = [{ product_id: planId, quantity: 1 }];

        // Static Indian billing address
        const billing_address = {
            city: "Mumbai",
            country: "IN",
            state: "Maharashtra",
            street: "123 Main Street, Andheri East",
            zipcode: "400069",
        };

        // Assuming user data would come from auth context in a real app
        // For now using static data
        const customer = {
            name: "Aman",
            email: "amanfangeria980@gmail.com",
            create_new_customer: true,
        };

        const return_url = "http://localhost:3000/";

        const response = await fetch("/api/checkout", {
            method: "POST",
            body: JSON.stringify({
                productCart,
                customer,
                billing_address,
                return_url,
            }),
        });
        const data = await response.json();
        console.log(data);

        // Redirect to checkout URL if available
        if (data.checkout_url) {
            window.location.href = data.checkout_url;
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <PricingTableOne
                title="Grow Habit Pro Pricing"
                description="Get better accountability in life and improve your way of living. Choose between monthly or yearly savings."
                size="medium"
                theme="minimal"
                onPlanSelect={(planId) => startCheckout(planId)}
                plans={[
                    {
                        id: "monthly",
                        title: "Grow Habit Pro (Monthly)",
                        description:
                            "Better accountability in life and improved way of living life.",
                        currency: "$",
                        monthlyPrice: "10",
                        yearlyPrice: "120",
                        buttonText: "Subscribe Monthly",
                        highlight: false,
                        features: [
                            {
                                name: "Recurring monthly subscription",
                                icon: "refresh",
                                iconColor: "text-blue-500",
                            },
                            {
                                name: "All Grow Habit Pro features",
                                icon: "check",
                                iconColor: "text-green-500",
                            },
                            {
                                name: "Cancel anytime",
                                icon: "lock-open",
                                iconColor: "text-orange-500",
                            },
                        ],
                    },
                    {
                        id: "yearly",
                        title: "Grow Habit Pro (Yearly)",
                        description:
                            "Better accountability in life and improved way of living life.",
                        currency: "$",
                        monthlyPrice: "8.25",
                        yearlyPrice: "99",
                        buttonText: "Save $21/year",
                        highlight: true,
                        features: [
                            {
                                name: "Save $21 vs monthly billing (just $8.25/mo)",
                                icon: "star",
                                iconColor: "text-yellow-500",
                            },
                            {
                                name: "Recurring yearly subscription",
                                icon: "refresh",
                                iconColor: "text-blue-500",
                            },
                            {
                                name: "All Grow Habit Pro features",
                                icon: "check",
                                iconColor: "text-green-500",
                            },
                            {
                                name: "Cancel anytime",
                                icon: "lock-open",
                                iconColor: "text-orange-500",
                            },
                        ],
                    },
                ]}
            />
        </div>
    );
};

export default ProPage;
