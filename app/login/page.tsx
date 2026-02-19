"use client";

import { useForm } from "react-hook-form";
type LoginFormData = {
  email: string;
  password: string;
};
export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isSubmitted, errors },
  } = useForm<LoginFormData>();
  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit(async (data) => {
          await new Promise((r) => setTimeout(r, 1000));
          console.log("딜레이됨");
          alert(JSON.stringify(data));
        })}
        className="flex flex-col p-5 max-w-[375px] w-full mx-auto "
      >
        <label htmlFor="email" className="my-3 font-bold text-lg">
          이메일
        </label>
        <input
          className="border p-2 text-lg aria-[invalid=false]:border-green-500 aria-[invalid=true]:border-red-500"
          id="email"
          type="email"
          placeholder="text@email.com"
          {...register("email", {
            required: "이메일은 필수 입력입니다.",
            pattern: { value: /\S+@\S+\.\S+/, message: "이메일 형식에 맞지 않습니다." },
          })}
          aria-invalid={isSubmitted ? (errors.email ? "true" : "false") : undefined}
        />
        {errors.email && <small role="alert">{errors.email.message}</small>}
        <label htmlFor="password" className="my-3 font-bold text-lg">
          비밀번호
        </label>
        <input
          className="border p-2 text-lg aria-[invalid=false]:border-green-500 aria-[invalid=true]:border-red-500"
          id="password"
          type="password"
          placeholder="********"
          {...register("password", {
            required: "비밀번호는 필수 입력입니다.",
            minLength: { value: 8, message: "8자리 이상 비밀먼호를 입력해주세요." },
          })}
          aria-invalid={isSubmitted ? (errors.password ? "true" : "false") : undefined}
        />
        {errors.password && <small role="alert">{errors.password.message}</small>}
        <button type="submit" disabled={isSubmitting} className="my-4 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 rounded-md p-4 text-white">
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </>
  );
}
