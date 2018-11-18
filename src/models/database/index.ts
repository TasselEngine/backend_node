import { Connection } from "./driver";
import { TestModel, ChildNode } from "../model/test";
import { BsonType, Int64 } from "./driver/base";
import { MongoFilter } from "./driver/filter";

export async function init() {
  try {
    const connection = await Connection.Create("mongodb://localhost:27017");
    const db = connection.getDatabase("test-database");
    const collection = await db.defineCollection(TestModel);
    // await collection.insertOne(new TestModel({
    //   name: "i'm your father",
    //   child: new ChildNode({})
    // }));
    // await collection.insertOne({
    //   name: "i'm your father",
    //   ageNum: Int64.fromString("234"),
    //   gender: true,
    //   data: BsonType.Date
    // });
    // await collection.insertMany([new TestModel({
    //   name: "i'm your father fk02",
    //   child: new ChildNode({})
    // }), new TestModel({
    //   name: "miao17game",
    //   ageNum: Int64.fromString("6876"),
    //   likes: "3rrgvw3eg",
    //   data: BsonType.BinaryData,
    //   gender: true
    // })]);
    const result = await collection.find(i => i
      .where("data", {
        equal: [BsonType.BinaryData, BsonType.String]
      })
      // .where("gender", {
      //   equal: [true]
      // })
      .where("ageNum", {
        equal: [Int64.fromString("12"), Int64.fromString("333")]
      })
      .where("name", {
        equal: ["woshinidie", "i'm your father fk02"]
      })
    );
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}
