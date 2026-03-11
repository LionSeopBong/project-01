"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useWod } from "@/hooks/useWod";

export default function AddRecordPage() {
  const { user, loading } = useAuthGuard();

  // const { wod, wodLoading } = useWod(id);
  return <>기록 등록</>;
}
