// types for a giraffa node
export default {
  ContentIdentifier: "Hash",
  LinkIdentifier: "u64",
  LinkType: "u32",
  PropertyKey: "u64",
  PropertyValue: {
    _enum: {
      Char32: "[u8; 32]",
      Hash: "Hash",
      Uint64: "u64",
      Bool: "bool",
      AccountId: "AccountId"
    }
  },
  Key: "PropertyKey",
  Value: "PropertyValue"
};
