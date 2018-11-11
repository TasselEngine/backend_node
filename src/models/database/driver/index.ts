import db from "mongodb";
import { IConstructor, tryGetDefine, CollectionSet, BsonType } from "./base";
import { TypedSerializer, Serialize, Deserialize } from "@bonbons/core";

const MongoDB = db.MongoClient;

export class Connection {

  private connection!: db.MongoClient;

  public static async Create(uri: string, options?: db.MongoClientOptions) {
    return await new Connection(uri, { ...options }).init();
  }

  constructor(private uri: string, private options: db.MongoClientOptions) { }

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
  insertOne(entry, options) {
    console.log(TypedSerializer.ToObject(entry, { type: this.type }));
    return this.collection.insertOne(TypedSerializer.ToObject(entry, { type: this.type }), options);
  },
  insertMany(entries, options) {
    return this.collection.insertMany(
      entries.map(i => TypedSerializer.ToObject(i, { type: this.type })),
      options
    );
  }
};

class MongoDBInstance {

  constructor(private name: string, private db: db.Db) { }

  public async getCollection<T>(type: IConstructor<T>): Promise<IMongoCollection<T>> {
    const name = CollectionSet.get(type) || null;
    if (name === null) throw new Error("no collection name provided.");
    const define = tryGetDefine(type);
    const collection = await this.db.createCollection<T>(name, {
      validator: {
        $jsonSchema: define.validator
      }
    });
    return {
      ...defaultHandler,
      collection,
      type
    };
  }

  public async defineCollection<T>(type: IConstructor<T>) {
    const define = tryGetDefine(type);
    const { preValidator: pre, validator } = define;
    const { nullable, properties: preload } = pre;
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
    return this.getCollection(type);
  }


}

interface IMongoCollection<T> {
  readonly collection: db.Collection<any>;
  readonly type: IConstructor<T>;
  insertOne(entry: T, options?: db.CollectionInsertOneOptions): Promise<db.InsertOneWriteOpResult>;
  insertMany(entry: T[], options?: db.CollectionInsertManyOptions): Promise<db.InsertWriteOpResult>;
}