import { Collection, PropertyType, PropertyName, Nullable, ErrorMessage, EnumType, Bson } from "../database/driver/decorator";
import { BsonType } from "../database/driver/base";

@Bson()
class ChildNode {

  @PropertyType(BsonType.String)
  name = "sb";

}

@Collection("test")
export class TestModel {

  constructor(initial?: Partial<TestModel>) {
    Object.assign(this, initial);
  }

  @PropertyType(BsonType.String)
  public name = "";

  @PropertyType(BsonType.Int32)
  @PropertyName("age")
  @ErrorMessage("age shouldn't be empty and must be number value.")
  public ageNum = 0;

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
  public child: ChildNode | null = null;

}
