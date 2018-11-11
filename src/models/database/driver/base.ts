
export interface IConstructor<T> {
  new(...args: any[]): T;
}

export enum BsonType {
  Int32 = "int",
  Double = "double",
  Boolean = "bool",
  String = "string",
  Object = "object",
  Array = "array",
  BinaryData = "binData",
  ObjectId = "objectId",
  Date = "date",
  Null = "null",
  Regex = "regex",
  JavaScript = "javascript",
  JavaScriptScope = "javascriptWithScope",
  Timestamp = "timestamp",
  Int64 = "long",
  Decimal = "decimal",
  MinKey = "minKey",
  MaxKey = "maxKey"
  // Symbol = "symbol",
  // Undefined = "undefined",
  // DBPointer = "dbPointer",
}

export interface IMongoDefinition<T = any> {
  type: IConstructor<T>;
  validator: IMongoValidator;
  preValidator: IMongoPreValidator;
}

export interface IMongoPreValidator {
  nullable: string[];
  properties: {
    [prop: string]: {
      alias: string | undefined;
    };
  };
}

export interface IMongoValidator extends IPropertyValidator {
  required: string[];
  properties: {
    [prop: string]: IPropertyValidator;
  };
}

export interface IPropertyValidator {
  bsonType: BsonType[];
  description?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  enum?: string[];
}

export const DefinitionSet = new Map<IConstructor<any>, IMongoDefinition>();
export const CollectionSet = new Map<IConstructor<any>, string>();

export function tryGetDefine<T>(type: IConstructor<T>) {
  let define = DefinitionSet.get(type);
  if (!define) {
    define = {
      type,
      validator: {
        bsonType: [BsonType.Object],
        required: [],
        properties: {}
      },
      preValidator: {
        nullable: [],
        properties: {}
      }
    };
    DefinitionSet.set(type, define);
  }
  return define;
}

export function tryGetProperty<T>(type: IConstructor<T>, name: string, alias?: string) {
  const { validator, preValidator } = tryGetDefine(type);
  let property = validator.properties[name];
  let prePro = preValidator.properties[name];
  if (!property) {
    validator.properties[name] = property = {
      bsonType: []
    };
    preValidator.properties[name] = prePro = {
      alias
    };
  }
  prePro.alias = prePro.alias || alias;
  return property;
}