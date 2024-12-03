"use client";

import Accordion from "@/components/Accordion/Accordion";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import {
  convertTimestampToCustomFormat,
  convertTimestampToLocalTime,
  convertToIST,
  convertToISTs,
  findMissingDates,
  formatDateToCustomFormat,
} from "@/lib/dashboard/dateConvertToIST";
import { useGetSyncDataQuery } from "@/store/slice/sync/getSyncSlice";
import { useRouter, useSearchParams } from "next/navigation";

const SyncData = () => {
  const router = useRouter();

  const deviceId = useSearchParams();
  const deviceIds = deviceId?.get("deviceId");
  const customerNum = deviceId?.get("customerNum");
  const customerId = deviceId?.get("customerId");

  const { data: syncedData } = useGetSyncDataQuery({
    id: customerId,
  });

  console.log("syncedData", syncedData);

  // const synedRecodrs = [1729621800, 1729612305, 1729576332, 1729572772, 1729491784];
  // const missingDates = findMissingDates(synedRecodrs);
  // console.log("Missing Dates:", missingDates);

  const synedRecodrs = syncedData?.data?.syncedRecords?.map(
    (item) => item?.syncDateUnix,
  );

  const missingDates = findMissingDates(synedRecodrs);
  console.log("Missing Dates:", missingDates);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Sync History List" isGoBack={true} />
      <>
        <div className="flex items-center gap-10">
          <div>
            <span>Last Sync Date:</span>{" "}
            <span className=" font-bold">
              {convertToIST(syncedData?.data?.lastSyncDate)}
            </span>
          </div>

          <div>
            <span>Mobile Number:</span>{" "}
            <span className=" font-bold">{customerNum}</span>
          </div>
        </div>
        <Accordion title="Synced & UnSynced Days  (Last 30 days)">
          <>
            <div>
              <div className="max-w-full overflow-x-auto">
                <div className="flex">
                  <div className="w-1/2">
                    <div className="bg-[#4C8691] text-left dark:bg-meta-4">
                      <div className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                        Synced Dates
                      </div>
                    </div>

                    <div>
                      {syncedData?.data?.syncedRecords.map(
                        (date: any, index: any) => (
                          <div
                            key={index}
                            className="border-gray-200 dark:border-gray-700"
                          >
                            <div className="min-w-[120px] px-4 py-4">
                              {formatDateToCustomFormat(date?.syncDateGMT)}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="w-1/2">
                    <div className="bg-[#4C8691] text-left dark:bg-meta-4">
                      <div className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                        Unsynced Dates
                      </div>
                    </div>

                    <div>
                      {syncedData?.data?.unsyncedDates
                        ?.slice()
                        .reverse()
                        .map((item: any, idx: any) => (
                          <div
                            key={idx}
                            className="border-gray-200 dark:border-gray-700"
                          >
                            <div className="min-w-[120px] px-4 py-4">
                              {item}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <div>
              <div className="max-w-full overflow-x-auto">
                <table className=" w-full table-auto">
                  <thead>
                    <tr className=" bg-[#4C8691] text-left dark:bg-meta-4">
                      <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                        SyncedDates
                      </th>
                      <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                        Unsynced Dates
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {syncedData?.data?.syncedRecords.map(
                      (date: any, index: any) => (
                        <tr key={index}>
                          <td className="px-4 py-4">
                            {convertTimestampToCustomFormat(date?.syncDateUnix)}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div> */}
          </>
        </Accordion>
      </>
    </DefaultLayout>
  );
};

export default SyncData;

{
  /* <div>
              <div className="max-w-full overflow-x-auto">
                <div className="flex">
                  <div className="w-1/2">
                    <div className="bg-[#4C8691] text-left dark:bg-meta-4">
                      <div className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                        Synced Dates
                      </div>
                    </div>

                    <div>
                      {syncedData?.data?.syncedRecords.map(
                        (date: any, index: any) => (
                          <div
                            key={index}
                            className="border-gray-200 dark:border-gray-700"
                          >
                            <div className="min-w-[120px] px-4 py-4">
                              {formatDateToCustomFormat(date?.syncDateGMT)}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                
                  <div className="w-1/2">
                    <div className="bg-[#4C8691] text-left dark:bg-meta-4">
                      <div className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                        Unsynced Dates
                      </div>
                    </div>

                    <div>
                      {syncedData?.data?.unsyncedDates?.map(
                        (item: any, idx: any) => (
                          <div
                            key={idx}
                            className="border-gray-200 dark:border-gray-700"
                          >
                            <div className="min-w-[120px] px-4 py-4">
                              {item}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div> */
}
