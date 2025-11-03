const Trip = require('../models/trip');

exports.createTrip = async (req, res) => {
  try {
    const trip = await Trip.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTrips = async (req, res) => {
  try {
    // 获取当前用户的所有行程
    const trips = await Trip.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: '行程不存在' });
    }

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    // 先检查行程是否存在且属于当前用户
    const trip = await Trip.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: '行程不存在' });
    }

    // 更新行程
    const updatedTrip = await Trip.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });

    res.status(200).json({
      success: true,
      data: updatedTrip[1][0] // Sequelize的update返回[affectedRows, [updatedInstances]]
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    // 先检查行程是否存在且属于当前用户
    const trip = await Trip.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: '行程不存在' });
    }

    // 删除行程
    await trip.destroy();

    res.status(200).json({
      success: true,
      message: '行程已删除'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 添加费用记录
exports.addExpense = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: '行程不存在' });
    }

    // 获取现有费用记录
    const expenses = trip.expenses || [];
    // 添加新费用
    expenses.push(req.body);
    // 更新行程
    await trip.update({ expenses });

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 添加照片
exports.addPhoto = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: '行程不存在' });
    }

    // 获取现有照片
    const photos = trip.photos || [];
    // 添加新照片
    photos.push(req.body);
    // 更新行程
    await trip.update({ photos });

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};