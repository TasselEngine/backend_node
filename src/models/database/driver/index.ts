import db from "mongodb";
import { IConstructor, tryGetDefine, CollectionSet, BsonType, DefinitionSet } from "./base";
import { TypedSerializer, Serialize, Deserialize } from "@bonbons/core";
import { IQueryFilter, MongoFilter, readFilterMeta, Operator, IQueryWhere } from "./filter";

const MongoDB = db.MongoClient;

export class Connection {

  private connection!: db.MongoClient;

  public static async Create(uri: string, options?: db.MongoClientOptions) {
    return await new Connection(uri, { ...options }).init();
  }

  constructor(private uri: string, private options: db.MongoClientOptions) {
    Array.from(DefinitionSet.entries()).forEach(([k, v]) => {
      this.initDefinitions(k);
    });
  }

  private initDefinitions<T = any>(type: IConstructor<T>) {
    const define = tryGetDefine(type);
    const { preValidator: pre, validator } = define;
    const { nullable, properties: preload } = pre;
    const ignoreList = Object.keys(preload).map(k => ({ key: k, data: preload[k] })).filter(i => i.data.ignoreTransform);
    // @ts-ignore ignore static transform
    type.OnSerialized = (instance: T, json: any) => {
      for (const item of ignoreList) {
        const { key, data } = item;
        json[data.alias || key] = (<any>instance)[key];
      }
    };
    Object.keys(validator.properties).forEach(key => {
      let alias = preload[key].alias;
      const realType = preload[key].realType;
      if (alias && alias !== key) {
        const old = validator.properties[key];
        delete validator.properties[key];
        validator.properties[alias] = old;
      } else {
        alias = key;
      }
      if (realType === Object) {
        Serialize(alias)(type.prototype, key);
        Deserialize(alias)(type.prototype, key);
      } else {
        Serialize(realType, alias)(type.prototype, key);
        Deserialize(realType, alias)(type.prototype, key);
      }
      const index = nullable.indexOf(key);
      if (index >= 0) {
        nullable[index] = alias;
        const prop = validator.properties[alias];
        // @ts-ignore make sure it's alright
        prop.bsonType = [prop.bsonType, BsonType.Null];
      } else {
        validator.required.push(alias);
      }
    });
  }

  public async init() {
    try {
      this.connection = await MongoDB.connect("mongodb://localhost:27017", { useNewUrlParser: true, ...this.options });
      return this;
    } catch (error) {
      throw error;
    }
  }

  public getDatabase(name: string) {
    return new MongoDBInstance(name, this.connection.db(name));
  }

  public dispose() {
    this.connection.close();
  }

}

interface IMongoCollectionBase<T = any> extends IMongoCollection<T> {
  transform(entry: T): any;
  getKeyMap(type?: IConstructor<T>): any;
}

const defaultHandler: IMongoCollectionBase = {
  collection: undefined as any,
  type: undefined as any,
  transform(entry) {
    const { type } = this;
    entry.__proto__ = type.prototype;
    return TypedSerializer.ToObject(entry, { type });
  },
  getKeyMap(type) {

  },
  insertOne(entry, options) {
    return this.collection.insertOne(this.transform(entry), options);
  },
  insertMany(entries, options) {
    return this.collection.insertMany(
      entries.map(i => this.transform(i)),
      options
    );
  },
  find(arg: IQueryFilter<any> | ((filter: IQueryFilter<any>) => IQueryFilter<any>)) {
    let filter = arg as IQueryFilter<any>;
    if (typeof arg === "function") filter = arg(MongoFilter(this.type).query());
    const { where, or, nor } = readFilterMeta(filter);
    console.log(where);
    const _ftd: any = Object.keys(where)
      .map(k => resolveOperators(where[k], k))
      .reduce((p, c) => ({ ...p, [c[0]]: c[1] }), {});
    if (or.length > 0) _ftd.$or = or.map(rule => resolveOperators(rule, true));
    if (nor.length > 0) _ftd.$nor = nor.map(rule => resolveOperators(rule, true));
    console.log(_ftd);
    return this.collection.find(_ftd).toArray();
  }
};

function resolveOperators(data: any, isObj: true): { [prop: string]: any };
function resolveOperators(vx: IQueryWhere<any, any>, k: string): [string, any];
function resolveOperators(vx_data: any, k: string | true) {
  const ret: any = {};
  const key = k === true ? Object.keys(vx_data)[0] : k;
  const data = k === true ? vx_data[key] : vx_data;
  readOperator(data, ret, "=");
  readOperator(data, ret, "!=");
  readOperator(data, ret, ">");
  readOperator(data, ret, ">=");
  readOperator(data, ret, "<");
  readOperator(data, ret, "<=");
  if (k === true) return { [key]: ret };
  return [key, ret];
}

function readOperator(vx: any, ret: any, operator: keyof typeof Operator) {
  if (!!vx[operator]) ret[Operator[operator]] = vx[operator];
}

class MongoDBInstance {

  constructor(private name: string, private db: db.Db) { }

  public async getCollection<T>(type: IConstructor<T>): Promise<IMongoCollection<T>> {
    const name = CollectionSet.get(type) || null;
    if (name === null) throw new Error("no collection name provided.");
    const collection = await this.db.collection(name);
    return {
      ...(defaultHandler as IMongoCollection<T>),
      collection,
      type
    };
  }

  public async defineCollection<T>(type: IConstructor<T>) {
    const name = CollectionSet.get(type) || null;
    if (name === null) throw new Error("no collection name provided.");
    const define = tryGetDefine(type);
    const collection = await this.db.createCollection<T>(name, {
      validator: { $jsonSchema: define.validator }
    });
    return {
      ...(defaultHandler as IMongoCollection<T>),
      collection,
      type
    };
  }


}

interface IMongoCollection<T> {
  readonly collection: db.Collection<any>;
  readonly type: IConstructor<T>;
  insertOne(entry: T, options?: db.CollectionInsertOneOptions): Promise<db.InsertOneWriteOpResult>;
  insertMany(entries: T[], options?: db.CollectionInsertManyOptions): Promise<db.InsertWriteOpResult>;
  find(filter: IQueryFilter<T>): Promise<T[]>;
  find(invoke: (filter: IQueryFilter<T>) => IQueryFilter<T>): Promise<T[]>;
}