import * as moduleService from './module.service.js';

export const createModule = async (req, res) => {
  try {
    let payload = req.body;

    // Handle { modules: [...] } wrapper
    if (payload.modules && Array.isArray(payload.modules)) {
      payload = payload.modules;
    }

    const result = await moduleService.createModule(payload);

    if (Array.isArray(payload)) {
      return res.status(201).json({
        message: "Modules processed",
        insertedCount: result.insertedCount,
        insertedKeys: result.insertedKeys,
        skippedKeys: result.skippedKeys
      });
    }

    // Single insert
    if (result.insertedCount === 0) {
      return res.status(400).json({
        message: `Module with key '${result.skippedKeys[0]}' already exists`
      });
    }

    return res.status(201).json({
      message: "Module created successfully",
      module: result.module
    });

  } catch (err) {
    console.error("Error creating module:", err);

    // Handle duplicate key error from Prisma (P2002)
    if (err.code === "P2002") {
      return res.status(400).json({
        message: `Module with key '${err.meta?.target}' already exists`
      });
    }

    return res.status(500).json({ message: err.message });
  }
};

export const getAllModules = async (req, res) => {
  try {
    const modules = await moduleService.getAllModules();

    return res.status(200).json({
      success: true,
      message: modules.length > 0
        ? "Modules fetched successfully"
        : "No modules found",
      count: modules.length,
      modules
    });

  } catch (err) {
    console.error("Error fetching modules:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch modules",
      error: err.message
    });
  }
};


export const getModuleById = async (req, res) => {
  try {
    const module = await moduleService.getModuleById(parseInt(req.params.id));
    res.json(module);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const updateModule = async (req, res) => {
  try {
    const updated = await moduleService.updateModule(parseInt(req.params.id), req.body);
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteModule = async (req, res) => {
  try {
    await moduleService.deleteModule(parseInt(req.params.id));
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
