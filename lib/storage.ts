import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * 체육관 이미지 업로드
 * @param gymId 체육관 ID
 * @param file 업로드할 이미지 파일
 * @returns 다운로드 URL
 */
export const uploadGymImage = async (gymId: string, file: File): Promise<string> => {
  const ext = file.name.split(".").pop();
  const storageRef = ref(storage, `gyms/${gymId}/logo.${ext}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

/**
 * 체육관 이미지 삭제
 */
export const deleteGymImage = async (gymId: string) => {
  try {
    const storageRef = ref(storage, `gyms/${gymId}`);
    await deleteObject(storageRef);
  } catch {
    // 이미지 없어도 무시
  }
};
