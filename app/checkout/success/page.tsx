"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 shadow-lg">
                <div className="text-center">
                    <div className="bg-green-100 rounded-full p-4 inline-flex mb-6">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Payment Done
                    </h1>
                    <Button asChild>
                        <Link href="/">Continue</Link>
                    </Button>
                </div>
            </Card>
        </div>
    );
}
