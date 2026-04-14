import { useEffect, useState } from "react";
import { WorkoutRecord } from "@/types/wod";
import { addWorkoutRecord, updateWorkoutRecord } from "@/lib/firestore";
import { Wod } from "@/types/wod";
import { useRouter } from "next/navigation";

export const useRecordForm = (wod: Wod | null, initialRecord?: Partial<WorkoutRecord>) => {
  const router = useRouter();
  const [selectedPart, setSelectedPart] = useState(initialRecord?.wodPart ?? "");
  const [submitting, setSubmitting] = useState(false);

  const [recordParts, setRecordParts] = useState<Record<string, Partial<WorkoutRecord>>>({});
  const [finishTimes, setFinishTimes] = useState<Record<string, { min: number; sec: number }>>({});

  const recordPart = recordParts[selectedPart] ?? {
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
  };

  const finishMin = finishTimes[selectedPart]?.min ?? 0;
  const finishSec = finishTimes[selectedPart]?.sec ?? 0;

  const setFinishMin = (min: number) => {
    setFinishTimes((prev) => ({
      ...prev,
      [selectedPart]: { ...prev[selectedPart], min },
    }));
  };

  const setFinishSec = (sec: number) => {
    setFinishTimes((prev) => ({
      ...prev,
      [selectedPart]: { ...prev[selectedPart], sec },
    }));
  };

  const setRecordPart = (data: Partial<WorkoutRecord>) => {
    setRecordParts((prev) => ({ ...prev, [selectedPart]: data }));
  };

  const currentPart = wod?.parts.find((part) => part.part === selectedPart);

  useEffect(() => {
    if (!initialRecord) return;
    setRecordParts({ [initialRecord.wodPart ?? ""]: initialRecord });
    setSelectedPart(initialRecord.wodPart ?? "");
    setFinishTimes({
      [initialRecord.wodPart ?? ""]: {
        min: Math.floor((initialRecord.finishTime ?? 0) / 60),
        sec: (initialRecord.finishTime ?? 0) % 60,
      },
    });
  }, [initialRecord?.id]);

  useEffect(() => {
    if (wod && !initialRecord && !selectedPart) {
      setSelectedPart(wod.parts[0].part);
    }
  }, [wod]);

  const handlePartChange = (part: string) => {
    setSelectedPart(part);
  };

  // gymId 파라미터 추가
  const handleSubmit = async (userId: string, userName: string, gender: string, gymId: string) => {
    if (!wod) return;
    setSubmitting(true);
    try {
      for (const part of wod.parts) {
        const partRecord = recordParts[part.part] ?? {
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
        };
        // if (!partRecord) continue;

        const partFinishMin = finishTimes[part.part]?.min ?? 0;
        const partFinishSec = finishTimes[part.part]?.sec ?? 0;

        const record: Omit<WorkoutRecord, "id"> = {
          ...partRecord,
          userId,
          userName,
          gymId,
          wodId: wod.id,
          wodName: wod.title,
          wodPart: part.part,
          wodType: part.type,
          gender,
          completedAt: wod.date,
          isDNF: partRecord.isDNF ?? false,
          level: partRecord.level ?? "R'xd",
          weights: partRecord.weights ?? [],
          wodTeam: part.isTeam,
          partnerName: partRecord.partnerName ?? "",
          partnerWeight: partRecord.partnerWeight ?? 0,
          partnerDifferentWeight: partRecord.partnerDifferentWeight ?? false,
          finishTime: partFinishMin * 60 + partFinishSec,
          createdAt: null,
        };
        await addWorkoutRecord(record);
      }
      router.push("/record");
    } catch (error) {
      console.error(error);
      alert("제출 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const initAllParts = (records: WorkoutRecord[]) => {
    const parts: Record<string, Partial<WorkoutRecord>> = {};
    const times: Record<string, { min: number; sec: number }> = {};

    records.forEach((r) => {
      parts[r.wodPart] = r;
      times[r.wodPart] = {
        min: Math.floor((r.finishTime ?? 0) / 60),
        sec: (r.finishTime ?? 0) % 60,
      };
    });

    setRecordParts(parts);
    setFinishTimes(times);
    setSelectedPart(records[0]?.wodPart ?? "");
  };

  // gymId 파라미터 추가
  const handleUpdate = async (userId: string, userName: string, existingRecords: WorkoutRecord[], gymId: string) => {
    if (!wod || !currentPart) return;
    setSubmitting(true);
    try {
      for (const part of wod.parts) {
        const partRecord = recordParts[part.part];
        if (!partRecord) continue;
        const partFinishMin = finishTimes[part.part]?.min ?? 0;
        const partFinishSec = finishTimes[part.part]?.sec ?? 0;

        const record: Omit<WorkoutRecord, "id"> = {
          ...partRecord,
          userId,
          userName,
          gymId,
          wodId: wod.id,
          wodName: wod.title,
          wodPart: part.part,
          wodType: part.type,
          completedAt: partRecord.completedAt ?? wod.date,
          isDNF: partRecord.isDNF ?? false,
          level: partRecord.level ?? "R'xd",
          weights: partRecord.weights ?? [],
          wodTeam: part.isTeam,
          partnerName: partRecord.partnerName ?? "",
          partnerWeight: partRecord.partnerWeight ?? 0,
          partnerDifferentWeight: partRecord.partnerDifferentWeight ?? false,
          finishTime: partFinishMin * 60 + partFinishSec,
          createdAt: partRecord.createdAt ?? null,
        };
        const existing = existingRecords.find((r) => r.wodPart === part.part);
        if (existing) {
          await updateWorkoutRecord(existing.id, record);
        } else {
          await addWorkoutRecord(record);
        }
      }
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
    initAllParts,
    finishTimes,
  };
};
