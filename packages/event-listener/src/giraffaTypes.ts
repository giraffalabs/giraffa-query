// types for a giraffa node
export default {
  ContentIdentifier: "Hash",
  LinkIdentifier: "u64",
  LinkType: "u32",
  PropertyKey: "u64",
  PropertyValue: {
    _enum: {
      Uint64: "u64",
      Char32: "[u8; 32]",
      Bool: "bool",
      Hash: "Hash",
      AccountId: "AccountId"
    }
  },
  Key: "PropertyKey",
  Value: "PropertyValue"
};
