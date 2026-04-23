import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

// export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Role' })
  roleId?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
