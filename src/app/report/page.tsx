import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import UsersTable from "@/components/Tables/ReportTable/Table";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// export const metadata: Metadata = {
//   title: "Next.js Tables | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="List of Report" />

      <div className="flex flex-col gap-10">
        <UsersTable />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;