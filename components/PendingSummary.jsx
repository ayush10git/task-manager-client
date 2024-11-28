"use client";
import React, { useState, useEffect } from "react";
import { getTasks, getUser } from "@/lib/action";
import { useSession } from "next-auth/react";
import { calculatePendingTime } from "@/lib/utils";

const PendingSummary = () => {
  const [pendingTasks, setPendingTasks] = useState(0);
  const [totalLapsedTime, setTotalLapsedTime] = useState(0);
  const [totalTimeToFinish, setTotalTimeToFinish] = useState(0);
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);

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
      const { totalLapsedTime, pendingCount } = calculatePendingTime(tasks);
      const averageTaskDuration = 2;

      const totalTimeRemaining = pendingCount * averageTaskDuration;

      setPendingTasks(pendingCount);
      setTotalLapsedTime(totalLapsedTime.toFixed(2));
      setTotalTimeToFinish(totalTimeRemaining.toFixed(2));
    }
  }, [tasks]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please log in to view the pending task summary.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xl font-medium">Pending Task Summary</span>
      <div className="flex gap-[3.5rem]">
        <div className="flex gap-2">
          <div className="w-[3px] h-[80px] bg-gray-600"></div>
          <div className="flex flex-col justify-center gap-1 text-lg font-normal">
            <span>{pendingTasks}</span>
            <span>Pending Tasks</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-[3px] h-[80px] bg-gray-600"></div>
          <div className="flex flex-col justify-center gap-1 text-lg font-normal">
            <span>{totalLapsedTime} hrs</span>
            <span>Total Time Lapsed</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-[3px] h-[80px] bg-gray-600"></div>
          <div className="flex flex-col justify-center gap-1 text-lg font-normal">
            <span>{totalTimeToFinish} hrs</span>
            <span>Total Time to Finish</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingSummary;
