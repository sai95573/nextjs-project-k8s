"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Input from "@/app/ui/form/input";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { usePushNotificationMutation } from "@/store/slice/pushnotification/sendnotification";
import { showToast } from "../ui/toast";
import { useDeviceTypeQuery } from "@/store/slice/pushnotification/devicetypeFilter";
import { AiOutlineDown } from "react-icons/ai";
import { useEffect, useState } from "react";

interface InputProps {
  description: string;
  permission: string;
  type: string;
  status: string;
  title: string;
  rolesAccess: any;
}

const accessData = [
  {
    label: "All",
    value: "All",
  },
  {
    label: "Retails - 9000000000",
    value: "Retails - 9000000000",
  },
  {
    label: "Retails2 - 9000000000",
    value: "Retails2 - 9000000000",
  },
  {
    label: "Retails3 - 9000000000",
    value: "Retails3 - 9000000000",
  },
];
const accessData1 = [
  {
    label: "Pillow",
    value: "Pillow",
  },
  {
    label: "Mattress",
    value: "Mattress",
  },
];

const TablesPage = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(accessData1[0].value);
  console.log("selectedType", selectedType);

  const handleCreateUser = () => {
    router.push("/forms/create-role");
  };

  const [postPushNotification, { isLoading }] = usePushNotificationMutation();
  const { data: devicetype } = useDeviceTypeQuery({
    deviceType: selectedType,
  });

  console.log("devicetype", devicetype);

  const usersOption = devicetype?.data?.map((item: any) => ({
    label: `${item?.name}-${item?.mobile}`, // Replace 'name' with the correct property
    value: item.id, // Replace 'id' with the correct property
  }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InputProps>({});
  const onSubmit = ({ title, description, permission }: InputProps) => {
    console.log("permission", permission);
    postPushNotification({
      message: {
        title,
        body: description,
      },
      userIds: permission,
    });
    showToast("success", "Notification Sent Successful");
    reset();
  };

  const handleSelectChange = (e: any) => {
    setSelectedType(e.target.value);
  };
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Notification" isGoBack={false} />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-10">
              <div className=" flex flex-col gap-6 xl:flex-row">
                <div className="mb-7 w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Title
                  </label>
                  <Input
                    lang={""}
                    type="text"
                    {...register("title", {
                      required: `Please enter title`,
                    })}
                    placeholder="Please Enter Role"
                    error={errors.title?.message}
                  />
                </div>

                {/* <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Device Type
              </label>

              <Controller
                name="permission"
                control={control}
                // defaultValue={[]}
                rules={{
                  required: "At least one permission is required",
                }}
                render={({ field }: any) => (
                  <div>
                    <Select
                      {...field}
                      isMulti
                      options={accessData1}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      value={accessData1.filter((option) =>
                        field?.value?.includes(option.value),
                      )}
                      onChange={(selectedOptions: any) => {
                        const values = selectedOptions.map(
                          (option: any) => option?.value,
                        );
                        field.onChange(values);
                      }}
                    />
                    {errors.permission && (
                      <p className="mt-1 text-sm  text-rose-400">
                        {errors.permission.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div> */}
                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Device Type
                  </label>
                  <div className="relative">
                    <select
                      id="business_type"
                      {...register("type", {
                        required: "gender is required",
                      })}
                      defaultValue=""
                      onChange={handleSelectChange}
                      lang=""
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-4 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input "
                    >
                      {accessData1
                        ? accessData1?.map((item: any) => (
                            <option key={item?.label} value={item?.value}>
                              {item?.label}
                            </option>
                          ))
                        : ""}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <AiOutlineDown size={15} />
                    </div>
                  </div>
                  {errors.type && (
                    <p className=" mt-1 text-sm text-rose-400">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                <div className="mb-7 w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Description
                  </label>
                  <textarea
                    className="border-gray-300 block w-full rounded-md border p-2 text-black dark:text-white"
                    rows={4} // You can adjust the number of rows as needed
                    {...register("description", {
                      required: "Please enter description",
                    })}
                    placeholder="Please Enter description"
                  />
                  {errors.description?.message && (
                    <p className="mt-1 text-sm text-red">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="w-full xl:w-1/2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Users
                  </label>

                  <Controller
                    name="permission"
                    control={control}
                    // defaultValue={[]}
                    rules={{
                      required: "At least one permission is required",
                    }}
                    render={({ field }: any) => (
                      <div>
                        <Select
                          {...field}
                          isMulti
                          options={usersOption}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          value={usersOption?.filter((option: any) =>
                            field?.value?.includes(option.value),
                          )}
                          onChange={(selectedOptions: any) => {
                            const values = selectedOptions.map(
                              (option: any) => option?.value,
                            );
                            field.onChange(values);
                          }}
                        />
                        {errors.permission && (
                          <p className="mt-1 text-sm  text-rose-400">
                            {errors.permission.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className=" w-4">
                <Button variant="signupfooter" loading={isLoading}>
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
