import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma";
import bcrypt from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      return getUsers(req, res);
    case "POST":
      return createUser(req, res);
    case "PUT":
      return updateUser(req, res);
    case "DELETE":
      return deleteUser(req, res);
    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}

// POST /api/users

export async function createUser(req: NextApiRequest, res: NextApiResponse) {
  const {
    name,
    email,
    mobile,
    password,
    dateOfBirth,
    gender,
    height,
    weight,
    roleId,
  } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hashing password
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        mobile,
        password: hashedPassword,
        dateOfBirth,
        gender,
        height,
        weight,
        roleId,
      },
    });

    return res.status(201).json({ status: "Success", user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating user." });
  }
}

// GET /api/users

export async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await prisma.users.findMany({
      where: { roleId: { not: 3 } },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        roleId: true,
        gender: true,
        dateOfBirth: true,
        height: true,
        weight: true,
        createdAt: true,
        roles: {
          select: {
            id: true,
            name: true,
            permission: true,
          },
        },
      },
    });

    return res.status(200).json({ status: "Success", users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error retrieving users." });
  }
}

// DELETE /api/users/:id

export async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    await prisma.users.delete({ where: { id: Number(id) } });
    return res
      .status(200)
      .json({ status: "Success", message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error deleting user." });
  }
}

// PUT /api/users
export async function updateUser(req: NextApiRequest, res: NextApiResponse) {
  const {
    id,
    name,
    email,
    mobile,
    dateOfBirth,
    gender,
    height,
    weight,
    roleId,
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Id is required." });
  }

  try {
    await prisma.users.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        mobile,
        dateOfBirth,
        gender,
        height,
        weight,
        roleId,
      },
    });

    return res
      .status(200)
      .json({ status: "Success", message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating user." });
  }
}
