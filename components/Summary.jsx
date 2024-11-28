"use client";
import React, { useState, useEffect } from "react";
import { getTasks, getUser } from "@/lib/action"; 
import { useSession } from "next-auth/react";
import { calculateElapsedTime } from "@/lib/utils";

const Summary = () => {
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [pendingPercentage, setPendingPercentage] = useState(0);
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      if (session?.user?.email) {
        try {
          const user = await getUser(session.user.email); 
          setUserId(user.data._id); 

          const userTasks = await getTasks(user.data._id);
          setTasks(userTasks);
        } catch (error) {
          console.error("Error fetching user or tasks:", error.message);
        }
      }
    };

    if (status === "authenticated") {
      fetchUserAndTasks();
    }
  }, [session, status]);

  useEffect(() => {
    if (tasks.length > 0) {
      const { totalTimeSpent, completedCount, avgTimeSpent } =
        calculateElapsedTime(tasks);

      const total = tasks.length;
      const completed = tasks.filter((task) => task.status === "finished");
      const pending = tasks.filter((task) => task.status === "pending");

      setTotalTasks(total);
      setCompletedTasks(completed.length);
      setPendingTasks(pending.length);
      setAvgTime(avgTimeSpent.toFixed(2)); 
      setCompletionPercentage(((completed.length / total) * 100).toFixed(0));
      setPendingPercentage(((pending.length / total) * 100).toFixed(0));
    }
  }, [tasks]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || !userId) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xl font-medium">Summary</span>
      <div className="flex gap-[3.5rem]">
        <div className="flex gap-2">
          <div className="w-[3px] h-[80px] bg-gray-600"></div>
          <div className="flex flex-col justify-center gap-1 text-lg font-normal">
            <span>{totalTasks}</span>
            <span>Total Tasks</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-[3px] h-[80px] bg-gray-600"></div>
          <div className="flex flex-col justify-center gap-1 text-lg font-normal">
            <span>{completionPercentage}%</span>
            <span>Completed</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-[3px] h-[80px] bg-gray-600"></div>
          <div className="flex flex-col justify-center gap-1 text-lg font-normal">
            <span>{pendingPercentage}%</span>
            <span>Pending</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-[3px] h-[80px] bg-gray-600"></div>
          <div className="flex flex-col justify-center gap-1 text-lg font-normal">
            <span>{avgTime} hrs</span>
            <span>Avg. Time / Completed Task</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
