const fs = require("fs");

const filePath = "emperors.json";
module.exports = {
  Query: {
    emperors: async (_, __, { dataSources }) => {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    },
    emperor: (_, { idEmperor }, { dataSources }) => {
      return JSON.parse(fs.readFileSync(filePath, "utf8")).find(
        launch => launch.idEmperor === idEmperor
      );
    }
  },
  Mutation: {
    updateEmperor: (_, { idEmperor, newGrade, year }, { dataSources }) => {
      const emperors = JSON.parse(fs.readFileSync(filePath, "utf8")).map(
          emperor => {
          if (emperor.idEmperor === idEmperor) {
            emperor.emperorGrade = newGrade;
            emperor.year = year;
          }
          return emperor;
        }
      );
      fs.writeFileSync(filePath, JSON.stringify(emperors));
      return emperors.find(emperor => emperor.idEmperor === idEmperor);
    },
    addEmperor: (_, { idEmperor, emperorGrade, year}, { dataSources }) => {
      const emperors = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (!emperors.some(emperorGrade => emperorGrade.idEmperor === idEmperor)) {
        emperors.push({
          idEmperor,
          emperorGrade,
          year
        });
      }

      fs.writeFileSync(filePath, JSON.stringify(emperors));
      return emperors;
    },
    deleteEmperor: (_, { idEmperor, emperorGrade }, { dataSources }) => {
      const emperors = JSON.parse(fs.readFileSync(filePath, "utf8"));
      let emperorId;
      if (emperors.some(emperorGrade => emperorGrade.idEmperor === idEmperor)) {
        emperorId = idEmperor.id;
        emperors.splice(emperorId, 1);
      }

      fs.writeFileSync(filePath, JSON.stringify(emperors));
      return emperors;
    }
  }
};
