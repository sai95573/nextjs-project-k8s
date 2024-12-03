"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import RolesTable from "@/components/Tables/RolesTable/Table";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TablesPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = () => {
    setIsLoading(true);
    router.push("/forms/create-role");
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  };
  return (
    <DefaultLayout>
      <Breadcrumb pageName="List of Roles" isGoBack={false} />
      <div className="mb-6 flex justify-end">
        <Button
          variant="signupfooter"
          onClick={handleCreateUser}
          loading={isLoading}
        >
          Create Roles
        </Button>
      </div>

      <div className="flex flex-col gap-10">
        <RolesTable />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
