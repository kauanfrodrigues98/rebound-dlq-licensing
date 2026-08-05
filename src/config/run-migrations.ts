import dataSource from './typeorm-data-source';

async function runMigrations() {
  try {
    await dataSource.initialize();
    await bootstrapLicensingMigrationHistory();
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

async function bootstrapLicensingMigrationHistory() {
  await dataSource.query('CREATE SCHEMA IF NOT EXISTS "licensing"');
  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS licensing.typeorm_migrations (
      id SERIAL PRIMARY KEY,
      timestamp bigint NOT NULL,
      name varchar NOT NULL
    )
  `);
  const [{ legacy_migrations_table: legacyMigrationsTable }] =
    await dataSource.query(`
      SELECT to_regclass('public.typeorm_migrations') AS legacy_migrations_table
    `);

  if (!legacyMigrationsTable) return;

  await dataSource.query(`
    INSERT INTO licensing.typeorm_migrations (timestamp, name)
    SELECT m.timestamp, m.name
    FROM public.typeorm_migrations m
    WHERE m.name IN (
      'InitialLicensingSchema1721433600000',
      'CreateLicensePlans1777100000000',
      'AddLicenseKeyToLicenseTokens1777200000000',
      'MoveLicensingTablesToLicensingSchema1777300000000'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM licensing.typeorm_migrations lm
      WHERE lm.timestamp = m.timestamp
        AND lm.name = m.name
    )
  `);
}

async function closeDataSource() {
  if (!dataSource.isInitialized) return;

  await Promise.race([
    dataSource.destroy(),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
}

runMigrations();
