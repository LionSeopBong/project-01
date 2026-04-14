import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { PUBLIC_GYM_ID } from "./constants";

const provider = new GoogleAuthProvider();

// Google 로그인
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Firestore에 유저 존재 여부 확인
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // 신규 유저면 users 컬렉션에 기본 데이터 생성
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: user.displayName ?? "",
      profileImage: user.photoURL ?? "",
      gender: "",
      weight: 0,
      height: 0,
      unit: "kg",
      createdAt: new Date(),
    });
    return { user, isNewUser: true };
  }

  return { user, isNewUser: false };
};

// 익명 로그인
export const signInAsGuest = async () => {
  const result = await signInAnonymously(auth);
  const user = result.user;
  //익명이라 존재여부 확인 불필요
  await setDoc(doc(db, "users", user.uid), {
    name: "Guest",
    profileImage: "",
    gender: "",
    weight: 0,
    height: 0,
    unit: "kg",
    role: "user",
    currentGymId: PUBLIC_GYM_ID,
    createdAt: new Date(),
  });
  return { user, isNewUser: true };
};

// 로그아웃
export const logOut = async () => {
  await signOut(auth);
};
