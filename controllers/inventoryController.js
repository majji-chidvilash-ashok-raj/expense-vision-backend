const Inventory = require("../models/Inventory");

// GET ALL
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find({ userId: req.userId });
    res.json(items);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADD ITEM
exports.addItem = async (req, res) => {
  try {
    const item = new Inventory({
      ...req.body,
      userId: req.userId,
    });

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE ITEM
exports.updateItem = async (req, res) => {
  try {
    const updated = await Inventory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
};

// DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
    await Inventory.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};