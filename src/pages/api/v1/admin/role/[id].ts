import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  switch (req.method) {
    case "GET":
      return getRole(req, res, id);
    case "DELETE":
      return deleteRole(req, res, id);
    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}

// Get a specific role by id
async function getRole(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const role = await prisma.roles.findUnique({
      where: { id: Number(id) },
    });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    return res.status(200).json({ role });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching role" });
  }
}



// Delete a specific role by id
async function deleteRole(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
) {
  try {
    await prisma.roles.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Error deleting role" });
  }
}
