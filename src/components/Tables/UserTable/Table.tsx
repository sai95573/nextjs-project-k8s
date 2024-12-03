"use client";
import { showToast } from "@/app/ui/toast";
import CommonButtonGroup from "@/components/CommonButtonEdit/CommonButtonGroup";
import Skeleton from "@/components/Skeleton/skeleton";
import { useDeleteUserMutation } from "@/store/slice/users/deleteUsersSlice";
import { useGetUsersQuery } from "@/store/slice/users/getUserSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TableThree = () => {
  const router = useRouter();

  const { data: userDetails, isLoading: userLoading } = useGetUsersQuery({});
  const [deleteUser] = useDeleteUserMutation();
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

  console.log("userDetails", userDetails);

  const handleUpdateUser = (userId: any) => {
    router.push(`/forms/create-users?id=${userId}`);
  };

  const handleDeleteRoles = async (userId: any) => {
    try {
      setLoadingUserId(userId); // Set the loading state for the specific role
      await deleteUser({ userId });
    } finally {
      setLoadingUserId(null); // Reset the loading state after deletion completes
      showToast("success", "User deleted successful");
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
              <th className="min-w-[220px] px-4 py-4 font-medium text-white dark:text-white xl:pl-11">
                Email
              </th>
              <th className="min-w-[220px] px-4 py-4 font-medium text-white dark:text-white xl:pl-11">
                Mobile
              </th>
              <th className="min-w-[220px] px-4 py-4 font-medium text-white dark:text-white xl:pl-11">
                Role
              </th>

              <th className="px-4 py-4 font-medium text-white dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {userLoading
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
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              : userDetails?.users?.map((elm: any, key: any) => (
                  <tr key={key}>
                    <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {elm.name}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {elm.email}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {elm.mobile}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {elm.roles?.name}
                      </h5>
                    </td>

                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <CommonButtonGroup
                        onEdit={() => handleUpdateUser(elm?.id)}
                        onDelete={() => handleDeleteRoles(elm?.id)}
                        showDeleteLoadingIcon={loadingUserId === elm?.id}
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
