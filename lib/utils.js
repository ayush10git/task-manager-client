export const calculateElapsedTime = (tasks) => {
  let totalTimeSpent = 0;
  let completedCount = 0;

  tasks.forEach((task) => {
    const startTime = new Date(task.startTime);
    const endTime =
      task.status === "finished" ? new Date(task.endTime) : new Date();

    const elapsedTime = (endTime - startTime) / 1000 / 60 / 60; 

    if (task.status === "finished") {
      totalTimeSpent += elapsedTime;
      completedCount += 1;
    }
  });

  const avgTimeSpent = completedCount > 0 ? totalTimeSpent / completedCount : 0;

  return {
    totalTimeSpent,
    completedCount,
    avgTimeSpent,
  };
};

export const calculatePendingTime = (tasks) => {
  let totalLapsedTime = 0;
  let pendingCount = 0;

  tasks.forEach((task) => {
    if (task.status === "pending") {
      const startTime = new Date(task.startTime);
      const endTime = new Date();
      const elapsedTime = (endTime - startTime) / 1000 / 60 / 60;

      if (elapsedTime < 0) {
        totalLapsedTime += 0;
      } else {
        totalLapsedTime += elapsedTime;
      }

      pendingCount += 1;
    }
  });

  return {
    totalLapsedTime,
    pendingCount,
  };
};
