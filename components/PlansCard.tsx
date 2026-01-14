import React from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";

interface PlansCardProps {
    id: string;
    name: string;
    description: string;
    currency: string;
    price: number;
    planType: string;
    onPayClick: () => void;
}

const PlansCard = ({
    id,
    name,
    description,
    currency,
    price,
    planType,
    onPayClick,
}: PlansCardProps) => {
    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(price);
    };

    const isYearly =
        planType.toLowerCase().includes("year") ||
        planType.toLowerCase().includes("annual");
    const monthlyPrice = isYearly ? price / 12 : null;

    return (
        <Card className="group relative flex flex-col h-full w-full max-w-full sm:max-w-sm overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-primary/20 bg-gradient-to-br from-white to-gray-50/50">
            {/* Decorative gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <CardHeader className="pb-4 sm:pb-6 relative z-10">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-primary transition-colors duration-300">
                    {name}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {description}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-center py-4 sm:py-6 relative z-10">
                <div className="mb-4 sm:mb-6">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1 sm:gap-2">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                                {formatPrice(price / 100, currency)}
                            </span>
                            <span className="text-sm sm:text-base text-gray-500 font-medium">
                                /{planType}
                            </span>
                        </div>
                        {isYearly && monthlyPrice && (
                            <span className="text-xs sm:text-sm text-gray-400 mt-1">
                                ({formatPrice(monthlyPrice / 100, currency)}
                                /month)
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-4 sm:pt-6 relative z-10 border-t border-gray-100">
                <Button
                    variant="default"
                    className="w-full text-sm sm:text-base font-semibold py-6 sm:py-7 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]"
                    size="lg"
                    onClick={onPayClick}
                >
                    Get Started
                </Button>
            </CardFooter>
        </Card>
    );
};

export default PlansCard;
