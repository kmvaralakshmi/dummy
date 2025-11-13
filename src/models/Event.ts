import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface EventAttributes {
  id: number;
  experimentKey: string;
  variantKey: string;
  userId: string;
  eventType: 'impression' | 'click' | 'conversion' | 'custom';
  eventName?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'timestamp'> {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public experimentKey!: string;
  public variantKey!: string;
  public userId!: string;
  public eventType!: 'impression' | 'click' | 'conversion' | 'custom';
  public eventName?: string;
  public metadata?: Record<string, any>;
  public timestamp!: Date;
  public sessionId?: string;
  public userAgent?: string;
  public ipAddress?: string;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    experimentKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variantKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventType: {
      type: DataTypes.ENUM('impression', 'click', 'conversion', 'custom'),
      allowNull: false,
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'events',
    timestamps: false,
    indexes: [
      { fields: ['experimentKey'] },
      { fields: ['variantKey'] },
      { fields: ['userId'] },
      { fields: ['eventType'] },
      { fields: ['experimentKey', 'variantKey', 'eventType'] },
      { fields: ['experimentKey', 'userId'] },
    ],
  }
);

export default Event;
