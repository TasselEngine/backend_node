import { TYPE_META_KEY } from "@bonbons/core/dist/src/di";
import {
  IConstructor, tryGetDefine,
  CollectionSet, tryGetProperty,
  BsonType
} from "./base";

interface IPropertyOptions {
  name: string;
  type: BsonType | IConstructor<any>;
  nullable: boolean;
  description: string;
  enum: string[];
}

export function Bson(options?: {}) {
  return function bson<T>(target: IConstructor<T>) {
    tryGetDefine(target);
  };
}

export function Collection(name: string) {
  return function collection<T>(target: IConstructor<T>) {
    CollectionSet.set(target, name);
    return Bson({})(target);
  };
}

export function BsonProperty(meta?: Partial<IPropertyOptions>) {
  const {
    nullable = false,
    type = undefined,
    description = undefined,
    enum: enumV = undefined
  } = meta || {};
  return function bsonProperty(prototype: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    const property = tryGetProperty(prototype.constructor, propertyKey);
    defineAlias(prototype, propertyKey);
    if (description) property.description = description;
    if (enumV) property.enum = enumV;
    if (nullable) defineNullable(prototype, propertyKey);
    if (type && typeof type === "string") {
      defineManualyType(prototype, propertyKey, type);
    } else {
      defineAutoType(prototype, propertyKey);
    }
  };
}

export function PropertyType(type: IConstructor<any>): (prototype: any, propertyKey: string, descriptor?: PropertyDescriptor) => void;
export function PropertyType(type: BsonType): (prototype: any, propertyKey: string, descriptor?: PropertyDescriptor) => void;
export function PropertyType(type: any) {
  return function propertyType(prototype: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    BsonProperty({ type })(prototype, propertyKey);
  };
}

export function PropertyName(name: string) {
  return function propertyName(prototype: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    defineAlias(prototype, propertyKey, name);
  };
}

export function Nullable() {
  return function nullable(prototype: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    BsonProperty({ nullable: true })(prototype, propertyKey);
  };
}

export function EnumType(enumValue: any) {
  return function enumType(prototype: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    BsonProperty({ enum: Object.getOwnPropertyNames(enumValue).map(k => enumValue[k]) })(prototype, propertyKey);
  };
}

export function ErrorMessage(desc: string) {
  return function errorMessage(prototype: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    BsonProperty({ description: desc })(prototype, propertyKey);
  };
}

function defineNullable(prototype: any, propertyKey: string) {
  const define = tryGetDefine(prototype.constructor);
  define.preValidator.nullable.push(propertyKey);
}

function defineAlias(prototype: any, propertyKey: string, name?: string) {
  tryGetProperty(prototype.constructor, propertyKey, name);
}

function defineAutoType(prototype: any, propertyKey: string, customCtor?: IConstructor<any>) {
  const property = tryGetProperty(prototype.constructor, propertyKey);
  const define = tryGetDefine(prototype.constructor);
  const preLoad = define.preValidator.properties[propertyKey];
  if (customCtor) {
    property.bsonType = BsonType.Object;
    preLoad.realType = customCtor;
    return;
  }
  const type = Reflect.getOwnMetadata(TYPE_META_KEY, prototype, propertyKey);
  let resolve: any = Object;
  let bsonType = BsonType.Object;
  switch (type) {
    case String: [resolve, bsonType] = [String, BsonType.String]; break;
    case Number: [resolve, bsonType] = [Number, BsonType.Double]; break;
    case Boolean: [resolve, bsonType] = [Boolean, BsonType.Boolean]; break;
  }
  property.bsonType = bsonType;
  preLoad.realType = resolve;
}

function defineManualyType(prototype: any, propertyKey: string, type: BsonType) {
  const property = tryGetProperty(prototype.constructor, propertyKey);
  const define = tryGetDefine(prototype.constructor);
  const preLoad = define.preValidator.properties[propertyKey];
  property.bsonType = type;
  switch (type) {
    case BsonType.Number:
    case BsonType.Int32:
    case BsonType.Int64:
    case BsonType.Decimal: preLoad.realType = Number; break;
    case BsonType.Boolean: preLoad.realType = Boolean; break;
    default: preLoad.realType = String;
  }
}