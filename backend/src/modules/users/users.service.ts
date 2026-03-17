import {
  findUserById,
  listUsers,
  searchUsers,
  listUsersByDepartment,
} from "./users.repository.js";

export async function getUserProfile(userId: string) {
  return findUserById(userId);
}

export async function getAllUsers(page: number, limit: number) {
  return listUsers(page, limit);
}

export async function searchUser(query: string) {
  return searchUsers(query);
}

export async function getUsersByDepartment(departmentId: number) {
  return listUsersByDepartment(departmentId);
}
