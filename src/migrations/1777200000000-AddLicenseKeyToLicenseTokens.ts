import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLicenseKeyToLicenseTokens1777200000000
  implements MigrationInterface
{
  name = 'AddLicenseKeyToLicenseTokens1777200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'license_tokens',
      new TableColumn({
        name: 'license_key',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('license_tokens', 'license_key');
  }
}
