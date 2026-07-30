import dataSource from './typeorm-data-source';

async function runMigrations() {
  try {
    await dataSource.initialize();
    console.log('Database connected. Running pending migrations...');

    const migrations = await dataSource.runMigrations();

    if (migrations.length === 0) {
      console.log('No pending migrations.');
    } else {
      console.log(`Ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => console.log(`   - ${migration.name}`));
    }

    await closeDataSource();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await closeDataSource();
    process.exit(1);
  }
}

async function closeDataSource() {
  if (!dataSource.isInitialized) return;

  await Promise.race([
    dataSource.destroy(),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
}

runMigrations();
