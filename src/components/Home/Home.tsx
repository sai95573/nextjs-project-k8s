import React from "react";

const Home = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 mt-36 flex items-center justify-center">
      <div className="border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 flex h-40 w-full max-w-5xl flex-col items-center justify-center rounded-lg border bg-white p-6 shadow">
        <img
          src="/images/logo/sleep-compnany-logo.jpg"
          alt="Sleep Company Logo"
          className="items-center"
        />
        <h1 className="text-gray-900 mt-4 text-2xl font-bold italic dark:text-white">
          Welcome to The Sleep Company !
        </h1>
      </div>
    </div>
  );
};

export default Home;
