import { Collection, PropertyType, PropertyName, Nullable, ErrorMessage, EnumType } from "../database/driver/decorator";
import { BsonType } from "../database/driver/base";

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

  @Nullable()
  public likes?: string;

  @EnumType(BsonType)
  @ErrorMessage("data should be enum.")
  public data: BsonType = BsonType.String;

}
