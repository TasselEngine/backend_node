import db from "mongodb";

const MongoDB = db.MongoClient;

export async function init() {
  try {
    const connection = await MongoDB.connect("mongodb://localhost:27017", { useNewUrlParser: true });
    const db = connection.db("main_^RFVB^FYVUUGC%C");
    try {
      const res = await db.collection("demo").updateOne({
        someKey: 123456
      }, { $set: {} }, { upsert: true });

      console.log(`res => ${JSON.stringify(res)}`);
    } catch (_) {

    }
  } catch (e) {
    console.log(e);
  }
}