import { useEffect, useState } from "react";
import { WorkoutRecord, RecordLevel } from "@/types/wod";
import { addWorkoutRecord, updateWorkoutRecord } from "@/lib/firestore";
import { Wod } from "@/types/wod";
import { useRouter } from "next/navigation";
// 진행 와드의 레코드를 작성하기 위한
export const useRecordForm = (wod: Wod | null, initialRecord?: Partial<WorkoutRecord>) => {
  const router = useRouter();
  const [selectedPart, setSelectedPart] = useState(initialRecord?.wodPart ?? "");
  const [finishMin, setFinishMin] = useState(Math.floor((initialRecord?.finishTime ?? 0) / 60));
  const [finishSec, setFinishSec] = useState((initialRecord?.finishTime ?? 0) % 60);
  const [submitting, setSubmitting] = useState(false);
  const [recordPart, setRecordPart] = useState<Partial<WorkoutRecord>>({
    isDNF: false,
    level: "R'xd",
    weights: [],
    wodTeam: false,
    partnerName: "",
    partnerWeight: 0,
    partnerDifferentWeight: false,
    totalReps: 0,
    rounds: 0,
    reps: 0,
    failCount: 0,
    hasRepsOnly: false,
    hasTotalRepsOnly: false,
  });

  const currentPart = wod?.parts.find((part) => part.part === selectedPart);
  // useRecordForm.ts 에 추가
  useEffect(() => {
    if (!initialRecord) return;
    setRecordPart(initialRecord);
    setSelectedPart(initialRecord.wodPart ?? "");
    setFinishMin(Math.floor((initialRecord.finishTime ?? 0) / 60));
    setFinishSec((initialRecord.finishTime ?? 0) % 60);
  }, [initialRecord?.id]); // id 가 바뀔 때만 실행

  const handlePartChange = (part: string) => {
    setSelectedPart(part);
    setRecordPart({
      isDNF: false,
      level: recordPart.level,
      weights: [],
      wodTeam: false,
      partnerName: "",
      partnerWeight: 0,
      partnerDifferentWeight: false,
      totalReps: 0,
      rounds: 0,
      reps: 0,
      failCount: 0,
      hasRepsOnly: false,
      hasTotalRepsOnly: false,
    });
    setFinishMin(0);
    setFinishSec(0);
  };

  const handleSubmit = async (userId: string, userName: string) => {
    if (!wod || !currentPart) return;
    setSubmitting(true);
    try {
      const record: Omit<WorkoutRecord, "id"> = {
        ...recordPart,
        userId,
        userName,
        wodId: wod.id,
        wodName: wod.title,
        wodPart: selectedPart,
        wodType: currentPart.type,
        completedAt: wod.date,
        isDNF: recordPart.isDNF ?? false,
        level: recordPart.level ?? "R'xd",
        weights: recordPart.weights ?? [],
        wodTeam: currentPart.isTeam,
        partnerName: recordPart.partnerName ?? "",
        partnerWeight: recordPart.partnerWeight ?? 0,
        partnerDifferentWeight: recordPart.partnerDifferentWeight ?? false,
        finishTime: finishMin * 60 + finishSec,
        createdAt: null,
      };
      await addWorkoutRecord(record);
      router.push("/record");
    } catch (error) {
      console.error(error);
      alert("제출 실패");
    } finally {
      setSubmitting(false);
    }
  };
  const handleUpdate = async (recordId: string, userId: string, userName: string) => {
    if (!wod || !currentPart) return;
    setSubmitting(true);
    try {
      const record: Omit<WorkoutRecord, "id"> = {
        ...recordPart,
        userId,
        userName,
        wodId: wod.id,
        wodName: wod.title,
        wodPart: selectedPart,
        wodType: currentPart.type,
        completedAt: recordPart.completedAt ?? wod.date,
        isDNF: recordPart.isDNF ?? false,
        level: recordPart.level ?? "R'xd",
        weights: recordPart.weights ?? [],
        wodTeam: currentPart.isTeam,
        partnerName: recordPart.partnerName ?? "",
        partnerWeight: recordPart.partnerWeight ?? 0,
        partnerDifferentWeight: recordPart.partnerDifferentWeight ?? false,
        finishTime: finishMin * 60 + finishSec,
        createdAt: recordPart.createdAt ?? null,
      };
      await updateWorkoutRecord(recordId, record);
      router.push("/record");
    } catch (error) {
      console.error(error);
      alert("수정 실패");
    } finally {
      setSubmitting(false);
    }
  };
  return {
    selectedPart,
    recordPart,
    setRecordPart,
    finishMin,
    setFinishMin,
    finishSec,
    setFinishSec,
    submitting,
    currentPart,
    handlePartChange,
    handleSubmit,
    handleUpdate,
  };
};
