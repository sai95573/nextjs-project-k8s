"use client";

import Image from "next/image";
import React from "react";

const ReportContent = ({ headlineText, logoUrl }: any) => (
  <div style={{ padding: "10mm", textAlign: "center" }}>
    <Image
      src={"/images/report/sleepcompany_logo.png"}
      alt="Logo"
      width={22}
      height={22}
    />
    <h1>{headlineText}</h1>
    {/* Add your other content here */}
    <p>Content goes here...</p>
  </div>
);

export default ReportContent;
