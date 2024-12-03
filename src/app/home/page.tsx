import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Home from "@/components/Home/Home";

export const metadata: Metadata = {
  title: "Next.js Tables | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const HomePage = () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-10">{/* <Home /> */}</div>
    </DefaultLayout>
  );
};

export default HomePage;
