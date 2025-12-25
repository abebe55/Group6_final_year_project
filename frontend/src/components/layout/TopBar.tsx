"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
// CORRECT ✅ 
import LoginForm from "@/app/auth/login/page";
import RegisterForm from "@/app/auth/register/page";
import ResetPasswordForm from "@/app/auth/reset-password/page";
import SearchBar from "@/components/common/SearchBar";
import { useRouter } from "next/navigation";

interface Props {
  keyword?: string;
  onSearch?: (keyword: string) => void;
   categories?: string[];           // ✅ ADD
  onCategoryToggle?: (category: string) => void;  // ✅ ADD
}

export default function TopBar({ keyword = "", onSearch }: Props) {
  const [openMenu, setOpenMenu] = useState(false);
  const [modalContent, setModalContent] = useState<"login" | "register" | "reset" | null>(null);
  const router = useRouter();

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md relative">
      {/* Logo / Title */}
      <div className="text-xl font-bold text-green-700">North Wollo Tourism</div>

      {/* Search Bar */}
      <div className="flex-1 mx-4">
        {onSearch && (
          <SearchBar
            initialValue={keyword}
            placeholder="Search by keyword, wereda, kebele..."
            onSearch={onSearch}
          />
        )}
      </div>

      {/* Three-dot / hamburger menu */}
      <div className="relative">
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="flex flex-col justify-between h-6 w-6 focus:outline-none"
        >
          <span className="block h-0.5 w-full bg-gray-700 rounded" />
          <span className="block h-0.5 w-full bg-gray-700 rounded" />
          <span className="block h-0.5 w-full bg-gray-700 rounded" />
        </button>

        {openMenu && (
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border rounded-md z-50">
            <button
              className="block w-full px-4 py-2 hover:bg-green-100 transition"
              onClick={() => {
                setModalContent("login");
                setOpenMenu(false);
              }}
            >
              Login
            </button>
            <button
              className="block w-full px-4 py-2 hover:bg-green-100 transition"
              onClick={() => {
                setModalContent("register");
                setOpenMenu(false);
              }}
            >
              Register
            </button>
            <button
              className="block w-full px-4 py-2 hover:bg-green-100 transition"
              onClick={() => {
                setModalContent("reset");
                setOpenMenu(false);
              }}
            >
              Reset Password
            </button>
          </div>
        )}
      </div>

      {/* Modal for Auth Forms */}
      <Modal isOpen={!!modalContent} onClose={() => setModalContent(null)}>
        {modalContent === "login" && <LoginForm onSuccess={() => setModalContent(null)} />}
        {modalContent === "register" && <RegisterForm onSuccess={() => setModalContent(null)} />}
        {modalContent === "reset" && <ResetPasswordForm />}
      </Modal>
    </div>
  );
}
