import { redirect } from "next/navigation";

export default function Page() {
  // Skip login in development mode
  if (process.env.NODE_ENV === "development") {
    redirect("/dashboard");
  }

  // Redirect root to login page
  redirect("/login");
}