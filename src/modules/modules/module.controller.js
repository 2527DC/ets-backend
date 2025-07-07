import * as moduleService from './module.service.js';

export const createModule = async (req, res) => {
  try {
    const module = await moduleService.createModule(req.body);
    res.status(201).json(module);
  } catch (err) {
    console.error(err); res.status(500).json({ message: err.message });
  }
};

export const getAllModules = async (req, res) => {
  try {
    const modules = await moduleService.getAllModules();
    res.json(modules);
  } catch (err) { res.status(500).json({ message: err.message }); }
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
