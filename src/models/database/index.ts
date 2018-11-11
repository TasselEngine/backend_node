import { Connection } from "./driver";
import { TestModel } from "../model/test";

export async function init() {
  try {
    const connection = await Connection.Create("mongodb://localhost:27017");
    const db = connection.getDatabase("test-database");
    const collection = await db.defineCollection(TestModel);
    // await collection.insertOne({
    //   name: "miao17game",
    //   ageNum: 23,
    //   likes: "3rrgvw3eg",
    //   data: {}
    // });
    await collection.insertMany([{
      name: "miao17game",
      ageNum: 23,
      likes: "3rrgvw3eg",
      data: {}
    }, {
      name: "miao18game",
      ageNum: 26,
      likes: "3rrgvw3eg",
      data: {}
    }]);
  } catch (e) {
    console.log(e);
  }
}
