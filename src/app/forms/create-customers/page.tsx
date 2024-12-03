/* eslint-disable @next/next/no-img-element */

"use client";
import Input from "@/app/ui/form/input";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useGetCustomersByIdQuery } from "@/store/slice/customer/getCustomerDetails";
import Select from "react-select";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface InputProps {
  description: string;
  permission: string;
  status: string;
  role: string;
  rolesAccess: any;
  email: string;
  mobile: string;
  gender: string;
  createdat: string;
  location: string;
  weight: number;
  height: number;
}

const statusData = [
  { label: "Pillow", value: "Pillow" },
  { label: "Mattress", value: "Mattress" },
];

const CustomerLayout = () => {
  const userID = useSearchParams();
  const router = useRouter();

  const customerid = userID?.get("id");
  console.log("getUserId", customerid);

  const { data: customerDetailsById } = useGetCustomersByIdQuery({
    customerid,
  });

  console.log("customerDetailsById", customerDetailsById);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<InputProps>({
    defaultValues: {
      role: customerDetailsById?.name,
      email: customerDetailsById?.email,
      mobile: customerDetailsById?.mobile,
      gender: customerDetailsById?.gender,
      createdat: customerDetailsById?.createdAt,
      location: customerDetailsById?.location_name,
      weight: customerDetailsById?.weight,
      height: customerDetailsById?.height,
    },
  });

  useEffect(() => {
    if (customerDetailsById) {
      setValue("role", customerDetailsById?.name || "");
      setValue("email", customerDetailsById?.email || "");
      setValue("mobile", customerDetailsById?.mobile || "");
      setValue("gender", customerDetailsById?.gender || "");
      setValue("createdat", customerDetailsById?.createdAt || "");
      setValue("location", customerDetailsById?.location_name || "");
      setValue("weight", customerDetailsById?.weight || "");
      setValue("height", customerDetailsById?.height || "");
    }
  }, [customerDetailsById, setValue]);

  const handleDeviceId = (id: any) => {
    router.push(`/forms/create-device?id=${id}`);
  };

  // Handle change event for the select element
  const handleSelectChange = (event: any) => {
    console.log("event", event?.target);
    const selectedDeviceId = event.target.value;
    if (selectedDeviceId) {
      handleDeviceId(selectedDeviceId); // Pass the device_id to handleDeviceId
    }
  };

  // Define options for react-select
  const deviceOptions = customerDetailsById?.device?.map((item: any) => ({
    value: `${customerid}&deviceId=${item?.device_id}`,
    // label: `${item?.device_id} / ${item?.device_name ? item?.device_name : ""} / ${item?.device_type}`,
    label: `${item?.device_id ? `${item?.device_id} /` : ""} ${item?.device_name ? `${item?.device_name} /` : ""} ${item?.device_type ? `${item?.device_type} ` : ""}`,
  }));
  console.log("customerDetailsById?.device", customerDetailsById?.device);
  const handleChange = (selectedOption: any) => {
    if (selectedOption) {
      handleDeviceId(selectedOption.value); // Call your device ID handler
      router.push(`/forms/create-device?id=${selectedOption.value}`);
    }
  };

  return (
    <DefaultLayout>
      {/* <Breadcrumb pageName="CustomerLayout" /> */}
      <Breadcrumb pageName="Customer Details" isGoBack={true} />

      <>
        {/* <Accordion title="Customer Details"> */}
        <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            {/* <div className="mb-7 w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Customer ID
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
            </div> */}

            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Name
              </label>

              <Input
                lang={""}
                type="text"
                {...register("role", {
                  required: `Please enter role`,
                })}
                placeholder="Please Enter Role"
                error={errors.role?.message}
                readOnly
              />
            </div>
            <div className="mb-7 w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Gender
              </label>
              <Input
                lang={""}
                type="text"
                {...register("gender", {
                  required: `Please enter role`,
                })}
                placeholder="Please Enter Role"
                error={errors.role?.message}
                readOnly
              />
            </div>
          </div>
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="mb-7 w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Email
              </label>
              <Input
                lang={""}
                type="text"
                {...register("email", {
                  required: `Please enter role`,
                })}
                placeholder="Please Enter Role"
                error={errors.role?.message}
                readOnly
              />
            </div>

            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Phone
              </label>

              <Input
                lang={""}
                type="text"
                {...register("mobile", {
                  required: `Please enter role`,
                })}
                placeholder="Please Enter Role"
                error={errors.role?.message}
                readOnly
              />
            </div>
          </div>
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            {/* <div className="mb-7 w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Gender
              </label>
              <Input
                lang={""}
                type="text"
                {...register("gender", {
                  required: `Please enter role`,
                })}
                placeholder="Please Enter Role"
                error={errors.role?.message}
              />
            </div> */}

            {/* <div className="w-full xl:w-1/2">
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
            </div> */}
          </div>
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="mb-7 w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Registration Date
              </label>
              <Input
                lang={""}
                type="text"
                {...register("createdat", {
                  required: `Please enter role`,
                })}
                placeholder="Please Enter Role"
                error={errors.role?.message}
                readOnly
              />
            </div>
            <div className="mb-7 w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Location
              </label>
              <Input
                lang={""}
                type="text"
                {...register("location", {
                  required: `Please enter role`,
                })}
                placeholder="Please Enter Role"
                error={errors.role?.message}
                readOnly
              />
            </div>
          </div>
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="mb-7 w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Weight
              </label>
              <Input
                lang={""}
                type="text"
                {...register("weight", {
                  required: `Please enter role`,
                })}
                placeholder="Please Enter Role"
                error={errors.role?.message}
                readOnly
              />
            </div>
            <div className="mb-7 w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Height
              </label>
              <Input
                lang={""}
                type="text"
                {...register("height", {
                  required: `Please enter role`,
                })}
                placeholder="Please Enter Role"
                error={errors.role?.message}
                readOnly
              />
            </div>
          </div>
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="mb-7 w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Customer Connected Device
              </label>
              {/* <select
                id="business_type"
                {...register("status", {
                  required: "status is required",
                })}
                defaultValue=""
                lang=""
                onChange={handleSelectChange}
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-4 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input "
              >
                {customerDetailsById
                  ? customerDetailsById?.device?.map((item: any) => (
                      <option
                        key={item?.id}
                        onClick={() => handleDeviceId(item?.id)}
                        value={item?.id}
                      >
                        {item?.device_id} / {item?.device_name} /
                        {item?.device_type}
                      </option>
                    ))
                  : ""}
              </select> */}
              <Select
                options={deviceOptions}
                onChange={handleChange}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>
        {/* </Accordion> */}
        {/* <Accordion title={`Device Detail`}>
          <div>
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="mb-7 w-full xl:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Mac ID
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
                  Device Type
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
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="mb-7 w-full xl:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Product Status
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
                  Device Connected Date
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
            </div>
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Device Last Connected Date
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
            </div>
          </div>

          <div>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-[#4C8691] text-left dark:bg-meta-4">
                    <th className="min-w-[220px] px-4 py-4 font-medium text-white dark:text-white xl:pl-11">
                      Device ID
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-white dark:text-white">
                      Device Name
                    </th>

                    <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                      Device Type
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-white dark:text-white">
                      Device Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {elm?.device?.map((item: any, key: any) => (
                    <tr key={key}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.id}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          <p className="text-sm">{item.device_name}</p>
                        </p>
                      </td>

                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p>{item?.device_type}</p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p>{item?.device_description}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Accordion> */}
      </>
    </DefaultLayout>
  );
};

export default CustomerLayout;
