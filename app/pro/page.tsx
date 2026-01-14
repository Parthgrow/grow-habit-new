import PlansList from "@/components/PlansList";
import { ProductListResponse } from "dodopayments/resources/index.mjs";
import BackButton from "@/components/BackButton";

export default async function Pro() {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/plans`
    );
    const plans = (await response.json()) as ProductListResponse[];
    return (
        <>
            <BackButton />
            <PlansList plans={plans} />
        </>
    );
}
