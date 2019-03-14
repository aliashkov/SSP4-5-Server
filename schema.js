const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    emperors: [Emperor]
    emperor(idEmperor: ID!): Emperor
  }
  type Emperor {
    idEmperor: ID!
    emperorGrade: Int,
    year: Int
  }
  type Mutation {
    # if false, booking trips failed -- check errors
    updateEmperor(idEmperor: ID!, newGrade: Int , year : Int): Emperor
    addEmperor(idEmperor: ID!, emperorGrade: Int, year:Int ): [Emperor]
    deleteEmperor(idEmperor: ID!, emperorGrade: Int):[Emperor]
  }
`;

module.exports = typeDefs;
