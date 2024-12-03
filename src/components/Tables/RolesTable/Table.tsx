"use client";
import { showToast } from "@/app/ui/toast";
import CommonButtonGroup from "@/components/CommonButtonEdit/CommonButtonGroup";
import Skeleton from "@/components/Skeleton/skeleton";
import { useDeleteRlesMutation } from "@/store/slice/roles/deleteRolesSlice";
import { useGetRolestableQuery } from "@/store/slice/roles/getRolesSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TableThree = () => {
  const router = useRouter();
  const [loadingRoleId, setLoadingRoleId] = useState<number | null>(null);

  const { data: rolesDetails, isLoading: rolesLoading } = useGetRolestableQuery(
    {},
  );
  const [deleteRoles, { isLoading }] = useDeleteRlesMutation();

  const handleUpdateUser = (roleId: any) => {
    router.push(`/forms/create-role?id=${roleId}`);
  };

  const handleDeleteRoles = async (roleId: any) => {
    try {
      setLoadingRoleId(roleId);
      await deleteRoles({ roleId });
    } finally {
      setLoadingRoleId(null);
      showToast("success", "Roles deleted successful");
    }
  };

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#4C8691] text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-white dark:text-white xl:pl-11">
                Name
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                Status
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                {/* Permission */}
              </th>
              <th className="px-4 py-4 font-medium text-white dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rolesLoading
              ? Array.from({ length: 7 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              : rolesDetails?.roles?.map((elm: any, key: any) => (
                  <tr key={key}>
                    <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {elm.name}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p>{elm?.status}</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {/* <p>{elm?.permission}</p> */}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <CommonButtonGroup
                        onEdit={() => handleUpdateUser(elm?.id)}
                        onDelete={() => handleDeleteRoles(elm?.id)}
                        showDeleteLoadingIcon={loadingRoleId === elm?.id}
                      />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableThree;
