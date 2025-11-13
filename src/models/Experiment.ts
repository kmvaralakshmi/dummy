import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IVariant {
  name: string;
  key: string;
  weight: number;
  description?: string;
}

interface ExperimentAttributes {
  id: number;
  name: string;
  key: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: IVariant[];
  startDate?: Date;
  endDate?: Date;
  targetingRules?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExperimentCreationAttributes extends Optional<ExperimentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Experiment extends Model<ExperimentAttributes, ExperimentCreationAttributes> implements ExperimentAttributes {
  public id!: number;
  public name!: string;
  public key!: string;
  public description?: string;
  public status!: 'draft' | 'running' | 'paused' | 'completed';
  public variants!: IVariant[];
  public startDate?: Date;
  public endDate?: Date;
  public targetingRules?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Experiment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'running', 'paused', 'completed'),
      allowNull: false,
      defaultValue: 'draft',
    },
    variants: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidVariants(value: IVariant[]) {
          if (!Array.isArray(value) || value.length < 2) {
            throw new Error('An experiment must have at least 2 variants');
          }
        }
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    targetingRules: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'experiments',
    timestamps: true,
  }
);

export default Experiment;
