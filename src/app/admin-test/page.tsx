import { currentUser } from "@clerk/nextjs/server";

export default async function AdminTestPage() {
  const user = await currentUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Access Test</h1>
      <div className="space-y-4">
        <div>
          <strong>User Email:</strong> {userEmail || "Not logged in"}
        </div>
        <div>
          <strong>Admin Email (from env):</strong> {adminEmail || "Not set"}
        </div>
        <div>
          <strong>Is Admin:</strong> {userEmail === adminEmail ? "✅ YES" : "❌ NO"}
        </div>
        <div>
          <strong>User ID:</strong> {user?.id || "Not logged in"}
        </div>
        <div>
          <strong>User Name:</strong> {user?.firstName} {user?.lastName}
        </div>
      </div>
      
      {userEmail === adminEmail && (
        <div className="mt-8 p-4 bg-green-100 border border-green-400 rounded">
          <h2 className="text-lg font-semibold text-green-800">✅ Admin Access Granted!</h2>
          <p className="text-green-700">You have admin privileges.</p>
          <a href="/admin" className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Go to Admin Dashboard
          </a>
        </div>
      )}
      
      {userEmail !== adminEmail && (
        <div className="mt-8 p-4 bg-red-100 border border-red-400 rounded">
          <h2 className="text-lg font-semibold text-red-800">❌ Admin Access Denied</h2>
          <p className="text-red-700">You don't have admin privileges.</p>
        </div>
      )}
    </div>
  );
}

