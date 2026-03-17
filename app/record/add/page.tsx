import AddRecordPage from "@/app/record/add/AddRecordPage";
import { Suspense } from "react";
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddRecordPage />
    </Suspense>
  );
}
