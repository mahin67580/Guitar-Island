import { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login — Guitar Island",
};

export default function AdminLoginPage() {
  return <LoginForm />;
}