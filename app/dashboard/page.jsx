import DashboardTable from "@/components/DashboardTable";
import PendingSummary from "@/components/PendingSummary";
import Summary from "@/components/Summary";
import React from "react";

const page = () => {
  
  return (
    <div className="px-10 py-5 text-gray-700 flex flex-col gap-5">
      <h1 className="font-bold text-3xl">Dashboard</h1>

      <Summary />
      <PendingSummary />
      <DashboardTable/>
    </div>
  );
};

export default page;
