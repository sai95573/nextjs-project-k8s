/* eslint-disable react/jsx-key */
"use client";
import Accordion from "@/components/Accordion/Accordion";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Skeleton from "@/components/Skeleton/skeleton";
import Button from "@/components/ui/button";
import { convertToIST } from "@/lib/dashboard/dateConvertToIST";
import {
  useGetDeviceByIdQuery,
  useGetFullDeviceDetailsQuery,
} from "@/store/slice/device/getAllDeviceDetails";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

interface InputProps {
  description: string;
  permission: string;
  status: string;
  role: string;
  rolesAccess: any;
}

const CreateRoleForm = () => {
  const userID = useSearchParams();
  const userid = userID?.get("id");
  const deviceid = userID?.get("deviceId");

  const {
    formState: { errors },
  } = useForm<InputProps>({});

  const router = useRouter();

  const { data: deviceDetails, isLoading: deviceLoading1 } =
    useGetFullDeviceDetailsQuery({});
  const { data: deviceDetailsById } = useGetDeviceByIdQuery({
    userId: userid,
    deviceId: deviceid,
  });

  console.log("deviceDetailsById", deviceDetailsById);

  const filterDevice = deviceDetails?.data?.filter(
    (item: any) => item?.id === Number(userid),
  );

  const gotoReport = (id: any, deviceId: any) => {
    router.push(`/maindashborad?id=${userid}&deviceid=${deviceId}`);
  };

  function formatDate(startDate: any) {
    // Define the date
    const date = new Date(startDate);

    // Extract year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, "0");

    // Extract hours and minutes
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Combine them into the yyyy-mm-dd (hh:mm) format
    return `${year}-${month}-${day} (${hours}:${minutes})`;
  }

  const deviceId = useSearchParams();
  const customerId = deviceId?.get("customerId");

  const handleSync = (customerMobile: any, customerId: any) => {
    console.log("customerId", customerId);
    router.push(`/sync?customerNum=${customerMobile}&customerId=${userid}`);
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Device Details" isGoBack={true} />
      <div>
        {deviceLoading1 ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div className="bg-white px-4 py-4 shadow-2">
              <Skeleton className="h-6 w-full" />
            </div>
          ))
        ) : (
          <div className="p-2">
            <>
              <div>
                {deviceDetailsById?.data?.map((elm: any) => (
                  <>
                    <div className="flex items-center justify-between">
                      <div className=" text-xl">
                        <span>Device ID:</span>{" "}
                        <span className=" font-bold">{elm?.device_id}</span>
                      </div>
                      <div>
                        <Button
                          variant="signupfooter"
                          className="mr-2"
                          onClick={() => gotoReport(elm?.id, elm?.device_id)}
                        >
                          Go To Report
                        </Button>

                        <Button
                          type="submit"
                          variant="signupfooter"
                          onClick={() =>
                            handleSync(elm?.users?.mobile, customerId)
                          }
                        >
                          Sync History
                        </Button>
                      </div>
                    </div>
                    <Accordion
                      title={
                        <div className="flex gap-12 text-sm">
                          <div>Customer Number: {elm?.users?.mobile} </div>
                          <div>Customer Name: {elm?.users?.name}</div>
                          <div>Mac ID: {elm?.device_mac}</div>
                          <div>
                            Registered Date: {formatDate(elm?.createdAt)}
                          </div>
                        </div>
                      }
                    >
                      <>
                        <div>
                          <div className="max-w-full overflow-x-auto">
                            <table className="w-full table-auto">
                              <thead>
                                <tr className="bg-[#4C8691] text-left dark:bg-meta-4">
                                  <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                                    Most Recent Device
                                  </th>

                                  <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                                    Device Type
                                  </th>
                                  {/* <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                                    Last Synced Date
                                  </th>
                                  <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                                    UnSynced Date
                                  </th> */}
                                </tr>
                              </thead>
                              {elm?.deviceDetails?.map((item: any) => (
                                <>
                                  <tbody>
                                    <tr>
                                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <p>
                                          {formatDate(item?.connected_date)}
                                        </p>
                                      </td>

                                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <p>{elm?.device_type}</p>
                                      </td>

                                      {/* <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        dsf
                                      </td> */}
                                    </tr>
                                  </tbody>
                                </>
                              ))}
                            </table>
                          </div>
                        </div>
                        <div>
                          <div className="max-w-full overflow-x-auto">
                            <div className="flex">
                              {/* <div className="w-1/4">
                                <div className="bg-[#4C8691] text-left dark:bg-meta-4">
                                  <div className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                                    Most Recent Device
                                  </div>
                                </div>
                                <div>
                                  {elm?.deviceDetails?.map(
                                    (item: any, index: any) => (
                                      <div
                                        key={index}
                                        className="border-gray-200 px-4 py-5 dark:border-strokedark"
                                      >
                                        <p>
                                          {formatDate(item?.connected_date)}
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div> */}

                              {/* Device Type Section */}
                              {/* <div className="w-1/4">
                                <div className="bg-[#4C8691] text-left dark:bg-meta-4">
                                  <div className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                                    Device Type
                                  </div>
                                </div>
                                <div>
                                  {elm?.deviceDetails?.map(
                                    (item: any, index: any) => (
                                      <div
                                        key={index}
                                        className="border-gray-200  px-4 py-5 dark:border-strokedark"
                                      >
                                        <p>{elm?.device_type}</p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div> */}

                              {/* Last Synced Date Section */}
                              {/* <div className="w-1/4">
                                <div className="bg-[#4C8691] text-left dark:bg-meta-4">
                                  <div className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                                    Last Synced Date
                                  </div>
                                </div>
                                <div>
                                  {deviceDetailsById?.syncData?.syncedRecords?.map(
                                    (date: any, index: any) => (
                                      <div
                                        key={index}
                                        className="border-gray-200  px-4 py-5 dark:border-strokedark"
                                      >
                                        <p>
                                          {convertToIST(date?.syncDateUnix)}
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div> */}

                              {/* Unsynced Date Section */}
                              {/* <div className="w-1/4">
                                <div className="bg-[#4C8691] text-left dark:bg-meta-4">
                                  <div className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                                    Unsynced Date
                                  </div>
                                </div>
                                <div>
                                  {deviceDetailsById?.syncData?.unsyncedDates?.map(
                                    (unsyncedDate: any, idx: any) => (
                                      <div
                                        key={idx}
                                        className="border-gray-200  px-4 py-5 dark:border-strokedark"
                                      >
                                        <p>{unsyncedDate}</p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div> */}
                            </div>
                          </div>
                        </div>
                      </>
                    </Accordion>
                  </>
                ))}
              </div>
            </>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default CreateRoleForm;
