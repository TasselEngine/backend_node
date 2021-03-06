import { Collection, PropertyType, PropertyName, Nullable, ErrorMessage, EnumType, Bson } from "../database/driver/decorator";
import { BsonType, Int64 } from "../database/driver/base";

@Bson()
export class ChildNode {

  constructor(initial?: Partial<ChildNode>) {
    Object.assign(this, initial);
  }

  @PropertyType(BsonType.String)
  public name = "sb";

  @PropertyType(BsonType.Int32)
  @PropertyName("age")
  public ageNum = 1000;

}

@Collection("test")
export class TestModel {

  constructor(initial?: Partial<TestModel>) {
    Object.assign(this, initial);
  }

  @PropertyType(BsonType.String)
  public name = "";

  @PropertyType(BsonType.Int64)
  @PropertyName("age")
  @ErrorMessage("age shouldn't be empty and must be long value.")
  public ageNum: Int64 = Int64.fromString("5436356");

  @PropertyType(BsonType.String)
  @Nullable()
  public likes?: string;

  @PropertyType(BsonType.Boolean)
  public gender = false;

  @EnumType(BsonType)
  @ErrorMessage("data should be enum.")
  public data: BsonType = BsonType.String;

  @PropertyType(ChildNode)
  @Nullable()
  public child?: ChildNode;

}
