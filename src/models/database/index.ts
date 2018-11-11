import { Connection } from "./driver";
import { TestModel, ChildNode } from "../model/test";
import { BsonType, Int64 } from "./driver/base";

export async function init() {
  try {
    const connection = await Connection.Create("mongodb://localhost:27017");
    const db = connection.getDatabase("test-database");
    const collection = await db.defineCollection(TestModel);
    await collection.insertOne(new TestModel({
      name: "i'm your father",
      child: new ChildNode({})
    }));
    await collection.insertMany([new TestModel({
      name: "i'm your father fk02",
      child: new ChildNode({})
    }), new TestModel({
      name: "miao17game",
      ageNum: Int64.fromString("6876"),
      likes: "3rrgvw3eg",
      data: BsonType.BinaryData,
      gender: true
    })]);
  } catch (e) {
    console.log(e);
  }
}
