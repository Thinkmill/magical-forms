type Mapper<
  SourceObjectType extends { [key: string]: any },
  MappedObjectValueType
> = (
  sourceKey: keyof SourceObjectType,
  sourceValue: SourceObjectType[keyof SourceObjectType]
) => MappedObjectValueType;

export function mapObject<
  SourceObjectType extends { [key: string]: any },
  MappedObjectValueType
>(
  source: SourceObjectType,
  mapper: Mapper<SourceObjectType, MappedObjectValueType>
): { [K in keyof SourceObjectType]: MappedObjectValueType } {
  let target: any = {};
  for (const [key, value] of Object.entries(source)) {
    let newValue = mapper(key, value);

    target[key] = newValue;
  }

  return target;
}
