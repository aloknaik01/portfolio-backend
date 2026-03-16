import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const schema = `
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY,
    "fullName" VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    "aboutMe" TEXT NOT NULL,
    "portfolioURL" TEXT NOT NULL,
    "githubURL" TEXT,
    "instagramURL" TEXT,
    "twitterURL" TEXT,
    "facebookURL" TEXT,
    "linkedinURL" TEXT,
    "avatarPublicId" TEXT,
    "avatarUrl" TEXT,
    "avatarType" TEXT,
    "resumePublicId" TEXT,
    "resumeUrl" TEXT,
    "heroVideoUrl" TEXT,
    "heroVideoPublicId" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpire" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Project" (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "gitLink" TEXT,
    "projectLink" TEXT,
    technologies TEXT,
    stack VARCHAR(100),
    deployed VARCHAR(50),
    category VARCHAR(255) DEFAULT 'Full Stack',
    "bannerPublicId" TEXT,
    "bannerUrl" TEXT,
    screenshots TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Message" (
    id UUID PRIMARY KEY,
    "senderName" VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Timeline" (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "from" VARCHAR(100) NOT NULL,
    "to" VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Application" (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(100),
    description TEXT,
    "svgPublicId" TEXT,
    "svgUrl" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Skill" (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    proficiency VARCHAR(100),
    category VARCHAR(255) DEFAULT 'UI / Presentation',
    "svgPublicId" TEXT,
    "svgUrl" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);
`;

async function initDB() {
  try {
    console.log("Connecting to database...");
    const client = await pool.connect();
    console.log("Connected! Creating tables...");
    await client.query(schema);
    console.log("All tables created successfully!");
    client.release();
  } catch (err) {
    console.error("Error creating tables:", err.message);
  } finally {
    await pool.end();
  }
}

initDB();
