/* eslint-disable react/jsx-key */
"use client";
import Input from "@/app/ui/form/input";
import { showToast } from "@/app/ui/toast";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Button from "@/components/ui/button";
import { useGetRolestableQuery } from "@/store/slice/roles/getRolesSlice";
import { useAddUserMutation } from "@/store/slice/users/addUserSlice";
import { useGetUsersByIdQuery } from "@/store/slice/users/getUserSlice";
import { useUpdateUserMutation } from "@/store/slice/users/updateUserSlice";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineDown } from "react-icons/ai";

interface InputProps {
  name: string;
  email: string;
  password: string;
  mobile: string;
  dob: string;
  gender: string;
  height: string;
  weight: string;
  role: string;
}

const statusData = [
  {
    label: "Male",
    value: "Male",
  },
  {
    label: "Female",
    value: "Female",
  },
];

const CreateRoleForm = () => {
  const userID = useSearchParams();
  const { data: rolesDetails } = useGetRolestableQuery({});
  const userid = userID?.get("id");

  const { data: getRolesDetailsById } = useGetUsersByIdQuery(
    { userid },
    { skip: !userid },
  );

  const [addUsersMutation, { isLoading }] = useAddUserMutation();
  const [updateUsersMutation, { isLoading: updateLoading }] =
    useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InputProps>({
    defaultValues: {
      name: getRolesDetailsById?.users[0]?.name,
      email: getRolesDetailsById?.users[0]?.email,
      mobile: getRolesDetailsById?.users[0]?.mobile,
      dob: getRolesDetailsById?.users[0]?.dateOfBirth,
      gender: getRolesDetailsById?.users[0]?.gender,
      height: getRolesDetailsById?.users[0]?.height,
      weight: getRolesDetailsById?.users[0]?.weight,
      role: getRolesDetailsById?.users[0]?.roles?.id,
    },
  });

  useEffect(() => {
    if (getRolesDetailsById) {
      setValue("name", getRolesDetailsById?.users[0]?.name || "");
      setValue("email", getRolesDetailsById?.users[0]?.email || "");
      setValue("mobile", getRolesDetailsById?.users[0]?.mobile || "");
      setValue("dob", getRolesDetailsById?.users[0]?.dateOfBirth || "");
      setValue("gender", getRolesDetailsById?.users[0]?.gender || "");
      setValue("height", getRolesDetailsById?.users[0]?.height || "");
      setValue("weight", getRolesDetailsById?.users[0]?.weight || "");
      setValue("role", getRolesDetailsById?.users[0]?.roles?.id || "");
    }
  }, [getRolesDetailsById, setValue]);

  const router = useRouter();

  async function onSubmit({
    name,
    email,
    password,
    mobile,
    dob,
    gender,
    height,
    weight,
    role,
  }: InputProps) {
    if (!userid) {
      try {
        await addUsersMutation({
          name,
          email,
          mobile,
          password,
          dateOfBirth: dob,
          gender,
          // height: Number(height),
          height: 0,
          // weight: Number(weight),
          weight: 0,
          roleId: Number(role),
        });
        showToast("success", "User Created Successful");
        router.push("/users");
      } catch (error) {
        console.log("Please");
      }
    } else {
      try {
        await updateUsersMutation({
          id: Number(userid),
          name,
          email,
          mobile,
          dateOfBirth: dob,
          gender,
          // height: Number(height),
          height: 0,
          // weight: Number(weight),
          weight: 0,
          roleId: Number(role),
        });
      } catch (error) {
        console.error("Failed to update user", error);
      }
    }
    router.push("/users");
  }
  return (
    <DefaultLayout>
      <Breadcrumb
        pageName={userid ? "Edit User" : "Add Users"}
        isGoBack={true}
      />

      {/* <div className="grid grid-cols-1 gap-9 sm:grid-cols-2"> */}
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
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="mb-7 w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Name
                    </label>
                    <Input
                      lang={""}
                      type="text"
                      {...register("name", {
                        required: `Please enter name`,
                      })}
                      placeholder="Please Enter name"
                      error={errors.name?.message}
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Email
                    </label>

                    <Input
                      lang={""}
                      type="email"
                      {...register("email", {
                        required: `Please enter email`,
                        pattern: {
                          value:
                            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                          message: "Please enter valid email",
                        },
                      })}
                      placeholder="Please Enter email"
                      error={errors.email?.message}
                    />
                  </div>
                </div>
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Mobile
                    </label>

                    <Input
                      lang={""}
                      {...register("mobile", {
                        required: "Mobile number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message:
                            "Please enter a valid 10-digit mobile number",
                        },
                      })}
                      type="text"
                      placeholder="Please Enter mobile number"
                      error={errors.mobile?.message}
                      maxLength={10}
                      onInput={(e: any) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      }}
                    />
                  </div>
                  {/* <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Role
                    </label>

                    <select
                      id="business_type"
                      {...register("role", {
                        required: "State Required",
                      })}
                      lang=""
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-4 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input "
                    >
                      {rolesDetails
                        ? rolesDetails?.roles?.map((item: any) => (
                            <option key={item?.id} value={item?.id}>
                              {item?.name}
                            </option>
                          ))
                        : ""}
                    </select>
                  </div> */}
                  <div className="relative w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Role
                    </label>

                    {/* Container to position the icon */}
                    <div className="relative">
                      <select
                        id="business_type"
                        {...register("role", {
                          required: "Role Required",
                        })}
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-4 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                      >
                        {rolesDetails
                          ? rolesDetails?.roles?.map((item: any) => (
                              <option key={item?.id} value={item?.id}>
                                {item?.name}
                              </option>
                            ))
                          : ""}
                      </select>

                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                        <AiOutlineDown size={15} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="mb-7 w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      DOB
                    </label>
                    <Input
                      lang={""}
                      {...register("dob", {
                        required: "user is required",
                      })}
                      type="date"
                      placeholder="Please Enter dob"
                      error={errors.dob?.message}
                    />
                  </div>

                  {/* <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Gender
                    </label>

                    <Input
                      lang={""}
                      {...register("gender", {
                        required: "gender is required",
                      })}
                      type="text"
                      placeholder="Please Enter gender"
                      error={errors.gender?.message}
                    />
                  </div> */}
                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        id="business_type"
                        {...register("gender", {
                          required: "gender is required",
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
                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                        <AiOutlineDown size={15} />
                      </div>
                    </div>
                    {errors.gender && (
                      <p className=" mt-1 text-sm text-rose-400">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="mb-7 w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Height
                    </label>
                    <Input
                      lang={""}
                      {...register("height", {
                        required: "Height is required",
                        pattern: {
                          value: /^[0-9]+$/, // This regex allows only numeric values
                          message: "Please enter a valid number",
                        },
                      })}
                      type="text"
                      placeholder="Please Enter height"
                      error={errors.height?.message}
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Weight
                    </label>

                    <Input
                      lang={""}
                      {...register("weight", {
                        required: "weight is required",
                        pattern: {
                          value: /^[0-9]+$/, // This regex allows only numeric values
                          message: "Please enter a valid number",
                        },
                      })}
                      type="text"
                      placeholder="Please Enter weight"
                      error={errors.weight?.message}
                    />
                  </div>
                </div> */}
                {!userid ? (
                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="mb-7 w-full xl:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Password
                      </label>
                      <Input
                        lang={""}
                        {...register("password", {
                          required: "password is required",
                          minLength: {
                            value: 8,
                            message:
                              "Password must be at least 8 characters long",
                          },
                          // pattern: {
                          //   value:
                          //     /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                          //   message:
                          //     "Password must contain uppercase, lowercase, number, and special character",
                          // },
                        })}
                        type="text"
                        placeholder="Please Enter password"
                        error={errors.password?.message}
                      />
                    </div>
                  </div>
                ) : null}

                <Button
                  variant="signupfooter"
                  loading={isLoading || updateLoading}
                  // className="rounde flex justify-center bg-[#7566A1] p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  {userid ? "Update" : "Submit"}
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
