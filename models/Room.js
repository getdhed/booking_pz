const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const validationSettings = require('../config/validationSettings');

const settings = validationSettings.room;

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    // TEXT позволяет менять maxLength в validationSettings.json без изменения типа столбца БД.
    type: DataTypes.TEXT,
    allowNull: !settings.name.required
  },
  roomNumber: {
    type: DataTypes.TEXT,
    allowNull: !settings.roomNumber.required,
    unique: true
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: !settings.location.required
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: !settings.floor.required,
    validate: {
      min: settings.floor.min,
      max: settings.floor.max
    }
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: !settings.capacity.required,
    validate: {
      min: settings.capacity.min,
      max: settings.capacity.max
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: !settings.description.required,
    defaultValue: ''
  }
}, {
  tableName: 'Rooms',
  timestamps: false
});

module.exports = Room;
