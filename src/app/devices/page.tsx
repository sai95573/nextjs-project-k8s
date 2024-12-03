"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DeviceTable from "@/components/Tables/DeviceTable/Table";

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb
        pageName="List of Device to Customer Mapping"
        isGoBack={false}
      />
      <div className="flex flex-col gap-10">
        <DeviceTable />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
