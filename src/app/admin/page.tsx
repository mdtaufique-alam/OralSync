import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

async function AdminPage() {
  const user = await currentUser();

  // user is not logged in
  if (!user) redirect("/");

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const userEmail = user.emailAddresses[0]?.emailAddress;

  // Debug logging
  console.log("Admin Email from env:", adminEmail);
  console.log("User Email:", userEmail);
  console.log("Is admin:", userEmail === adminEmail);

  // user is not the admin
  if (!adminEmail || userEmail !== adminEmail) {
    console.log("Redirecting to dashboard - not admin");
    redirect("/dashboard");
  }

  console.log("Access granted to admin dashboard");
  return <AdminDashboardClient />;
}

export default AdminPage;
