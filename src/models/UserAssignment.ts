import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAssignmentAttributes {
  id: number;
  experimentKey: string;
  userId: string;
  variantKey: string;
  assignedAt: Date;
}

interface UserAssignmentCreationAttributes extends Optional<UserAssignmentAttributes, 'id' | 'assignedAt'> {}

class UserAssignment extends Model<UserAssignmentAttributes, UserAssignmentCreationAttributes> implements UserAssignmentAttributes {
  public id!: number;
  public experimentKey!: string;
  public userId!: string;
  public variantKey!: string;
  public assignedAt!: Date;
}

UserAssignment.init(
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
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variantKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_assignments',
    timestamps: false,
    indexes: [
      { fields: ['experimentKey'] },
      { fields: ['userId'] },
      { 
        unique: true, 
        fields: ['experimentKey', 'userId'] 
      },
    ],
  }
);

export default UserAssignment;
