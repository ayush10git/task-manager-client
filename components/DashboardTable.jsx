"use client";
import { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { getTasks, getUser } from "@/lib/action"; 
import { useSession } from "next-auth/react"; 

function createData(priority, pendingTasks, finishedTasks, timeToFinish) {
  return { priority, pendingTasks, finishedTasks, timeToFinish };
}

export default function DashboardTable() {
  const [rows, setRows] = useState([]);
  const { data: session, status } = useSession();

  
  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.email) {
        try {
          const user = await getUser(session.user.email);

          const tasks = await getTasks(user.data._id);

          const groupedByPriority = tasks.reduce((acc, task) => {
            const priority = task.priority;
            if (!acc[priority]) {
              acc[priority] = { pending: 0, finished: 0, timeLeft: 0 };
            }

            if (task.status === "pending") {
              acc[priority].pending += 1;

              const startTime = new Date(task.startTime);
              const endTime = new Date(task.endTime);

              const timeLeft =
                startTime > new Date()
                  ? (endTime - startTime) / 1000 / 60 / 60 
                  : (endTime - new Date()) / 1000 / 60 / 60;

              acc[priority].timeLeft += timeLeft; 
            } else if (task.status === "finished") {
              acc[priority].finished += 1;
              acc[priority].timeLeft = 0;
            }

            return acc;
          }, {});

          const tableRows = Object.keys(groupedByPriority).map((priority) => {
            const data = groupedByPriority[priority];
            return createData(
              priority,
              data.pending,
              data.finished,
              data.timeLeft.toFixed(2)
            );
          });

          setRows(tableRows); 
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      }
    };

    if (status === "authenticated") {
      fetchData(); 
    }
  }, [session, status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please log in to view the task summary.</div>;
  }

  return (
    <TableContainer className="w-[700px] mt-5 shadow-sm">
      <Table sx={{ minWidth: 400 }} aria-label="task table">
        <TableHead className="bg-gray-200">
          <TableRow>
            <TableCell align="center">Priority</TableCell>
            <TableCell align="center">Pending Tasks</TableCell>
            <TableCell align="center">Finished Tasks</TableCell>
            <TableCell align="center">Time to Finish (hrs)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.priority}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="center">{row.priority}</TableCell>
              <TableCell align="center">{row.pendingTasks}</TableCell>
              <TableCell align="center">{row.finishedTasks}</TableCell>
              <TableCell align="center">{row.timeToFinish} hrs</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
