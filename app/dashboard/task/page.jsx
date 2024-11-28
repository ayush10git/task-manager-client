"use client";
import React, { useState, useEffect } from "react";
import TaskTable from "@/components/TaskTable";
import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { addTask, getUser, deleteTasks } from "@/lib/action";
import { useSession } from "next-auth/react";

const Page = () => {
  const { data: session, status } = useSession();
  const [userEmail, setUserEmail] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState([]); 

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session, status]);

  const [open, setOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    priority: 1,
    status: "Pending",
    startTime: "",
    endTime: "",
    userId: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddTaskOpen = () => setOpen(true);
  const handleAddTaskClose = () => {
    setOpen(false);
    setMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleStatusChange = (e, newStatus) => {
    setTaskData({ ...taskData, status: newStatus });
  };

  const handleAddTask = async () => {
    setLoading(true);
    setMessage("");

    try {
      const user = await getUser(userEmail);

      const updatedTaskData = { ...taskData, userId: user.data._id };

      const response = await addTask(updatedTaskData);
      setMessage(response.message);

      setTaskData({
        title: "",
        priority: 1,
        status: "pending",
        startTime: "",
        endTime: "",
      });
      setOpen(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 flex flex-col gap-5">
      <div className="flex gap-4">
        <button
          className="border border-gray-500 px-5 py-2 rounded-md flex justify-center items-center gap-1 w-[9rem]"
          onClick={handleAddTaskOpen}
        >
          <span>Add Task</span>
          <AddIcon />
        </button>
      </div>

      <Dialog open={open} onClose={handleAddTaskClose}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            name="title"
            value={taskData.title}
            onChange={handleInputChange}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              label="Priority"
              name="priority"
              value={taskData.priority}
              onChange={handleInputChange}
            >
              {[1, 2, 3, 4, 5].map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={taskData.status}
            exclusive
            onChange={handleStatusChange}
            fullWidth
            margin="dense"
          >
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="finished">Finished</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            margin="dense"
            type="datetime-local"
            fullWidth
            variant="standard"
            name="startTime"
            value={taskData.startTime}
            onChange={handleInputChange}
          />

          <TextField
            margin="dense"
            type="datetime-local"
            fullWidth
            variant="standard"
            name="endTime"
            value={taskData.endTime}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddTaskClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddTask} color="primary" disabled={loading}>
            {loading ? "Adding..." : "Add Task"}
          </Button>
        </DialogActions>
        {message && <p className="text-center text-red-500 mt-2">{message}</p>}
      </Dialog>

      <TaskTable />
    </div>
  );
};

export default Page;
