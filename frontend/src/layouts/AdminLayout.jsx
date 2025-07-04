import SidebarAdmin from "../components/admin/SidebarAdmin";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAdmin />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
