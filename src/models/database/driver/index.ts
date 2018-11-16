import db from "mongodb";
import { IConstructor, tryGetDefine, CollectionSet, BsonType, DefinitionSet } from "./base";
import { TypedSerializer, Serialize, Deserialize } from "@bonbons/core";

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

const defaultHandler: IMongoCollection<any> = {
  collection: undefined as any,
  type: undefined as any,
  transform(entry) {
    const { type } = this;
    entry.__proto__ = type.prototype;
    return TypedSerializer.ToObject(entry, { type });
  },
  insertOne(entry, options) {
    return this.collection.insertOne(this.transform(entry), options);
  },
  insertMany(entries, options) {
    return this.collection.insertMany(
      entries.map(i => this.transform(i)),
      options
    );
  }
};

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
  transform(entry: T): any;
  insertOne(entry: T, options?: db.CollectionInsertOneOptions): Promise<db.InsertOneWriteOpResult>;
  insertMany(entries: T[], options?: db.CollectionInsertManyOptions): Promise<db.InsertWriteOpResult>;
}