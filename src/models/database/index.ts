import { Connection } from "./driver";
import { TestModel } from "../model/test";
import { BsonType } from "./driver/base";

export async function init() {
  try {
    const connection = await Connection.Create("mongodb://localhost:27017");
    const db = connection.getDatabase("test-database");
    const collection = await db.defineCollection(TestModel);
    await collection.insertOne(new TestModel({
      name: "i'm your father"
    }));
    await collection.insertMany([{
      name: "miao17game",
      ageNum: 23,
      likes: "3rrgvw3eg",
      data: BsonType.BinaryData,
      gender: true,
      child: null
    }]);
  } catch (e) {
    console.log(e);
  }
}
