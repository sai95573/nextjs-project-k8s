"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import UsersTable from "@/components/Tables/UserTable/Table";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Button from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// export const metadata: Metadata = {
//   title: "Next.js Tables | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };

const TablesPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = () => {
    setIsLoading(true);
    router.push("/forms/create-users");
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  };
  return (
    <DefaultLayout>
      <Breadcrumb pageName="List of Users" isGoBack={false} />
      <div className="mb-6 flex justify-end">
        <Button
          variant="signupfooter"
          onClick={handleCreateUser}
          loading={isLoading}
        >
          Create User
        </Button>
      </div>

      <div className="flex flex-col gap-10">
        <UsersTable />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
