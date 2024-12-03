import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CustomersTable from "@/components/CustomerTable/Table";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "The Sleep Company",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="List of Customers" isGoBack={false} />
      <div className="flex flex-col gap-10">
        <CustomersTable />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
