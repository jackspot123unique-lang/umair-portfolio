import bcrypt from "bcryptjs";
async function main() {
  const password = process.argv[2];
  if (!password) throw new Error('Usage: npm run password:hash -- "your-password"');
  if (password.length < 12) throw new Error("Password must have at least 12 characters.");
  console.log(await bcrypt.hash(password, 12));
}
main();
