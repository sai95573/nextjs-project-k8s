/* eslint-disable react/jsx-key */
"use client";
import Input from "@/app/ui/form/input";
import { showToast } from "@/app/ui/toast";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Button from "@/components/ui/button";
import { useAddRolesMutation } from "@/store/slice/roles/addRolesSlice";
import { useGetRolesByIdQuery } from "@/store/slice/roles/getRolesSlice";
import { useUpdateRolesMutation } from "@/store/slice/roles/updateRolesSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface InputProps {
  description: string;
  permission: string;
  status: string;
  role: string;
  rolesAccess: any;
}

const statusData = [
  {
    label: "Active",
    value: "Active",
  },
  {
    label: "In-Active",
    value: "In-Active",
  },
];
const statusData1 = [
  {
    label: "true",
    value: "true",
  },
  {
    label: "false",
    value: "false",
  },
];

const CreateRoleForm = () => {
  const roleID = useSearchParams();
  const roleId = roleID?.get("id");
  const { data: getRolesDetailsById } = useGetRolesByIdQuery(
    { roleId },
    { skip: !roleId },
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<InputProps>({
    defaultValues: {
      role: getRolesDetailsById?.role?.name,
      status: getRolesDetailsById?.role?.status,
      permission: getRolesDetailsById?.role?.permission,
    },
  });

  useEffect(() => {
    if (getRolesDetailsById) {
      setValue("role", getRolesDetailsById?.role?.name || "");
      setValue("status", getRolesDetailsById?.role?.status || "");
      setValue("permission", getRolesDetailsById?.role?.permission || "");
    }
  }, [getRolesDetailsById, setValue]);

  const router = useRouter();

  const [addRolesMutation, { isLoading }] = useAddRolesMutation();
  const [updateRolesMutation, { isLoading: updateLoading }] =
    useUpdateRolesMutation();

  async function onSubmit({ status, role, permission }: InputProps) {
    console.log("status", status, role, permission);

    if (!roleId) {
      try {
        await addRolesMutation({
          name: role,
          status,
          permission,
        });
        showToast("success", "Roles Created Successful");
        router.push("/roles");
      } catch (error) {
        console.log("Please");
      }
    } else {
      try {
        await updateRolesMutation({
          id: Number(roleId), // Replace with dynamic id
          name: role,
          permission,
          status,
        });
      } catch (error) {
        console.error("Failed to update role", error);
      }
    }

    router.push("/roles");
  }
  return (
    <DefaultLayout>
      <Breadcrumb
        pageName={roleId ? "Edit Role" : "Add Roles"}
        isGoBack={true}
      />

      <div className="grid">
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Fill Details
              </h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6.5">
                <div className=" flex flex-col gap-6 xl:flex-row">
                  <div className="mb-7 w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Role
                    </label>
                    <Input
                      lang={""}
                      type="text"
                      {...register("role", {
                        required: `Please enter role`,
                      })}
                      placeholder="Please Enter Role"
                      error={errors.role?.message}
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Status
                    </label>

                    <select
                      id="business_type"
                      {...register("status", {
                        required: "status is required",
                      })}
                      defaultValue=""
                      lang=""
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-4 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input "
                    >
                      {statusData
                        ? statusData?.map((item: any) => (
                            <option key={item?.label} value={item?.label}>
                              {item?.label}
                            </option>
                          ))
                        : ""}
                    </select>
                    {errors.status && (
                      <p className=" mt-1 text-sm text-rose-400">
                        {errors.status.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-full py-4 xl:w-1/2">
                  {/* <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      {...register("permission")}
                      className="form-checkbox"
                    />
                    <span className="ml-2">Is Admin</span>
                  </label>
                  {errors.permission && (
                    <p className="mt-1 text-red">{errors.permission.message}</p>
                  )} */}
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Select isAdmin
                  </label>

                  <select
                    {...register("permission")}
                    lang=""
                    className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-4 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input "
                  >
                    {statusData1
                      ? statusData1?.map((item: any) => (
                          <option key={item?.label} value={item?.label}>
                            {item?.label}
                          </option>
                        ))
                      : ""}
                  </select>
                </div>

                <Button
                  variant="signupfooter"
                  loading={isLoading || updateLoading}
                >
                  {roleId ? "Update" : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CreateRoleForm;
