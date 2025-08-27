// routes/seed.js
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middlewares/auth.middleware.js";
import express from "express";

const prisma = new PrismaClient();
const router = express.Router();

// Optional: keep auth for security
router.use(authenticate);

/**
 * Recursive function to create module + its submodules
 */
const createModuleWithChildren = async (moduleData, parentId = null) => {
  try {
    // upsert parent module
    const createdModule = await prisma.module.upsert({
      where: { key: moduleData.key },
      update: {
        name: moduleData.name,
        isActive: moduleData.isActive ?? true,
        parentId: parentId,
      },
      create: {
        name: moduleData.name,
        key: moduleData.key,
        parentId: parentId,
        isActive: moduleData.isActive ?? true,
      },
    });

    // Flexible handling of children property
    const children = moduleData.children || moduleData.submodules || [];
    if (Array.isArray(children) && children.length > 0) {
      for (const child of children) {
        // Pass the current module's ID as parentId for children
        await createModuleWithChildren(child, createdModule.id);
      }
    }

    return createdModule;
  } catch (error) {
    console.error(`Error creating module ${moduleData.key}:`, error);
    throw error;
  }
};

router.post("/modules", async (req, res) => {
  try {
    const modulesData = req.body.modules; // Expecting array with nested children

    if (!Array.isArray(modulesData)) {
      return res.status(400).json({ message: "Modules must be an array" });
    }

    const createdModules = [];

    for (const mod of modulesData) {
      const created = await createModuleWithChildren(mod);
      createdModules.push(created);
    }

    res.json({
      message: "Modules and submodules seeded successfully",
      created: createdModules,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error seeding modules",
      error: error.message,
    });
  }
});

export default router;