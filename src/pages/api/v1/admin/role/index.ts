import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma"; // Assuming prisma is set up in utils

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      // Get all roles
      return getRoles(req, res);
    case "POST":
      // Create a new role
      return createRole(req, res);
    case "PUT":
      return updateRole(req, res);
    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}

// Get all roles
async function getRoles(req: NextApiRequest, res: NextApiResponse) {
  try {
    const roles = await prisma.roles.findMany();
    return res.status(200).json({ roles });
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch roles" });
  }
}

// Create a new role
async function createRole(req: NextApiRequest, res: NextApiResponse) {
  const { name, permission, status } = req.body;

  if (!name || !permission) {
    return res.status(400).json({ error: "Name and permission are required" });
  }

  try {
    const role = await prisma.roles.create({
      data: {
        name,
        status,
        permission,
      },
    });
    return res.status(201).json({ status: true, role });
  } catch (error) {
    return res.status(500).json({ error: "Error creating role" });
  }
}


// Update a specific role by id
async function updateRole(
  req: NextApiRequest,
  res: NextApiResponse) {
  const { name, permission, status, id } = req.body;
  console.log(req.body, "====================>")

  try {
    const role = await prisma.roles.update({
      where: { id: Number(id) },
      data: {
        name,
        permission,
        status,
      },
    });

    return res.status(200).json({ role });
  } catch (error) {
    return res.status(500).json({ error: "Error updating role" });
  }
}