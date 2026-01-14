import PlansList from "@/components/PlansList";
import { ProductListResponse } from "dodopayments/resources/index.mjs";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

export default async function Pro() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/plans`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch plans: ${response.status} ${response.statusText}`
            );
        }

        const plans = (await response.json()) as ProductListResponse[];
        return (
            <>
                <BackButton />
                <PlansList plans={plans} />
            </>
        );
    } catch (error) {
        console.error("Error fetching plans:", error);
        return (
            <>
                <BackButton />
                <div className="p-4">
                    <p className="text-red-500">
                        Failed to load plans. Please try again later.
                    </p>
                </div>
            </>
        );
    }
}
