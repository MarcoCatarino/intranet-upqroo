import {
  findUserById,
  listUsers,
  searchUsers,
  listUsersByDepartment,
  countUsers,
} from "./users.repository.js";

export async function getUserProfile(userId: string) {
  return findUserById(userId);
}

export async function getAllUsers(page: number, limit: number) {
  const [data, total] = await Promise.all([
    listUsers(page, limit),
    countUsers(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function searchUser(query: string) {
  return searchUsers(query);
}

export async function getUsersByDepartment(departmentId: number) {
  return listUsersByDepartment(departmentId);
}
