import { Db, MongoClient } from "mongodb";
import { DashboardDoc } from "./models.js";

let db: Db;

export async function connectMongo(uri: string, dbName: string) {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  await db
    .collection<DashboardDoc>("dashboards")
    .createIndex({ userId: 1, name: 1 }, { unique: true });

  return db;
}

export function collections() {
  if (!db) throw new Error("Mongo not connected");
  return {
    dashboards: db.collection<DashboardDoc>("dashboards"),
  };
}
