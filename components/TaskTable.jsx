"use client";
import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { getTasks, getUser, editTask, deleteTasks } from "@/lib/action";
import { useSession } from "next-auth/react";
import DeleteIcon from "@mui/icons-material/Delete";

const headCells = [
  { id: "id", numeric: false, disablePadding: false, label: "Task ID" },
  { id: "title", numeric: false, disablePadding: false, label: "Title" },
  { id: "priority", numeric: true, disablePadding: false, label: "Priority" },
  { id: "status", numeric: false, disablePadding: false, label: "Status" },
  {
    id: "startTime",
    numeric: false,
    disablePadding: false,
    label: "Start Time",
  },
  { id: "endTime", numeric: false, disablePadding: false, label: "End Time" },
  {
    id: "totalTime",
    numeric: true,
    disablePadding: false,
    label: "Total Time (hrs)",
  },
  { id: "edit", numeric: false, disablePadding: false, label: "Edit" },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" align="center">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="center"
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {["priority", "startTime", "endTime"].includes(headCell.id) ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default function TaskTable() {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("priority");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskData, setTaskData] = useState(null);
  const { data: session, status } = useSession();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      setUserEmail(session.user.email);
    }
  }, [session, status]);

  useEffect(() => {
    if (userEmail) {
      const fetchTasks = async () => {
        try {
          const user = await getUser(userEmail);
          const fetchedTasks = await getTasks(user.data._id);
          setTasks(fetchedTasks);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };

      fetchTasks();
    }
  }, [userEmail, taskData]);


  const handleEditTaskOpen = (task) => {
    setTaskData(task);
    setOpen(true);
  };

  const handleEditTaskClose = () => setOpen(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = tasks.map((n) => n._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(0);
  };

  const filteredRows = useMemo(() => {
    if (filter === "All") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [filter, tasks]);

  const visibleRows = useMemo(
    () =>
      [...filteredRows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredRows]
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleStatusChange = (event, newStatus) => {
    setTaskData((prevData) => ({
      ...prevData,
      status: newStatus,
    }));
  };

  const handleSaveEditedTask = async () => {
    try {
      if (!taskData?._id) {
        console.error("Task ID is missing!");
        return;
      }

      const updatedTask = await editTask(taskData._id, taskData);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );

      setOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  console.log(selected);

  const handleDeleteSelectedTasks = async () => {
    try {
      await deleteTasks(selected);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => !selected.includes(task._id))
      );
      setSelected([]);
    } catch (error) {
      console.error("Error deleting tasks:", error.message);
    }
  };

  return (
    <div>
      <Box sx={{ width: "100%" }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <Toolbar className="flex justify-between">
            <Typography variant="h6" id="tableTitle" component="div">
              Task List
            </Typography>
            <div className="flex gap-5">
              <Select
                value={filter}
                onChange={handleFilterChange}
                displayEmpty
                className="h-8 w-[5rem]"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="finished">Finished</MenuItem>
              </Select>
              <button
                className="px-3 py-1 bg-red-500"
                onClick={handleDeleteSelectedTasks}
              >
                <span className="text-white">Delete</span>
                <DeleteIcon className="text-white" />
              </button>
            </div>
          </Toolbar>

          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                numSelected={selected.length}
                rowCount={tasks.length}
              />
              <TableBody>
                {visibleRows.map((task) => {
                  const isItemSelected = selected.indexOf(task._id) !== -1;

                  const startTime = new Date(task.startTime);
                  const endTime = new Date(task.endTime);

                  let totalTime = "N/A";

                  if (!isNaN(startTime) && !isNaN(endTime)) {
                    const diffInMilliseconds = endTime - startTime;
                    if (diffInMilliseconds >= 0) {
                      const hours = Math.floor(
                        diffInMilliseconds / (1000 * 60 * 60)
                      );
                      const minutes = Math.floor(
                        (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
                      );
                      totalTime = `${hours}h ${minutes}m`;
                    }
                  }

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, task._id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={task._id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox" align="center">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(event) => handleClick(event, task._id)}
                        />
                      </TableCell>
                      <TableCell align="center">{task._id}</TableCell>
                      <TableCell align="center">{task.title}</TableCell>
                      <TableCell align="center">{task.priority}</TableCell>
                      <TableCell align="center">
                        {task.status === "pending" ? "Pending" : "Finished"}
                      </TableCell>
                      <TableCell align="center">
                        {formatDateTime(task.startTime)}
                      </TableCell>
                      <TableCell align="center">
                        {formatDateTime(task.endTime)}
                      </TableCell>
                      <TableCell align="center">{totalTime}</TableCell>
                      <TableCell align="center">
                        <Button
                          onClick={() => handleEditTaskOpen(task)}
                          color="primary"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
      <Dialog open={open} onClose={handleEditTaskClose}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            name="title"
            value={taskData?.title || ""}
            onChange={handleInputChange}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              label="Priority"
              name="priority"
              value={taskData?.priority || ""}
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
            value={taskData?.status || ""}
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
            label="Start Time"
            variant="standard"
            name="startTime"
            value={taskData?.startTime || ""}
            onChange={handleInputChange}
          />

          <TextField
            margin="dense"
            type="datetime-local"
            label="End Time"
            fullWidth
            variant="standard"
            name="endTime"
            value={taskData?.endTime || ""}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditTaskClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveEditedTask} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
