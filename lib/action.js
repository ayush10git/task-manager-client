import axios from "axios";

export const getUser = async (email) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER}/api/user/get?email=${email}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error.response || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to get user. Please try again."
    );
  }
};

export const addTask = async (taskData) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER}/api/task/create`,
      taskData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to add task. Please try again."
    );
  }
};

export const getTasks = async (userId) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER}/api/task/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching tasks:", error.response || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch tasks.");
  }
};

export const editTask = async (taskId, taskData) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_SERVER}/api/task/${taskId}`,
      taskData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error editing task:", error.response || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to edit task. Please try again."
    );
  }
};

export async function deleteTasks(taskIds) {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_SERVER}/api/task/delete`,
      {
        data: { taskIds },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete the tasks"
    );
  }
}
