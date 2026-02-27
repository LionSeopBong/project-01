import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

// 로그아웃
export const logOut = async () => {
  await signOut(auth);
};
