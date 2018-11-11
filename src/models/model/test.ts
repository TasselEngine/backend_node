import { Collection, BsonProperty, PropertyType, PropertyName, Nullable, ErrorMessage } from "../database/driver/decorator";
import { BsonType } from "../database/driver/base";

@Collection("test")
export class TestModel {

  @PropertyType(BsonType.String)
  public name = "";

  @PropertyType(BsonType.Int32)
  @PropertyName("age")
  @ErrorMessage("age shouldn't be empty and must be number value.")
  public ageNum = 0;

  @Nullable()
  public likes?: string;

  @BsonProperty()
  @ErrorMessage("data should be object.")
  public data: any;

}
