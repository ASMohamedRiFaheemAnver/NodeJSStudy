const getDB = require("../db/db");

(async () => {
  const db = await getDB();
  const movie = await db.collection("movies").insertOne({ name: "Kathi", actor: "Vijay" });
  console.log(movie);
})();