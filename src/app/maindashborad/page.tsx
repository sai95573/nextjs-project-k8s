"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ECommerce from "@/components/Dashboard/E-commerce";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const TablesPage = () => {
  return (
    <DefaultLayout>
      {/* <Breadcrumb pageName="List of Roles" isGoBack={false} /> */}
      <div className="flex flex-col gap-10">
        <ECommerce />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
