import { useEffect, useState } from "react";
import { WorkoutRecord } from "@/types/wod";
import { addWorkoutRecord, updateWorkoutRecord } from "@/lib/firestore";
import { Wod } from "@/types/wod";
import { useRouter } from "next/navigation";

export const useRecordForm = (wod: Wod | null, initialRecord?: Partial<WorkoutRecord>) => {
  const router = useRouter();
  const [selectedPart, setSelectedPart] = useState(initialRecord?.wodPart ?? "");
  const [submitting, setSubmitting] = useState(false);

  // 파트별 recordParts 관리
  const [recordParts, setRecordParts] = useState<Record<string, Partial<WorkoutRecord>>>({});

  // 파트별 시간 관리
  const [finishTimes, setFinishTimes] = useState<Record<string, { min: number; sec: number }>>({});

  // 현재 파트의 recordPart
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

  // 현재 파트의 시간
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

  // 수정 페이지용 초기화
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

  // wod 로드 후 첫 파트 자동 선택
  useEffect(() => {
    if (wod && !initialRecord && !selectedPart) {
      setSelectedPart(wod.parts[0].part);
    }
  }, [wod]);

  const handlePartChange = (part: string) => {
    setSelectedPart(part);
  };

  const handleSubmit = async (userId: string, userName: string) => {
    if (!wod) return;
    setSubmitting(true);
    try {
      // 작성된 모든 파트 저장
      for (const part of wod.parts) {
        const partRecord = recordParts[part.part];
        if (!partRecord) continue; // 작성 안 한 파트는 스킵

        const partFinishMin = finishTimes[part.part]?.min ?? 0;
        const partFinishSec = finishTimes[part.part]?.sec ?? 0;

        const record: Omit<WorkoutRecord, "id"> = {
          ...partRecord,
          userId,
          userName,
          wodId: wod.id,
          wodName: wod.title,
          wodPart: part.part,
          wodType: part.type,
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
